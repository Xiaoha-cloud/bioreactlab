from django.urls import path, include
from . import views

urlpatterns = [
    path('api/reactions/create/', views.create_reaction, name='create_reaction'),
    path('api/formula/search/', views.formula_search, name='formula_search'),
    path('api/', include('metabolic.urls')),
] 