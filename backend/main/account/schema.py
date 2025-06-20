from ninja import Schema


class UserIn(Schema):
    login: str
    email: str
    password: str