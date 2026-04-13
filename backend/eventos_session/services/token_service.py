from datetime import datetime, timedelta, timezone
import logging

import jwt
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from jwt.exceptions import InvalidTokenError

try:
    from fs_auth_middleware.utils import jwt_decode as fs_jwt_decode
except Exception:  # pragma: no cover - fallback para projetos sem fs_auth_middleware
    def fs_jwt_decode(token: str, key: str, algorithms: list[str]) -> dict:
        return jwt.decode(token, key, algorithms=algorithms)

User = get_user_model()
logger = logging.getLogger(__name__)


def get_setting(name: str, default):
    return getattr(settings, name, default)


def is_admin_user(user) -> bool:
    return bool(getattr(user, "is_superuser", False) or getattr(user, "is_staff", False))


def filter_permissions_for_user(user, permissions: list[str]) -> list[str]:
    if is_admin_user(user):
        return sorted(set(permissions))
    return sorted({permission for permission in permissions if permission.split(".")[-1].startswith("view_")})


class TokenValidationError(Exception):
    pass


class UniqueConstraintViolationError(TokenValidationError):
    """Levantado quando uma constraint de unicidade é violada."""
    pass


def normalize_cpf(value: str | None) -> str:
    """Normaliza CPF para apenas digitos e limita ao tamanho do campo."""
    text = str(value or "")
    digits = "".join(ch for ch in text if ch.isdigit())
    return digits[:11]


def normalize_cpf_or_none(value: str | None) -> str | None:
    """Retorna CPF normalizado ou None quando não houver valor válido."""
    digits = normalize_cpf(value)
    return digits or None


def is_valid_cpf(cpf: str | None) -> bool:
    digits = normalize_cpf(cpf)
    if len(digits) != 11:
        return False
    if digits == digits[0] * 11:
        return False

    nums = [int(ch) for ch in digits]

    sum1 = sum(num * weight for num, weight in zip(nums[:9], range(10, 1, -1)))
    check1 = (sum1 * 10) % 11
    if check1 == 10:
        check1 = 0
    if check1 != nums[9]:
        return False

    sum2 = sum(num * weight for num, weight in zip(nums[:10], range(11, 1, -1)))
    check2 = (sum2 * 10) % 11
    if check2 == 10:
        check2 = 0
    return check2 == nums[10]


def find_valid_cpf_anywhere(value) -> str:
    """Busca um CPF valido em qualquer valor string/numero dentro do payload."""
    if isinstance(value, dict):
        for child in value.values():
            candidate = find_valid_cpf_anywhere(child)
            if candidate:
                return candidate
        return ""

    if isinstance(value, list):
        for item in value:
            candidate = find_valid_cpf_anywhere(item)
            if candidate:
                return candidate
        return ""

    digits = normalize_cpf(value)
    if is_valid_cpf(digits):
        return digits
    return ""


def find_cpf_candidate(value) -> str:
    """Procura CPF em estruturas aninhadas usando heurística por nome de chave."""
    if isinstance(value, dict):
        # Prioriza chaves exatas mais comuns
        for key in ("cpf", "cpf_cnpj", "documento", "document"):
            if key in value:
                candidate = normalize_cpf(value.get(key))
                if candidate:
                    return candidate

        # Depois tenta chaves que contenham 'cpf' em qualquer nível
        for key, child in value.items():
            if "cpf" in str(key).lower():
                candidate = normalize_cpf(child)
                if candidate:
                    return candidate

        for child in value.values():
            candidate = find_cpf_candidate(child)
            if candidate:
                return candidate

    elif isinstance(value, list):
        for item in value:
            candidate = find_cpf_candidate(item)
            if candidate:
                return candidate

    return ""


def email_to_display_name(email: str | None) -> str:
    text = str(email or "").strip()
    if not text or "@" not in text:
        return ""

    local_part = text.split("@", 1)[0]
    cleaned = local_part.replace(".", " ").replace("_", " ").replace("-", " ").strip()
    return cleaned.title()


def split_name_from_username(username: str | None) -> tuple[str, str]:
    text = str(username or "").strip()
    if not text:
        return "", ""

    parts = [p for p in text.replace("_", " ").replace("-", " ").split() if p]
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def is_technical_username(value: str | None) -> bool:
    text = str(value or "").strip().lower()
    return text.startswith("hub_") or "@" not in text


