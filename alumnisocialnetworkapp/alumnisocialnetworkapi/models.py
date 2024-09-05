from enum import Enum
from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.core.mail import send_mail
# from django.utils import timezone
# from datetime import timedelta
# # from django_q.tasks import schedule
# # from django_q.models import Schedule
# from django.template.loader import render_to_string
# from django.core.mail import EmailMultiAlternatives


class User(AbstractUser):
    ROLE_ALUMNI = 'alumni'
    ROLE_LECTURER = 'lecturer'
    ROLE_ADMIN = 'admin'
    ROLE_CHOICES = [
        (ROLE_ALUMNI, 'Cựu sinh viên'),
        (ROLE_LECTURER, 'Giảng viên'),
        (ROLE_ADMIN, 'Quản trị viên'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    password_changed = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class Alumni(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    student_id = models.CharField(max_length=20, unique=True)
    avatar = CloudinaryField('avatar', blank=False)
    cover = CloudinaryField('cover', blank=True)


class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

#
# @receiver(post_save, sender=User)
# def send_mail_Lecturer(sender, instance, created, **kwargs):
#     if created and instance.role == User.ROLE_LECTURER:
#         lecturer = instance
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


class Administrator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)


class BasePost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    content = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Post(BasePost):
    image = CloudinaryField('PostImage', blank=True)
    reactions = models.ManyToManyField(User, through='PostReaction', related_name='post_reactions', blank=True)
    allow_comments = models.BooleanField(default=True)


class Group(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='user_groups', null=True)


class PostReaction(models.Model):
    REACTION_CHOICES = (
        ('like', 'Like'),
        ('haha', 'Haha'),
        ('heart', 'Thả tim'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    # count = models.IntegerField(default=0)


class Comment(BasePost):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_comment')


class Survey(BasePost):
    title = models.CharField(max_length=255)


class SurveyQuestion(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    question_text = models.TextField()
    users = models.ManyToManyField('User', through='SurveyQuestionAnswer', related_name='survey_questions')


class SurveyAnswer(models.Model):
    question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE)
    answer_text = models.CharField(max_length=255)
    count = models.IntegerField(default=0)


class SurveyQuestionAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE)
    answer = models.ForeignKey(SurveyAnswer, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.question.question_text} - {self.answer.answer_text}"


class Event(BasePost):
    title = models.CharField(max_length=255)
    assigned_groups = models.ManyToManyField(Group, related_name='assigned_events', blank=True, null=True)


class Notification(models.Model):
    user_notification = models.ManyToManyField(User, related_name='user_notifications', blank=True)
    group_notification = models.ManyToManyField(Group, related_name='group_notifications', blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
