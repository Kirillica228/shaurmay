from typing import Optional
from django.forms import model_to_dict
from ninja_extra import api_controller, http_delete, http_get, http_post
from ninja_jwt.authentication import JWTAuth

from main.schema import MessageOut
from main.models import Cart, CartItem, Product, typesFood
from main.shops.schema import BasketAddSchema, ProductsResponseSchema


@api_controller("/products",tags=["Product"])
class ProductController:
    @http_get("", response=ProductsResponseSchema)
    def all_products(
        self,
        request,
        q: Optional[str] = None,
        type_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_weight: Optional[float] = None,
        max_weight: Optional[float] = None
    ):
        products = Product.objects.all()

        if q:
            products = products.filter(name__icontains=q)
        if type_id:
            products = products.filter(type_id=type_id)

        product_values = products.values(
            'id', 'name', 'price', 'weight', 'constituent', 'img'
        )

        type_foods = typesFood.objects.all().values('name')

        return {
            "food": list(product_values),
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
