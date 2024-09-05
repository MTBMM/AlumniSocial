# tasks.py

from django.utils import timezone
from datetime import timedelta
from .models import User
from django.core.mail import send_mail
from django.utils import timezone


def lock_old_accounts():
    print("aaaa")

    users_to_lock = User.objects.filter(role=User.ROLE_LECTURER, password_changed=False)
    now = timezone.now()

    timeout_duration = timedelta(seconds=2)
    if users_to_lock:

        time_since_creation = now - users_to_lock.date_joined
    if time_since_creation > timeout_duration and users_to_lock:
        send_mail(
            "Mật khẩu của bạn đã bị khóa, hãy liên hệ tới admin",
            "Here is the message.",
            "kiennguyentrung408@gmail.com",
            ["2151053031kien@ou.edu.vn"],
            fail_silently=False,

        )
        users_to_lock.is_active = False
        users_to_lock.save()
        print(f"Đã khóa {users_to_lock.count()} tài khoản.")
