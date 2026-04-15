from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth import authenticate, login, logout


class LoginRateThrottle(AnonRateThrottle):
    rate = "10/minute"


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response(
            {
                "message": "Login successful",
                "user": {"id": user.id, "username": user.username},
            }
        )
    return Response(
        {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logout successful"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response({"id": request.user.id, "username": request.user.username})
