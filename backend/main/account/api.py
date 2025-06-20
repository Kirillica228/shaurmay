from django.db import IntegrityError
from ninja_extra import api_controller, http_get, http_patch, http_post
from django.contrib.auth import get_user_model
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.schema import TokenObtainPairInputSchema, TokenRefreshInputSchema
from ninja_jwt.tokens import RefreshToken
from main.models import UserProfile

from main.schema import MessageOut
from main.account.schema import UserIn

User = get_user_model()

@api_controller("/auth", tags=["Auth"])
class AuthController:
    @http_post("/register", response={201: MessageOut, 400: MessageOut})
    def register(self, user_in: UserIn):
        if User.objects.filter(email=user_in.email).exists():
            return 400, {"message": "Пользователь с таким email уже существует."}
        
        if User.objects.filter(username=user_in.login).exists():
            return 400, {"message": "Пользователь с таким логином уже существует."}
        
        try:
            User.objects.create_user(
                username=user_in.login,
                email=user_in.email,
                password=user_in.password
            )
            return 201, {"message": "Пользователь успешно зарегистрирован."}
        except IntegrityError:
            return 400, {"message": "Произошла ошибка при создании пользователя."}

    @http_post("/login", response={200: dict, 401: MessageOut})
    def login(self, credentials: TokenObtainPairInputSchema):
        user = User.objects.filter(username=credentials.username).first()
        if not user or not user.check_password(credentials.password):
            return 401, {"message": "Неверный логин или пароль."}

        refresh = RefreshToken.for_user(user)
        return 200, {
            "username":f"{credentials.username}",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @http_post("/refresh", response={200: dict, 401: MessageOut})
    def refresh_token(self, refresh_input: TokenRefreshInputSchema):
        try:
            refresh = RefreshToken(refresh_input.refresh)
            return 200, {
                "access": str(refresh.access_token)
            }
        except Exception:
            return 401, {"message": "Неверный refresh token."}  

@api_controller("/users", tags=["Users"])
class UserController:
    @http_get("/me", auth=JWTAuth(), response={200: dict, 403: MessageOut})
    def get_current_user(self, request):
        # Базовые данные пользователя
        user_data = {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        }
        
        # Проверяем наличие профиля
        try:
            profile = request.user.userprofile  # Предполагаем, что есть related_name='userprofile'
            profile_data = {
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "phone": profile.phone,
                # Добавьте другие поля профиля по необходимости
            }
            return 200, {**user_data, **profile_data}
        except AttributeError:
            # Если профиль не существует или связь не настроена
            return 200, user_data
    @http_post(
        "/profile", 
        auth=JWTAuth(), 
        response={201: dict, 400: MessageOut, 403: MessageOut}
    )
    def create_or_update_profile(self, request, data: dict):
        """
        Создает профиль пользователя (если не существует) или обновляет его.
        Принимает first_name, last_name и phone (все поля необязательные).
        """
        user = request.user
        
        # Проверяем, существует ли уже профиль
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Обновляем поля, если они переданы в запросе
        if 'first_name' in data:
            profile.first_name = data['first_name']
        if 'last_name' in data:
            profile.last_name = data['last_name']
        if 'phone' in data:
            profile.phone = data['phone']
        
        profile.save()
        
        if created:
            return 201, {"message": "Profile created successfully", "profile": profile.to_dict()}
        return 200, {"message": "Profile updated successfully", "profile": profile.to_dict()}
    
    @http_patch(
        "/profile", 
        auth=JWTAuth(), 
        response={200: dict, 404: MessageOut, 403: MessageOut}
    )
    def update_profile(self, request, data: dict):
        """
        Обновляет данные профиля пользователя. 
        Принимает first_name, last_name и phone (все поля необязательные).
        """
        user = request.user
        
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return 404, {"message": "Profile not found, please create it first"}
        
        # Обновляем только те поля, которые переданы в запросе
        if 'first_name' in data:
            profile.first_name = data['first_name']
        if 'last_name' in data:
            profile.last_name = data['last_name']
        if 'phone' in data:
            profile.phone = data['phone']
        
        profile.save()
        
        return 200, {"message": "Profile updated successfully", "profile": profile.to_dict()}
