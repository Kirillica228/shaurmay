from typing import List
from ninja import Schema


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

class BasketAddSchema(Schema):
    id : int