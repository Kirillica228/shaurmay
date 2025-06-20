from django.db import models
from django.contrib.auth.models import User

class typesFood(models.Model):
    name = models.CharField(max_length=50)

class Product(models.Model):
    name = models.TextField()
    weight = models.IntegerField()
    price = models.IntegerField()
    constituent = models.TextField()
    img = models.FileField(upload_to="food/")
    typeFood = models.ForeignKey(typesFood,on_delete=models.CASCADE)
    
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through='CartItem')

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.cartitem_set.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def get_total_price(self):
        return self.product.price * self.quantity
    
    def get_total_weight(self):
        return self.product.weight * self.quantity
    

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through='OrderItem')
    street = models.CharField(max_length=255)
    apartment = models.CharField(max_length=20, blank=True, null=True)
    entrance = models.CharField(max_length=20, blank=True, null=True)
    floor = models.CharField(max_length=20, blank=True, null=True)
    intercom = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[("created", "Создан"), ("processing", "В обработке"),
                 ("done", "Завершён"), ("cancelled", "Отменён")],
        default="created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.orderitem_set.all())

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
 
    def get_total_price(self):
        return self.product.price * self.quantity


class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    first_name = models.TextField(blank=True)
    last_name = models.TextField(blank=True)
    phone = models.CharField(max_length=11)