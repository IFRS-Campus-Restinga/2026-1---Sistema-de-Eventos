from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from eventos_session.permissions import HasValidSessionToken


@api_view(["POST"])
@authentication_classes([])
@permission_classes([HasValidSessionToken])
def logout(_request):
    response = Response({"message": "Sessão encerrada"}, status=status.HTTP_200_OK)
    return response
