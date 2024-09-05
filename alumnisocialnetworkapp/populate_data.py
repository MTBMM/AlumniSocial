import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alumnisocialnetworkapp.settings')
django.setup()

from alumnisocialnetworkapi.models import (User, Alumni, Lecturer, Administrator, Post, Comment, PostReaction, Survey, SurveyQuestion, \
                                           SurveyAnswer, Group, Event, Notification)

user_alumni_1 = User.objects.create_user(username='alumni1', password='1', role=User.ROLE_ALUMNI)
user_alumni_2 = User.objects.create_user(username='alumni2', password='2', role=User.ROLE_ALUMNI)
user_alumni_3 = User.objects.create_user(username='alumni3', password='3', role=User.ROLE_ALUMNI)
user_alumni_4 = User.objects.create_user(username='alumni4', password='4', role=User.ROLE_ALUMNI)
user_alumni_5 = User.objects.create_user(username='alumni5', password='5', role=User.ROLE_ALUMNI)
user_alumni_6 = User.objects.create_user(username='alumni6', password='6', role=User.ROLE_ALUMNI)
user_alumni_7 = User.objects.create_user(username='alumni7', password='7', role=User.ROLE_ALUMNI)
user_alumni_8 = User.objects.create_user(username='alumni8', password='8', role=User.ROLE_ALUMNI)
user_alumni_9 = User.objects.create_user(username='alumni9', password='9', role=User.ROLE_ALUMNI)
user_alumni_10 = User.objects.create_user(username='alumni10', password='10', role=User.ROLE_ALUMNI)
user_alumni_11 = User.objects.create_user(username='alumni11', password='11', role=User.ROLE_ALUMNI)
user_alumni_12 = User.objects.create_user(username='alumni12', password='12', role=User.ROLE_ALUMNI)
user_alumni_13 = User.objects.create_user(username='alumni13', password='13', role=User.ROLE_ALUMNI)
user_alumni_14 = User.objects.create_user(username='alumni14', password='14', role=User.ROLE_ALUMNI)

user_lecturer_1 = User.objects.create_user(username='le_van_c', password='matkhau', role=User.ROLE_LECTURER)
user_lecturer_2 = User.objects.create_user(username='pham_thi_d', password='matkhau', role=User.ROLE_LECTURER)
user_admin = User.objects.create_user(username='hoang_van_e', password='matkhau', role=User.ROLE_ADMIN)

alumni_1 = Alumni.objects.create(user=user_alumni_1, student_id='S123451', avatar='path/to/avatar',
                                 cover='path/to/cover')
alumni_2 = Alumni.objects.create(user=user_alumni_2, student_id='S123462', avatar='path/to/avatar',
                                 cover='path/to/cover')
alumni_3 = Alumni.objects.create(user=user_alumni_3, student_id='S123453', avatar='path/to/avatar',
                                cover='path/to/cover')

alumni_4 = Alumni.objects.create(user=user_alumni_4, student_id='S123454', avatar='path/to/avatar', cover='path/to/cover')

alumni_5 = Alumni.objects.create(user=user_alumni_5, student_id='S123455', avatar='path/to/avatar', cover='path/to/cover')

alumni_6 = Alumni.objects.create(user=user_alumni_6, student_id='S123456', avatar='path/to/avatar', cover='path/to/cover')

alumni_7 = Alumni.objects.create(user=user_alumni_7, student_id='S123457', avatar='path/to/avatar', cover='path/to/cover')
alumni_8 = Alumni.objects.create(user=user_alumni_8, student_id='S123458', avatar='path/to/avatar', cover='path/to/cover')
alumni_9 = Alumni.objects.create(user=user_alumni_9, student_id='S123459', avatar='path/to/avatar', cover='path/to/cover')
alumni_10 = Alumni.objects.create(user=user_alumni_10, student_id='S1234510', avatar='path/to/avatar',cover='path/to/cover')
alumni_11 = Alumni.objects.create(user=user_alumni_11, student_id='S1234511', avatar='path/to/avatar', cover='path/to/cover')
alumni_12 = Alumni.objects.create(user=user_alumni_12, student_id='S1234512', avatar='path/to/avatar', cover='path/to/cover')
alumni_13 = Alumni.objects.create(user=user_alumni_13, student_id='S1234513', avatar='path/to/avatar', cover='path/to/cover')
alumni_14 = Alumni.objects.create(user=user_alumni_14, student_id='S1234514', avatar='path/to/avatar', cover='path/to/cover')

