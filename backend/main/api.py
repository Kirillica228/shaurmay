from ninja_extra import NinjaExtraAPI

from main.account.api import AuthController,UserController
from main.shops.api import ProductController,BasketController
from main.orders.api import OrderController

api = NinjaExtraAPI()

api.register_controllers(ProductController)
api.register_controllers(AuthController)
api.register_controllers(BasketController)
api.register_controllers(OrderController)
api.register_controllers(UserController)