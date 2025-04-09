from django.urls import path
from . import views

urlpatterns = [
    path('api/reactions/create/', views.create_reaction, name='create_reaction'),
] 