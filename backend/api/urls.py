from django.urls import path
from . import views

urlpatterns = [
    path('reaction/check-balance/', views.check_balance, name='check-balance'),
    path('reaction/create/', views.create_reaction, name='create-reaction'),
    path('metabolite/validate/', views.validate_metabolite, name='validate-metabolite'),
    path('formula/search/', views.search_formula, name='search-formula'),
    path('formula/generate-structure/', views.generate_structure, name='generate-structure'),
] 