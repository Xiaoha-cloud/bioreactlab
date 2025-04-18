from django.urls import path
from . import views

urlpatterns = [
    path('reaction/check-balance/', views.check_balance, name='check_balance'),
    path('formula/search/', views.search_formula, name='search_formula'),
    path('formula/generate-structure/', views.generate_structure, name='generate_structure'),
    path('metabolite/validate/', views.validate_metabolite, name='validate_metabolite'),
] 