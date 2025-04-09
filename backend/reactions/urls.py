from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_reaction, name='create_reaction'),
] 