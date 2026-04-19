from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Permission

from .models import Usuario


def is_admin_user(user: Usuario) -> bool:
    return bool(user.is_staff or user.is_superuser)


class UsuarioAdminForm(forms.ModelForm):
    class Meta:
        model = Usuario
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        permissions_field = self.fields.get("user_permissions")
        if not permissions_field:
            return

        instance = getattr(self, "instance", None)
        if instance and instance.pk and not is_admin_user(instance):
            permissions_field.queryset = Permission.objects.filter(
                codename__startswith="view_"
            )
            permissions_field.help_text = (
                "Usuarios comuns so podem receber permissoes diretas de visualizacao."
            )


class UsuarioAdminCreationForm(forms.ModelForm):
	password1 = forms.CharField(
		label="Senha",
		required=False,
		widget=forms.PasswordInput,
		help_text="Opcional. Se vazio, o usuário será criado sem login por senha.",
	)
	password2 = forms.CharField(
		label="Confirmar senha",
		required=False,
		widget=forms.PasswordInput,
	)

	class Meta:
		model = Usuario
		fields = (
			"username",
			"nome",
			"email",
			"cpf",
			"matricula",
			"hub_id",
			"access_profile",
		)

	def clean(self):
		cleaned_data = super().clean()
		password1 = cleaned_data.get("password1") or ""
		password2 = cleaned_data.get("password2") or ""

		if password1 or password2:
			if password1 != password2:
				raise forms.ValidationError("As senhas não coincidem.")

		return cleaned_data

	def save(self, commit=True):
		user = super().save(commit=False)
		password = self.cleaned_data.get("password1") or ""

		if password:
			user.set_password(password)
		else:
			user.set_unusable_password()

		if commit:
			user.save()
		return user


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    form = UsuarioAdminForm
    add_form = UsuarioAdminCreationForm
    filter_horizontal = ("user_permissions", "groups")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            "Informacoes pessoais",
            {
                "fields": (
                    "nome",
                    "email",
                    "cpf",
                    "matricula",
                    "hub_id",
                    "access_profile",
                    "first_name",
                    "last_name",
                )
            },
        ),
        ("Status", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Permissoes", {"fields": ("groups", "user_permissions")}),
        ("Datas importantes", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "nome",
                    "email",
                    "cpf",
                    "matricula",
                    "hub_id",
                    "access_profile",
                    "groups",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
    list_display = (
        "username",
        "nome",
        "email",
        "matricula",
        "access_profile",
        "is_staff",
        "is_superuser",
    )
    search_fields = ("username", "nome", "email", "cpf", "matricula", "hub_id")

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        user = form.instance
        if not is_admin_user(user):
            allowed_permissions = user.user_permissions.filter(
                codename__startswith="view_"
            )
            user.user_permissions.set(allowed_permissions)