def build_hub_auth_cookies(request_cookies: dict | None) -> dict:
    """Extrai apenas cookies de autenticacao reutilizaveis no Hub."""
    if not request_cookies:
        return {}

    allowed = ("access_token", "refresh_token", "sessionid", "csrftoken")
    return {
        name: value
        for name, value in ((k, request_cookies.get(k)) for k in allowed)
        if value
    }


class ExternalUserService:
    @staticmethod
    def _pick_first_non_empty(*values):
        for value in values:
            if value is None:
                continue
            text = str(value).strip()
            if text:
                return text
        return ""

    @staticmethod
    def _extract_user_payload(data: dict) -> dict:
        if not isinstance(data, dict):
            return {}

        if isinstance(data.get("user"), dict):
            return data.get("user")
        if isinstance(data.get("data"), dict):
            return data.get("data")
        return data

    @staticmethod
    def get_user_additional_info(
        external_user_id: str, request_cookies: dict | None = None
    ) -> dict:
        """Busca dados adicionais do usuário (ex.: CPF) no Hub."""
        base_system_url = str(get_setting("BASE_SYSTEM_URL", "")).strip()
        if not base_system_url:
            return {}

        cookies = build_hub_auth_cookies(request_cookies)
        if not cookies:
            return {}

        url = (
            f"{base_system_url.rstrip('/')}/api/users/additional_infos/get/{external_user_id}/"
        )

        try:
            response = requests.get(
                url,
                params={"fields": "cpf"},
                cookies=cookies,
                timeout=10,
            )
            response.raise_for_status()
            payload = ExternalUserService._extract_user_payload(response.json())

            cpf = ExternalUserService._pick_first_non_empty(
                payload.get("cpf"),
                payload.get("documento"),
                payload.get("document"),
                find_cpf_candidate(payload),
                find_valid_cpf_anywhere(payload),
            )
            return {"cpf": cpf}
        except requests.RequestException as exc:
            logger.warning(
                "Falha ao buscar additional_infos para external_user_id=%s: %s",
                external_user_id,
                exc,
            )
            return {}

    @staticmethod
    def get_user_data(external_user_id: str, request_cookies: dict | None = None) -> dict:
        base_system_url = str(get_setting("BASE_SYSTEM_URL", "")).strip()
        if not base_system_url:
            technical = f"hub_{external_user_id}"
            return {
                "id": external_user_id,
                "username": technical,
                "display_name": technical,
                "groups": [],
            }

        hub_cookies = build_hub_auth_cookies(request_cookies)
        if not hub_cookies:
            technical = f"hub_{external_user_id}"
            return {
                "id": external_user_id,
                "username": technical,
                "display_name": technical,
                "groups": [],
            }

        url = (
            f"{base_system_url.rstrip('/')}/api/users/get/{external_user_id}/"
        )

        try:
            identity_response = requests.get(
                url,
                params={"fields": "id,username,email,nome,cpf"},
                cookies=hub_cookies,
                timeout=10,
            )
            identity_response.raise_for_status()
            identity_data = ExternalUserService._extract_user_payload(identity_response.json())

            raw_username = str(identity_data.get("username") or "").strip()
            technical = f"hub_{external_user_id}"
            username = raw_username or technical
            display_name = username

            if is_technical_username(display_name):
                display_name = (
                    email_to_display_name(identity_data.get("email")) or technical
                )

            group_names = []
            try:
                groups_response = requests.get(
                    url,
                    params={"fields": "groups.name"},
                    cookies=hub_cookies,
                    timeout=10,
                )
                groups_response.raise_for_status()
                groups_data = groups_response.json()
                logger.warning(
                    "[Hub groups] raw response for user %s: %s",
                    external_user_id,
                    groups_data,
                )

                raw_groups = groups_data.get("groups", [])
                for group in raw_groups:
                    if isinstance(group, dict):
                        name = group.get("name")
                        if name:
                            group_names.append(name)
                    elif isinstance(group, str) and group:
                        # Hub pode retornar lista de strings em vez de objetos
                        group_names.append(group)
            except requests.RequestException:
                group_names = []

            logger.warning(
                "[Hub groups] parsed group_names for user %s: %s",
                external_user_id,
                group_names,
            )

            additional_info = ExternalUserService.get_user_additional_info(
                external_user_id, request_cookies
            )

            return {
                "id": str(identity_data.get("id", external_user_id)),
                "username": username,
                "display_name": display_name,
                "email": str(identity_data.get("email") or "").strip(),
                "cpf": ExternalUserService._pick_first_non_empty(
                    additional_info.get("cpf"),
                    identity_data.get("cpf"),
                    identity_data.get("documento"),
                    identity_data.get("document"),
                    find_cpf_candidate(identity_data),
                ),
                "groups": group_names,
            }
        except requests.RequestException:
            technical = f"hub_{external_user_id}"
            return {
                "id": external_user_id,
                "username": technical,
                "display_name": technical,
                "email": "",
                "cpf": "",
                "groups": [],
            }

    @staticmethod
    def get_user_complete_data(external_user_id: str, request_cookies: dict = None) -> dict:
        """
        Busca dados completos do usuário do Hub via /api/users/get/data/
        """
        base_system_url = str(get_setting("BASE_SYSTEM_URL", "")).strip()
        if not base_system_url:
            return {}

        url = f"{base_system_url.rstrip('/')}/api/users/get/data/"

        cookies = build_hub_auth_cookies(request_cookies)
        if not cookies:
            return {}

        try:
            response = requests.get(
                url,
                params={
                    "fields": "id,username,email,nome,cpf,access_profile"
                },
                cookies=cookies,
                timeout=10,
            )
            response.raise_for_status()
            data = ExternalUserService._extract_user_payload(response.json())
            additional_info = ExternalUserService.get_user_additional_info(
                external_user_id, request_cookies
            )

            cpf_value = ExternalUserService._pick_first_non_empty(
                additional_info.get("cpf"),
                data.get("cpf"),
                data.get("documento"),
                data.get("document"),
                find_cpf_candidate(data),
                find_valid_cpf_anywhere(data),
            )

            # Fallback: alguns ambientes do Hub não retornam CPF no /get/data,
            # mas retornam no endpoint por id.
            if not cpf_value and external_user_id:
                detail_url = f"{base_system_url.rstrip('/')}/api/users/get/{external_user_id}/"
                detail_response = requests.get(
                    detail_url,
                    params={"fields": "id,username,email,nome,cpf"},
                    cookies=cookies,
                    timeout=10,
                )
                detail_response.raise_for_status()
                detail_data = ExternalUserService._extract_user_payload(detail_response.json())
                cpf_value = ExternalUserService._pick_first_non_empty(
                    cpf_value,
                    detail_data.get("cpf"),
                    detail_data.get("documento"),
                    detail_data.get("document"),
                    find_cpf_candidate(detail_data),
                    find_valid_cpf_anywhere(detail_data),
                )

                # Completa campos básicos quando vierem vazios no /get/data.
                data = {
                    **detail_data,
                    **data,
                    "cpf": cpf_value,
                    "email": ExternalUserService._pick_first_non_empty(
                        data.get("email"), detail_data.get("email")
                    ),
                    "nome": ExternalUserService._pick_first_non_empty(
                        data.get("nome"), detail_data.get("nome"), detail_data.get("username")
                    ),
                }

            # Retorna os dados mapeados
            mapped_data = {
                "id": data.get("id"),
                "username": data.get("username"),
                "email": data.get("email") or "",  # Garante que email não seja None
                "nome": data.get("nome") or data.get("username", ""),  # Usa username como fallback para nome
                "cpf": cpf_value,
                "access_profile": data.get("access_profile", ""),
            }

            if not mapped_data["cpf"]:
                logger.warning(
                    "Hub nao retornou CPF para external_user_id=%s; keys=%s",
                    external_user_id,
                    sorted(list(data.keys())),
                )
            
            return mapped_data
            
        except requests.RequestException as e:
            logger.warning(
                "Falha ao buscar dados completos do Hub para external_user_id=%s: %s",
                external_user_id,
                e,
            )
            # Em caso de erro, retorna dicionário vazio
            # O sistema continuará funcionando com dados básicos
            return {}


