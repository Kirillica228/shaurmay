from django.contrib import admin
from .models import *

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')

@admin.register(typesFood)
class typesFoodAdmin(admin.ModelAdmin):
    list_display = ('name',)
