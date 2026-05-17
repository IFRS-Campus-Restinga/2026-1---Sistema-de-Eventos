import os
from celery import Celery

# Define as configurações padrão do Django para o Celery ler
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Cria a instância do aplicativo Celery
app = Celery("backend")

# Lê as configurações do settings.py que começam com o prefixo 'CELERY_'
app.config_from_object("django.conf:settings", namespace="CELERY")

# Faz o Celery procurar automaticamente por um arquivo 'tasks.py' dentro do app 'emails'
app.autodiscover_tasks()
