from django.urls import path
from . import views

urlpatterns = [
    path('answercheck', views.answercheck),
    path('canvasData', views.canvasdata),
    path('pageexit', views.pageexit),
    path('suggestions', views.suggestions),
    path(r'<id>', views.maingame),
    path('', views.home),
]
