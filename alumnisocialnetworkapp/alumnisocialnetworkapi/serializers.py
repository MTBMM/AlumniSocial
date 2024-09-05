from cloudinary.templatetags import cloudinary
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (User, Post, PostReaction, Comment, Survey, SurveyQuestion, SurveyAnswer,
                     Group, Event, Notification, Alumni, Lecturer, Administrator, SurveyQuestionAnswer)
from django.contrib.auth.hashers import make_password
import logging
from cloudinary import uploader


logger = logging.getLogger(__name__)


class AlumniSerializer(serializers.ModelSerializer):
    # id = serializers.CharField(source='user.id')

    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    role = serializers.ChoiceField(read_only=True, choices=User.ROLE_CHOICES, source='user.role')
    password = serializers.CharField(write_only=True, source='user.password')
    is_active = serializers.BooleanField(source='user.is_active', default=False)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url if instance.avatar else None
        rep['cover'] = instance.cover.url if instance.cover else None
        return rep

    def create(self, validated_data):
        try:
            logger.debug(f"Validated data: {validated_data}")
            user_data = validated_data.pop('user')
            password = user_data.pop('password')
            user = User(**user_data)
            user.set_password(password)
            user.role = user_data.pop('role', User.ROLE_ALUMNI)
            user.save()

            alumni = Alumni.objects.create(user=user, **validated_data)
            return alumni
        except Exception as e:
            logger.error(f"Error creating Alumni: {e}")
            raise serializers.ValidationError(f"Error creating Alumni: {e}")

    class Meta:
        model = Alumni
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'password', 'student_id', 'is_active',
                  'avatar', 'cover']


class LecturerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    # id = serializers.CharField(source='user.id')

    role = serializers.ChoiceField(read_only=True, choices=User.ROLE_CHOICES, source='user.role')
    password = serializers.CharField(write_only=True, source='user.password')

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = user_data.pop('password')
        user = User(**user_data)
        user.set_password(password)
        user.role = user_data.pop('role', User.ROLE_LECTURER)
        user.save()
        lecturer = Lecturer.objects.create(user=user, **validated_data)

        return lecturer

    class Meta:
        model = Lecturer
        fields = [ 'username', 'email', 'role', 'password']



class UserSerializer(serializers.ModelSerializer):
    alumni = AlumniSerializer(read_only=True)
    lecturer = LecturerSerializer(read_only=True)

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'role', 'alumni',
                  'lecturer']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class AdministratorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Administrator
        fields = ['username', 'email', 'first_name', 'last_name', 'role']


class PostSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['image'] = instance.image.url if instance.image else None

        if instance.user.role == User.ROLE_ALUMNI:
            alumni = Alumni.objects.get(user=instance.user)
            rep['alumni_avatar'] = alumni.avatar.url if alumni.avatar else None
            rep['alumni_name'] = instance.user.username

        return rep

    def create(self, validated_data):
        post = Post.objects.create(**validated_data)
        return post

    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'created_date', 'updated_date', 'reactions', 'allow_comments',
                  'active', 'image']
        read_only_fields = ['user']


class PostReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostReaction
        fields = ['id', 'user', 'post', 'reaction', 'timestamp']
        read_only_fields = ['user']


class CommentSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['user_name'] = instance.user.username
        if instance.user.role == User.ROLE_ALUMNI:
            alumni = Alumni.objects.get(user=instance.user)
            rep['alumni_avatar'] = alumni.avatar.url if alumni.avatar else None

        return rep
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'content', 'created_date', 'updated_date']
        read_only_fields = ['user', 'user_name', 'alumni_avatar' ]


class SurveyAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyAnswer
        fields = ['id', 'answer_text', 'count']


class SurveyQuestionSerializer(serializers.ModelSerializer):
    answers = SurveyAnswerSerializer(many=True, read_only=True, source='surveyanswer_set'   )

    class Meta:
        model = SurveyQuestion
        fields = ['id', 'question_text', 'answers']


class SurveySerializer(serializers.ModelSerializer):
    questions = SurveyQuestionSerializer(many=True, read_only=True, source='surveyquestion_set')

    class Meta:
        model = Survey
        fields = ['id', 'title', 'content', 'questions']


class SurveyQuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyQuestionAnswer
        fields = ['user', 'question', 'answer']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'members']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'content', 'assigned_groups', 'created_date']

    def create(self, validated_data):
        assigned_groups = validated_data.pop('assigned_groups', [])
        event = Event.objects.create(**validated_data)
        event.assigned_groups.set(assigned_groups)
        return event


class NotificationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user_notification', 'group_notification', 'content', 'event']


class NotificationReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['read']

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

    def validate_new_password(self, value):
        # Bạn có thể thêm các kiểm tra cho mật khẩu mới ở đây nếu cần
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.password = make_password(self.validated_data['new_password'])
        user.save()