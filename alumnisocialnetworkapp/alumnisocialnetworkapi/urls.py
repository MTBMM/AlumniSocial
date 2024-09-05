from django.urls import path, include
from rest_framework import routers

from alumnisocialnetworkapi import views
from django.conf import settings

router = routers.DefaultRouter()
router.register('User', views.UserViewSet, basename='User')
router.register('Lecturers', views.LecturerViewSet, basename='Lecturers')
router.register('Alumnus', views.AlumniViewSet, basename='Alumnus')
router.register('posts', views.PostViewSet)
router.register('comments', views.CommentViewSet)
router.register('post-reactions', views.PostReactionViewSet)
router.register('Event', views.EventViewSet, basename='Event')
router.register('Groups', views.GroupViewSet, basename='Groups')
router.register('surveys', views.SurveyViewSet, basename='surveys')
router.register('UserAnswer', views.SurveyQuestionAnswerViewSet, basename='UserAnswer')
router.register('notification', views.NotificationViewSet, basename='notification')
router.register('stat', views.StatViewSet, basename='stat')

urlpatterns = [
    path('', include(router.urls))
]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns = [
                      path('__debug__/', include(debug_toolbar.urls)),
                  ] + urlpatterns
