from django.contrib.auth import get_user_model
from django.http import Http404
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from eventos_session.permissions import HasValidSessionToken
from eventos_session.services.token_service import TokenService, TokenValidationError

User = get_user_model()


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def obter_tokens(request):
    external_user_id = request.data.get("user")

    if not external_user_id:
        return Response(
            {"message": "Parâmetro 'user' é obrigatório"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Define se o usuário local já existia antes do vínculo com o Hub.
        local_username = f"hub_{external_user_id}"
        user_preexisting = User.objects.filter(hub_id=external_user_id).exists()
        if not user_preexisting:
            user_preexisting = User.objects.filter(username=local_username).exists()

        # Passa os cookies da requisição para o serviço
        access_token, refresh_token, user_data = TokenService.pair_token(
            external_user_id, request.COOKIES
        )

        user_data["created"] = not user_preexisting

        # [TEMP-FALLBACK] Emitir tokens como cookies HttpOnly para novo fluxo de auth
        response = Response(user_data, status=status.HTTP_200_OK)
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            samesite="Lax",
            secure=False,  # [TEMP-FALLBACK] Usar True em produção com HTTPS
            path="/",
        )
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            samesite="Lax",
            secure=False,  # [TEMP-FALLBACK] Usar True em produção com HTTPS
            path="/",
        )

        return response
    except (ValueError, KeyError, TypeError, TokenValidationError) as exc:
        return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as exc:
        return Response({"message": str(exc)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as exc:
        return Response(
            {"message": f"Erro ao gerar sessão: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def renovar_token(request):
    # Fluxo atual: somente refresh_token em cookie HttpOnly.
    refresh_token = request.COOKIES.get("refresh_token")

    # [TEMP-FALLBACK REMOVIDO] Fallback para Bearer header e request.data desativado.
    # if not refresh_token:
    #     auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    #     if auth_header.startswith("Bearer "):
    #         refresh_token = auth_header.split(" ", 1)[1]
    # if not refresh_token:
    #     refresh_token = request.data.get("refresh_token")

    if not refresh_token:
        return Response(
            {"message": "Refresh token ausente no cookie"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        access_token = TokenService.refresh_token(refresh_token)

        # [TEMP-FALLBACK] Emitir novo access_token como cookie HttpOnly
        response = Response(
            {"message": "Token renovado com sucesso"}, status=status.HTTP_200_OK
        )
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            samesite="Lax",
            secure=False,  # [TEMP-FALLBACK] Usar True em produção com HTTPS
            path="/",
        )

        return response
    except (ValueError, KeyError, TypeError, TokenValidationError) as exc:
        return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as exc:
        return Response({"message": str(exc)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as exc:
        return Response(
            {"message": f"Erro ao renovar sessão: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@authentication_classes([])
@permission_classes([HasValidSessionToken])
def obter_sessao(request):
    try:
        payload = request.session_payload
        external_user_id = payload.get("external_user_id")
        groups = payload.get("groups")
        if not isinstance(groups, list):
            groups = []

        group_name = groups[0] if groups else "user"
        perfil_id = None

        if external_user_id:
            user = User.objects.filter(hub_id=external_user_id).first()
            if user is None:
                user = User.objects.filter(username=f"hub_{external_user_id}").first()

            if user is not None:
                perfil = getattr(user, "perfil", None)
                perfil_id = getattr(perfil, "id", None)

        return Response(
            {
                "id": external_user_id,
                "username": payload.get("username"),
                "display_name": payload.get("display_name") or payload.get("username"),
                "first_name": payload.get("first_name") or "",
                "last_name": payload.get("last_name") or "",
                "email": payload.get("email") or "",
                "cpf": payload.get("cpf") or "",
                "perfil_id": perfil_id,
                "groups": groups,
                "group": group_name,
            },
            status=status.HTTP_200_OK,
        )
    except (ValueError, KeyError, TypeError, TokenValidationError) as exc:
        return Response({"message": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as exc:
        return Response(
            {"message": f"Erro ao obter sessão: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