class TokenMetadataService:
    @staticmethod
    def get(user) -> dict:
        groups = list(user.groups.values_list("name", flat=True))
        permissions = list(user.get_all_permissions())
        return {
            "groups": groups,
            "permissions": filter_permissions_for_user(user, permissions),
        }


class TokenValidationService:
    @staticmethod
    def validate(payload: dict):
        try:
            user_id = int(payload["local_user_id"])
        except (KeyError, TypeError, ValueError) as exc:
            raise TokenValidationError("Usuário inválido no token") from exc

        user = get_object_or_404(User, pk=user_id)
        return user


class UniqueValidationService:
    """Valida constraints de unicidade para Usuario antes de criar/atualizar."""

    @staticmethod
    def validate_cpf(cpf: str | None, exclude_user_id: int | None = None) -> None:
        """Valida se CPF é único no sistema."""
        if not cpf or cpf.strip() == "":
            return  # Permite CPF vazio
        
        query = User.objects.filter(cpf=cpf)
        if exclude_user_id:
            query = query.exclude(id=exclude_user_id)
        
        if query.exists():
            raise UniqueConstraintViolationError(
                f"CPF '{cpf}' já registrado no sistema. "
                f"Por favor, verifique seus dados."
            )

    @staticmethod
    def validate_email(email: str, exclude_user_id: int | None = None) -> None:
        """Valida se email é único no sistema."""
        if not email or email.strip() == "":
            return  # Permite email vazio
        
        query = User.objects.filter(email=email)
        if exclude_user_id:
            query = query.exclude(id=exclude_user_id)
        
        if query.exists():
            raise UniqueConstraintViolationError(
                f"Email '{email}' já está associado a outra conta. "
                f"Por favor, use um email diferente."
            )

    @staticmethod
    def validate_hub_id(hub_id: str, exclude_user_id: int | None = None) -> None:
        """Valida se hub_id é único no sistema."""
        if not hub_id or hub_id.strip() == "":
            return  # Permite hub_id vazio
        
        query = User.objects.filter(hub_id=hub_id)
        if exclude_user_id:
            query = query.exclude(id=exclude_user_id)
        
        if query.exists():
            raise UniqueConstraintViolationError(
                f"Usuário do Hub '{hub_id}' já existe no sistema. "
                f"Falha ao sincronizar usuário."
            )

    @staticmethod
    def validate_all(cpf: str | None, email: str | None, hub_id: str | None, exclude_user_id: int | None = None) -> None:
        """Valida todos os constraints de unicidade de uma vez."""
        UniqueValidationService.validate_cpf(cpf, exclude_user_id)
        UniqueValidationService.validate_email(email, exclude_user_id)
        UniqueValidationService.validate_hub_id(hub_id, exclude_user_id)


