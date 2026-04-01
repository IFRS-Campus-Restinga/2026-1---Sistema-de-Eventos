from django.urls import path
from .views.local_views import LocalListView, LocalDetailView



app_name = 'api'

urlpatterns = [
    # paths relacionados a local
    path("locals/", LocalListView.as_view()),
    path("locals/<int:pk>/", LocalDetailView.as_view()),

]