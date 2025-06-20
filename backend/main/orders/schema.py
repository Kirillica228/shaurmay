
from typing import List, Optional
from datetime import datetime
from ninja import Schema


class ProductSchema(Schema):
    id: int
    name: str
    price: int
    weight: int
    constituent: str
    img: str

class OrderSchema(Schema):
    products:List[ProductSchema]
    status:str
    created_at:datetime
    apartment: Optional[str] = None
    entrance: Optional[str] = None
    floor: Optional[str] = None   
    intercom: Optional[str] = None
    street: str 
    
class OrderListCreate(Schema):
    apartment: Optional[str] = None
    entrance: Optional[str] = None
    floor: Optional[str] = None   
    intercom: Optional[str] = None
    street: str 

class PasswordConfirmIn(Schema):
    password: str