# Generated by Django 5.0.6 on 2024-06-16 07:27

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("alumnisocialnetworkapi", "0002_alter_event_assigned_groups_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="group_notification",
            field=models.ManyToManyField(
                blank=True,
                related_name="group_notifications",
                to="alumnisocialnetworkapi.group",
            ),
        ),
        migrations.AlterField(
            model_name="notification",
            name="user_notification",
            field=models.ManyToManyField(
                blank=True,
                related_name="user_notifications",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]