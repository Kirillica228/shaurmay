from ninja_extra import api_controller, http_get, http_post
from ninja_jwt.authentication import JWTAuth
from django.contrib.auth import authenticate

from main.models import Cart, Order, OrderItem
from main.orders.schema import OrderListCreate, OrderSchema, PasswordConfirmIn
from main.schema import MessageOut


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
    
    @http_get("/all", auth=JWTAuth())
    def list_order_all(self, request):
        user = request.user
        cart = Order.objects.filter(user_id=user)
        return [OrderSchema.from_orm(order) for order in cart]