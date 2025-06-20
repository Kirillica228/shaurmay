from datetime import datetime,timedelta
from typing import List, Optional
from django.db import IntegrityError
from ninja_extra import NinjaExtraAPI, api_controller, http_get, http_patch, http_post,http_delete
from .models import *
from ninja_jwt.schema import TokenObtainPairInputSchema, TokenRefreshInputSchema
from django.contrib.auth import authenticate
from ninja_jwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from ninja_jwt.authentication import JWTAuth
from django.forms.models import model_to_dict
from ninja import Schema
User = get_user_model()

class UserIn(Schema):
    login: str
    email: str
    password: str

class ProductSchema(Schema):
    id: int
    name: str
    price: int
    weight: int
    constituent: str
    img: str

class TypeFoodSchema(Schema):
    name: str

class ProductsResponseSchema(Schema):
    food: List[ProductSchema]
    typeFoods: List[TypeFoodSchema]

class BasketAllSchema(Schema):
    id : int


class MessageOut(Schema):
    message: str

class BasketAddSchema(Schema):
    id : int

class OrderListCreate(Schema):
    apartment: Optional[str] = None
    entrance: Optional[str] = None
    floor: Optional[str] = None   
    intercom: Optional[str] = None
    street: str 

class PasswordConfirmIn(Schema):
    password: str

api = NinjaExtraAPI()

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


@api_controller("/products")
class ProductController:
    @http_get("", response=ProductsResponseSchema)
    def all_products(self):
        products = Product.objects.all().values('id','name', 'price', 'weight', 'constituent', 'img')
        type_foods = typesFood.objects.all().values('name')
        return {
            "food": list(products),
            "typeFoods": list(type_foods)
        }
    

@api_controller("/basket",tags=["Корзина"])
class BasketController:
    @http_get("", auth=JWTAuth(), response={200: list, 404: MessageOut})
    def basket_get_all(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return 404, {"message": "Корзина пуста"}

        return 200, [
            {
                **model_to_dict(item.product, fields=["id", "name", "constituent"]),
                "product_id": item.product.id,
                "quantity": item.quantity,
                "total_price": item.get_total_price(),
                "total_weight": item.get_total_weight(),
                "img": item.product.img.url if item.product.img else ""
            }
            for item in cart.items.select_related("product", "product__typeFood")
        ]

    @http_delete("/clear",auth=JWTAuth(),response={200:MessageOut})
    def basket_clear(self,request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return 404, {"message": "Корзина пуста"}
        cart.items.all().delete()
        return 200,{
            "message":"Корзина очищина!"
        }


    

    @http_post("/add", auth=JWTAuth(), response={200: MessageOut, 403: MessageOut})
    def basket_add_product(self, data: BasketAddSchema, request):
        try:

            cart, _ = Cart.objects.get_or_create(user=request.user)

            product = Product.objects.get(id=data.id)

            CartItem.objects.update_or_create(
                cart=cart,
                product=product,
            )

            return {"message": "Товар добавлен в корзину"}

        except Product.DoesNotExist:
            return {"message": "Такого товара не существует"}

        except Exception as e:
            return {"message": f"Ошибка: {str(e)}"}

    @http_post("/increase", auth=JWTAuth(), response={200: MessageOut, 404: MessageOut})
    def basket_increase_quantity(self, data: BasketAddSchema, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return 404, {"message": "Корзина не найдена"}

        item = CartItem.objects.filter(cart=cart, product_id=data.id).first()
        if not item:
            return 404, {"message": "Товар не найден в корзине"}

        item.quantity += 1
        item.save()
        return {"message": "Количество увеличено"}

    @http_post("/decrease", auth=JWTAuth(), response={200: MessageOut, 404: MessageOut})
    def basket_decrease_quantity(self, data: BasketAddSchema, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return 404, {"message": "Корзина не найдена"}

        item = CartItem.objects.filter(cart=cart, product_id=data.id).first()
        if not item:
            return 404, {"message": "Товар не найден в корзине"}

        if item.quantity <= 1:
            item.delete()
            return {"message": "Товар удалён из корзины"}

        item.quantity -= 1
        item.save()
        return {"message": "Количество уменьшено"}


@api_controller("/order",tags=["Заказ"])
class OrderController:
    @http_post("/checkout", auth=JWTAuth(), response={200: MessageOut})
    def order_create(self, data: OrderListCreate, request):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return MessageOut(message="Корзина пуста или не найдена")

        if not cart.items.exists():
            return MessageOut(message="Корзина пуста")

        order = Order.objects.create(
            user=user,
            street=data.street,
            apartment = data.apartment,
            entrance = data.entrance,
            floor = data.floor,
            intercom = data.intercom
        )

        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity
            )
        cart.items.all().delete()

        return MessageOut(message="Заказ успешно создан")
    
    @http_post("/confirm-password", auth=JWTAuth(), response={200: MessageOut, 401: MessageOut})
    def confirm_password(self, request, data: PasswordConfirmIn):
        user = request.user
        if authenticate(username=user.username, password=data.password):
            return MessageOut(message="Пароль подтверждён")
        return 401, MessageOut(message="Неверный пароль")
    
    
api.register_controllers(ProductController)
api.register_controllers(AuthController)
api.register_controllers(BasketController)
api.register_controllers(OrderController)