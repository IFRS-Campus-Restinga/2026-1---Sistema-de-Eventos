from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    email = models.EmailField("email address", unique=True, max_length=254, blank=True, null=True)
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=11, unique=True, blank=True, null=True)
    hub_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    access_profile = models.CharField(max_length=30, null=True, blank=True)

    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_set",
        blank=True,
        db_table="users_user_user_permissions",
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    REQUIRED_FIELDS = ["email", "nome", "cpf"]

    class Meta:
        db_table = "users_user"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return f"Nome:{self.nome}"