lecturer_1 = Lecturer.objects.create(user=user_lecturer_1)
lecturer_2 = Lecturer.objects.create(user=user_lecturer_2)

administrator = Administrator.objects.create(user=user_admin)

group_1 = Group.objects.create(name='Nhóm A')
group_2 = Group.objects.create(name='Nhóm B')
group_3 = Group.objects.create(name='Nhóm C')
group_4 = Group.objects.create(name='Nhóm D')

group_1.members.add(user_alumni_1, user_lecturer_1, user_alumni_3, user_alumni_4, user_alumni_5)
group_2.members.add(user_alumni_2, user_lecturer_2, user_alumni_7, user_alumni_8, user_alumni_9)
group_3.members.add(user_alumni_2, user_alumni_13, user_alumni_12, user_alumni_11, user_alumni_10, user_alumni_13)
group_4.members.add(user_alumni_5, user_lecturer_2, user_alumni_6, user_alumni_8, user_alumni_14)

#
# post_1 = Post.objects.create(user=user_alumni_1, content='Đây là nội dung bài viết đầu tiên')
# post_2 = Post.objects.create(user=user_alumni_2, content='Đây là nội dung bài viết thứ hai')
#
# comment_1 = Comment.objects.create(user=user_lecturer_1, content='Đây là bình luận cho bài viết đầu tiên', post=post_1)
# comment_2 = Comment.objects.create(user=user_lecturer_2, content='Đây là bình luận cho bài viết thứ hai', post=post_2)
#
# post_1.comments.add(comment_1)
# post_2.comments.add(comment_2)
#
# reaction_1 = PostReaction.objects.create(user=user_admin, post=post_1, reaction='like')
# reaction_2 = PostReaction.objects.create(user=user_admin, post=post_2, reaction='heart')
#
# survey_1 = Survey.objects.create(user=user_alumni_1, content='Nội dung khảo sát đầu tiên', title='Khảo sát đầu tiên')
# survey_2 = Survey.objects.create(user=user_alumni_2, content='Nội dung khảo sát thứ hai', title='Khảo sát thứ hai')
#
# survey_question_1 = SurveyQuestion.objects.create(survey=survey_1, question_text='Bạn có thích màu xanh không?')
# survey_question_2 = SurveyQuestion.objects.create(survey=survey_2, question_text='Bạn có thích màu đỏ không?')
#
# survey_answer_1 = SurveyAnswer.objects.create(question=survey_question_1, answer_text='Có')
# survey_answer_2 = SurveyAnswer.objects.create(question=survey_question_2, answer_text='Không')
#
# event_1 = Event.objects.create(user=user_admin, content='Nội dung sự kiện đầu tiên', title='Sự kiện đầu tiên')
# event_2 = Event.objects.create(user=user_admin, content='Nội dung sự kiện thứ hai', title='Sự kiện thứ hai')
# event_1.assigned_groups.add(group_1)
# event_2.assigned_groups.add(group_2)
#
# notification_1 = Notification.objects.create(content='Thông báo cho sự kiện đầu tiên', event=event_1)
# notification_2 = Notification.objects.create(content='Thông báo cho sự kiện thứ hai', event=event_2)
# notification_1.user_notification.add(user_alumni_1, user_lecturer_1)
# notification_2.user_notification.add(user_alumni_2, user_lecturer_2)
# notification_1.group_notification.add(group_1)
# notification_2.group_notification.add(group_2)
#
print("Dữ liệu đã được thêm vào thành công!")
