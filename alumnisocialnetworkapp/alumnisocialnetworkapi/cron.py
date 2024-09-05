# from .models import *
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.core.mail import send_mail
# from django.utils import timezone
# from datetime import timedelta
# # from django_q.tasks import schedule
# # from django_q.models import Schedule
# from django.template.loader import render_to_string
# from django.core.mail import EmailMultiAlternatives
#
# # @background(schedule=5)  # Chạy mỗi 24 giờ
# # @shared_task
# def check_all_lecturers_password_change_timeout():
#     print("Running scheduled task to check lecturers")
#     now = timezone.now()
#     timeout_duration = timedelta(seconds=5)
#
#     lecturers = User.objects.filter(role=User.ROLE_LECTURER, password_changed__isnull=True)
#     for lecturer in lecturers:
#         time_since_creation = now - lecturer.date_joined
#         if time_since_creation > timeout_duration:
#             lecturer.is_active = False
#             lecturer.save()
#             print(f"Locked account for lecturer: {lecturer.username}")
#
#
# # Schedule the task to run daily
# # check_all_lecturers_password_change_timeout(repeat=5, schedule=timezone.now() + timedelta(seconds=5))  # Repeat every 24 hours
# # schedule(
# #     'alumnisocialnetworkapp.tasks.check_all_lecturers_password_change_timeout',
# #     next_run=timezone.now() + timedelta(seconds=5),
# #     schedule_type=Schedule.MINUTES,  # Hoặc Schedule.HOURS, Schedule.DAILY tùy nhu cầu
# #     repeats=-1  # Số lần lặp lại (-1 để lặp vô hạn)
# # )
#
# @receiver(post_save, sender=Lecturer)
# def send_mail_Lecturer(sender, instance, created, **kwargs):
#     print("gửi mail")
#     if created and instance.role == User.ROLE_LECTURER:
#         lecturer = instance.user
#         lecturer.set_password("@123")
#
#         lecturer.save()
#         # send_mail(
#         #     subject='That’s your subject',
#         #     message='That’s your message body',
#         #     from_email='kiennguyentrung408@gmail.com',
#         #     recipient_list=['2151053031kien@ou.edu.vn', ],
#         #
#         #     fail_silently=False
#         # )
#
#         link = f"http://localhost:8000/"
#
#         merge_data = {
#             'link': link,
#             'username': lecturer.username,
#         }
#         subject = f"Password Reset Request"
#         # text_body = render_to_string("email/password_reset.txt", merge_data)
#         html_body = render_to_string("email/password-reset.html", merge_data)
#
#         msg = EmailMultiAlternatives(
#             subject=subject, from_email='kiennguyentrung408@gmail.com',
#             to=['2151053031kien@ou.edu.vn'], body='reset-password'
#         )
#         msg.attach_alternative(html_body, "text/html")
#         msg.send()
