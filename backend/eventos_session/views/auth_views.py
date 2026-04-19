from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from eventos_session.permissions import HasValidSessionToken


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def system_id(request):
    return Response({"system": settings.SYSTEM_ID}, status=status.HTTP_200_OK)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([HasValidSessionToken])
def logout(request):
    response = Response({"message": "Sessão encerrada"}, status=status.HTTP_200_OK)
    # [TEMP-FALLBACK] Deletar cookies de autenticação HttpOnly
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return response
