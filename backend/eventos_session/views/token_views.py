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
        # Passa os cookies da requisição para o serviço
        access_token, refresh_token, user_data = TokenService.pair_token(
            external_user_id, request.COOKIES
        )

        response = Response({
            "access_token": access_token,
            "refresh_token": refresh_token,
            **user_data
        }, status=status.HTTP_200_OK)

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
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    refresh_token = None
    if auth_header.startswith("Bearer "):
        refresh_token = auth_header.split(" ", 1)[1]
    if not refresh_token:
        refresh_token = request.data.get("refresh_token")

    try:
        access_token = TokenService.refresh_token(refresh_token)

        response = Response(
            {"access_token": access_token, "message": "Token renovado com sucesso"}, status=status.HTTP_200_OK
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
        groups = payload.get("groups")
        if not isinstance(groups, list):
            groups = []

        group_name = groups[0] if groups else "user"

        return Response(
            {
                "id": payload.get("external_user_id"),
                "username": payload.get("username"),
                "display_name": payload.get("display_name") or payload.get("username"),
                "first_name": payload.get("first_name") or "",
                "last_name": payload.get("last_name") or "",
                "email": payload.get("email") or "",
                "cpf": payload.get("cpf") or "",
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