class TokenService:
    @staticmethod
    def pair_token(external_user_id: str, request_cookies: dict = None) -> tuple[str, str, dict]:
        now = datetime.now(timezone.utc)
        refresh_exp = now + timedelta(days=get_setting("JWT_REFRESH_TOKEN_EXPIRE_DAYS", 1))
        jwt_secret = get_setting("JWT_SECRET_KEY", settings.SECRET_KEY)
        jwt_algorithm = get_setting("JWT_ALGORITHM", "HS256")

        external_data = ExternalUserService.get_user_data(external_user_id, request_cookies)
        complete_data = ExternalUserService.get_user_complete_data(external_user_id, request_cookies)
        additional_info = ExternalUserService.get_user_additional_info(
            external_user_id, request_cookies
        )

        # Regra de negócio: só persiste usuário local após coletar dados do Hub.
        if not external_data:
            raise TokenValidationError(
                "Falha ao consultar dados do usuário no Hub (/api/users/get/<id>/)."
            )

        if not complete_data:
            raise TokenValidationError(
                "Falha ao consultar dados completos no Hub (/api/users/get/data/)."
            )

        if not additional_info:
            raise TokenValidationError(
                "Falha ao consultar dados adicionais no Hub (/api/users/additional_infos/get/<id>/)."
            )
        
        technical = f"hub_{external_user_id}"
        username = external_data.get("username", technical)
        display_name = external_data.get("display_name", username)
        first_name, last_name = split_name_from_username(username)
        email = (complete_data.get("email") or external_data.get("email") or "").strip()
        email = email or None
        cpf = normalize_cpf_or_none(
            additional_info.get("cpf")
            or complete_data.get("cpf")
            or external_data.get("cpf")
        )

        # O usuário local é apenas um vínculo técnico estável com o id externo.
        local_username = f"hub_{external_user_id}"

        # Prepara os dados padrão com valores vazios
        user_defaults = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "nome": display_name[:255],  # Campo obrigatório do modelo personalizado
            "cpf": cpf,
            "hub_id": external_user_id,  # ID do HUB
            "access_profile": "",
        }

        # Atualiza com dados completos se disponíveis
        if complete_data:
            user_defaults.update({
                "email": (complete_data.get("email") or user_defaults["email"] or "").strip() or None,
                "nome": complete_data.get("nome", user_defaults["nome"])[:255],
                "cpf": normalize_cpf_or_none(complete_data.get("cpf")) or user_defaults["cpf"],
                "access_profile": complete_data.get("access_profile", user_defaults["access_profile"]),
            })

        # Valida unicidade para CPF, email e hub_id antes de persistir.
        # Prioriza vínculo por ID externo (hub_id), com fallback para username técnico.
        existing_user = User.objects.filter(hub_id=external_user_id).first()
        if not existing_user:
            existing_user = User.objects.filter(username=local_username).first()

        if existing_user:
            UniqueValidationService.validate_all(
                cpf=user_defaults.get("cpf"),
                email=user_defaults.get("email"),
                hub_id=user_defaults.get("hub_id"),
                exclude_user_id=existing_user.id,
            )
        else:
            UniqueValidationService.validate_all(
                cpf=user_defaults.get("cpf"),
                email=user_defaults.get("email"),
                hub_id=user_defaults.get("hub_id"),
            )

        if existing_user:
            user = existing_user
            created = False
            user.username = local_username
            user.hub_id = external_user_id
            user.first_name = user_defaults["first_name"]
            user.last_name = user_defaults["last_name"]
            user.email = user_defaults["email"]
            user.nome = user_defaults["nome"]
            user.cpf = user_defaults["cpf"]
            user.access_profile = user_defaults["access_profile"]
            user.save()
        else:
            user = User.objects.create(username=local_username, **user_defaults)
            created = True

        # Usuarios comuns so podem manter permissões locais de visualizacao.
        if not is_admin_user(user):
            allowed_permissions = user.user_permissions.filter(codename__startswith="view_")
            if user.user_permissions.exclude(codename__startswith="view_").exists():
                user.user_permissions.set(allowed_permissions)

        # Se o usuário já existia, reforça atualização com os dados mais recentes do Hub.
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.email = (complete_data.get("email") or external_data.get("email") or user.email or "").strip() or None
            if complete_data:
                user.nome = complete_data.get("nome", user.nome)[:255]
                user.access_profile = complete_data.get("access_profile", user.access_profile)
            user.cpf = normalize_cpf_or_none(complete_data.get("cpf") or external_data.get("cpf"))
            user.save()

        # Preserva último nome amigável conhecido e evita sobrescrever por id técnico.
        if not is_technical_username(display_name):
            user.nome = display_name[:255]
            user.save(update_fields=["nome"])
        elif user.nome and not is_technical_username(user.nome):
            display_name = user.nome

        metadata = TokenMetadataService.get(user)

        access_payload = {
            "iat": now,
            "exp": now + timedelta(minutes=get_setting("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30)),
            "local_user_id": user.id,
            "external_user_id": external_user_id,
            "username": username,
            "display_name": display_name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "cpf": user.cpf,
            **metadata,
        }

        refresh_payload = {
            "iat": now,
            "exp": refresh_exp,
            "local_user_id": user.id,
            "external_user_id": external_user_id,
            "username": username,
            "display_name": display_name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "cpf": user.cpf,
            **metadata,
        }

        access_token = jwt.encode(access_payload, jwt_secret, algorithm=jwt_algorithm)
        refresh_token = jwt.encode(refresh_payload, jwt_secret, algorithm=jwt_algorithm)

        user_data = {
            "id": str(external_user_id),
            "username": username,
            "display_name": display_name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "cpf": user.cpf,
            "groups": metadata["groups"],
            "group": metadata["groups"][0] if metadata["groups"] else "user",
        }

        return str(access_token), str(refresh_token), user_data

    @staticmethod
    def refresh_token(refresh_token: str) -> str:
        payload = TokenService.decode_token(refresh_token)
        TokenValidationService.validate(payload)

        now = datetime.now(timezone.utc)
        jwt_secret = get_setting("JWT_SECRET_KEY", settings.SECRET_KEY)
        jwt_algorithm = get_setting("JWT_ALGORITHM", "HS256")

        access_payload = {
            "iat": now,
            "exp": now + timedelta(minutes=get_setting("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30)),
            **payload,
        }

        access_token = jwt.encode(access_payload, jwt_secret, algorithm=jwt_algorithm)

        return str(access_token)

    @staticmethod
    def decode_token(token: str) -> dict:
        if not token:
            raise TokenValidationError("Token ausente")

        jwt_secret = get_setting("JWT_SECRET_KEY", settings.SECRET_KEY)
        jwt_algorithm = get_setting("JWT_ALGORITHM", "HS256")

        try:
            return fs_jwt_decode(token, jwt_secret, algorithms=[jwt_algorithm])
        except InvalidTokenError as exc:
            raise TokenValidationError("Token inválido") from exc
