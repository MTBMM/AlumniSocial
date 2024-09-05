from django.apps import AppConfig


class AlumnisocialnetworkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'alumnisocialnetworkapi'

    def ready(self):
        import alumnisocialnetworkapi.signals  # Import để đảm bảo signals được đăng ký