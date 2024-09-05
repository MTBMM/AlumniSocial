# myapp/signals.py

from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django_q.models import Schedule
from django.utils import timezone
from datetime import timedelta

@receiver(post_migrate)
def create_scheduled_task(sender, **kwargs):
    # Kiểm tra xem task đã được lên lịch chưa
    if not Schedule.objects.filter(func='alumnisocialnetworkapi.tasks.lock_old_accounts').exists():
        # Lên lịch task để chạy mỗi giờ
        Schedule.objects.create(
            func='alumnisocialnetworkapi.tasks.lock_old_accounts',
            schedule_type='I',  # Lịch trình mỗi giây
            next_run=timezone.now() + timedelta(seconds=1)  # Thực thi sau mỗi giây
        )
