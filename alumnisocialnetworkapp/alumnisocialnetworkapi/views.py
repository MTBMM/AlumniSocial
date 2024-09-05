from django.db.models.functions import ExtractMonth, ExtractQuarter, ExtractDay, ExtractYear
from django.http import Http404
from django.db.models import Count
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta, datetime
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from .models import User, Post, PostReaction, Comment
from .perms import IsOwnerOrReadOnly, IsPostOwnerOrCommentAuthorOrReadOnly, IsOwnerOrAdmin, IsAdmin
from .serializers import UserSerializer, AlumniSerializer, LecturerSerializer, PostSerializer, \
    PostReactionSerializer, CommentSerializer, NotificationReadSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]


    @action(methods=['get'], detail=True, url_path='timeline')
    def timeline(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            posts = Post.objects.filter(user=user).order_by('-created_date')
            serializer = PostSerializer(posts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], detail=True, url_path='profile')
    def profile(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)

            if user.role == User.ROLE_ALUMNI:
                alumni_profile = Alumni.objects.get(user=user)
                alumni_serializer = AlumniSerializer(alumni_profile)
                profile_data = {
                    'user_name': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'avatar': alumni_profile.avatar.url if alumni_profile.avatar else None,
                    'cover': alumni_profile.cover.url if alumni_profile.cover else None,
                    'profile': alumni_serializer.data,
                }
            else:
                user_serializer = UserSerializer(user)
                profile_data = {
                    'user_name': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'avatar': user.avatar.url if user.avatar else None,
                    'cover': user.cover.url if user.cover else None,
                    'profile': user_serializer.data,
                }

            return Response(profile_data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Alumni.DoesNotExist:
            return Response({'error': 'Alumni profile not found'}, status=status.HTTP_404_NOT_FOUND)


    @action(methods=['get'], url_path='current-user', detail=False)
    def current_user(self, request):
        return Response(UserSerializer(request.user).data)


class LecturerViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer

    # parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['update_password']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lecturer = serializer.save()

        # Use `.get()` to safely access data from request
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        merge_data = {
            'username': username,
            'password': password
        }

        if request.user.role == 'admin':
            subject = "Password for Lecturer"
            html_body = render_to_string("email/password-lecturer.html", merge_data)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email='kiennguyentrung408@gmail.com',
                to=[email],
                body='You are invited to an event'
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(methods=['patch'], url_path='update-password', detail=False)
    def update_password(self, request):
        user = request.user
        data = request.data
        now = timezone.now()
        timeout_duration = timedelta(minutes=20)
        time_since_creation = now - user.date_joined
        print(timeout_duration)
        print(time_since_creation)

        if user.role == User.ROLE_LECTURER and user.is_active == False:
            # user.is_active = False
            # user.save()
            print(f"Locked account for lecturer: {user.username}")
            return Response({'error': 'Mật khẩu bị khóa'}, status=status.HTTP_400_BAD_REQUEST)
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        if user.check_password(old_password) and user.role == User.ROLE_LECTURER:
            user.is_active = True
            user.password_changed = True
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Mật khẩu đã được cập nhật thành công'}, status=status.HTTP_200_OK)

        return Response({'error': 'Mật khẩu cũ không chính xác'}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['patch'], detail=True, url_path='reset-password-deadline', permission_classes=[IsAuthenticated])
    def reset_password_deadline(self, request, pk=None):
        try:
            lecturer = User.objects.get(pk=pk, role=User.ROLE_LECTURER)
            if request.user.role != User.ROLE_ADMIN:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            lecturer.created_date = timezone.now() + timedelta(hours=24)
            lecturer.is_active = True
            lecturer.save()
            return Response({'message': 'Password change deadline reset'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Lecturer not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], detail=False, url_path='inactive_users', permission_classes=[IsAdmin])
    def inactive_lecturers(self, request):
        inactive_users = User.objects.filter(is_active=False)
        serializer = LecturerSerializer(Lecturer.objects.filter(user__in=inactive_users), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AlumniViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    parser_classes = [parsers.MultiPartParser]
    # permission_classes = [IsAuthenticated]

    @action(methods=['post'], detail=True,
            name='Activate user',
            url_path='activate_user',
            url_name='activate_user')
    def activate_user(self, request, pk=None):
        try:
            alumni = User.objects.get(id=pk)
            if request.user.role == 'admin':
                alumni.is_active = True
                alumni.save()
                return Response({'status': 'User activated successfully'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], detail=False, url_path='inactive_users', permission_classes=[IsAdmin])
    def inactive_users(self, request):
        inactive_users = User.objects.filter(is_active=False)
        serializer = AlumniSerializer(Alumni.objects.filter(user__in=inactive_users), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(methods=['get'], detail=False, url_path='get_posts')
    def get_posts(self, request, pk=None):
        try:
            posts = Post.objects.filter(active=True).order_by('-created_date')
            serializer = PostSerializer(posts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['patch'], detail=True, permission_classes=[IsAuthenticated, IsOwnerOrAdmin],
            name='Hide this post',
            url_path='hide_post',
            url_name='hide_post')
    def hide_post(self, request, pk=None):
        try:
            post = self.get_object()
            post.active = False
            post.save()
            serializer = PostSerializer(post)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'], permission_classes=[IsOwnerOrReadOnly], url_path='lock-comments')
    def lock_comments(self, request, pk=None):
        try:
            post = self.get_object()
            post.allow_comments = False
            post.save()
            return Response({'message': 'Comments have been locked'}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated], url_path='comments')
    def get_comments(self, request, pk=None):
        try:
            post = self.get_object()
            comments = Comment.objects.filter(post=post)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsOwnerOrAdmin],
            name='Delete this post',
            url_path='delete_post',
            url_name='delete_post')
    def delete_post(self, request, pk=None):
        try:
            post = self.get_object()
            post.delete()
            return Response({'message': 'Post deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['put'], detail=True, permission_classes=[IsOwnerOrAdmin],
            name='Update this post',
            url_path='update_post',
            url_name='update_post')
    def update_post(self, request, pk=None):
        try:
            post = self.get_object()
            serializer = PostSerializer(post, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='add_comments')
    def add_comments(self, request, pk=None):
        post = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def get_permissions(self):
    #     if self.action in ['react', 'reactions_count']:
    #         return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        post = self.get_object()
        print("react")

        reaction = request.data.get('reaction')

        if reaction not in dict(PostReaction.REACTION_CHOICES):
            return Response({'error': 'Invalid reaction type.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user already reacted to the post
        existing_reaction = PostReaction.objects.filter(user=request.user, post=post).first()
        if existing_reaction:
            if existing_reaction.reaction == reaction:
                existing_reaction.delete()
                return Response({'detail': 'Reaction removed.'}, status=status.HTTP_204_NO_CONTENT)
            else:
                existing_reaction.reaction = reaction
                existing_reaction.save()
                return Response(PostReactionSerializer(existing_reaction).data, status=status.HTTP_200_OK)

        new_reaction = PostReaction.objects.create(user=request.user, post=post, reaction=reaction)
        return Response(PostReactionSerializer(new_reaction).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def reactions_count(self, request, pk=None):
        print("count")
        post = self.get_object()
        reactions = PostReaction.objects.filter(post=post).values('reaction').annotate(count=Count('id'))

        reaction_counts = {
            'like': 0,
            'haha': 0,
            'tym': 0,
        }

        for reaction in reactions:
            reaction_counts[reaction['reaction']] = reaction['count']

        return Response(reaction_counts, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    @action(methods=['patch'], detail=True, permission_classes=[IsAuthenticated, IsPostOwnerOrCommentAuthorOrReadOnly],
            url_path='update_comment', url_name='update_comment')
    def update_comment(self, request, pk=None):
        try:
            comment = self.get_object(pk)
            self.check_object_permissions(request, comment)
            serializer = CommentSerializer(comment, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsOwnerOrAdmin],
            url_path='delete_comment', url_name='delete_comment')
    def delete_comment(self, request, pk=None):
        try:
            comment = self.get_object(pk)
            self.check_object_permissions(request, comment)
            comment.delete()
            return Response({'message': 'Comment deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

    def get_object(self, pk=None):
        try:
            return Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            raise Http404


class PostReactionViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = PostReaction.objects.all()
    serializer_class = PostReactionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user_notification=user)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        user = request.user
        queryset = self.get_queryset().filter(read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        user = request.user
        try:
            notification = self.get_queryset().get(pk=pk)
            serializer = NotificationReadSerializer(notification, data={'read': True}, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'notification marked as read'})
            else:
                return Response(serializer.errors, status=400)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=404)

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user
        print("aaa")
        if user.role != User.ROLE_ADMIN:
            return Response({'error': 'Only admins can create notifications'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        event_data = data.pop('event', None)
        notification = serializer.save()

        # print(event_data['title'])
        # event = Event.objects.create(
        #     user=user,
        #     title=event_data['title'],
        #     content=event_data['content'],
        #     assigned_groups=event_data['assigned_groups']
        # )
        # notification.event = event
        # notification.save()
        if event_data:
            assigned_groups = event_data.pop('assigned_groups', [])  # Get assigned_groups from event_data
            event = Event.objects.create(
                user=user,
                **event_data
            )
            event.assigned_groups.set(assigned_groups)  # Assign assigned_groups to event using set() method
            notification.event = event
            notification.save()

        groups = data.get('group_notification', [])
        users = data.get('user_notification', [])

        if groups:
            for group_id in groups:
                group = Group.objects.get(id=group_id)
                notification.group_notification.add(group)
                for member in group.members.all():
                    self.send_email(member, event)

        if users:
            for user_id in users:
                user = User.objects.get(id=user_id)
                notification.user_notification.add(user)
                self.send_email(user, event)

        notification.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def send_email(self, user, event):
        print('gửi mail')
        link = f"http://localhost:8000/events/{event.id}/"
        merge_data = {
            'link': link,
            'username': user.username,
            'event_title': event.title,
            'event_content': event.content
        }
        subject = f"Invitation to Event: {event.title}"
        html_body = render_to_string("email/event_invitation.html", merge_data)

        msg = EmailMultiAlternatives(
            subject=subject, from_email='kiennguyentrung408@gmail.com',
            to=['2151053031kien@ou.edu.vn'], body='You are invited to an event'
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send()


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]


class SurveyViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='questions', url_name='questions')
    def get_survey_questions(self, request, pk=None):
        survey = self.get_object()
        questions = survey.surveyquestion_set.all()
        serializer = SurveyQuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['perform_create', 'results']:
            return [IsAdmin()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        print('aaaaaaa')
        survey = serializer.save(user=self.request.user)
        questions_data = self.request.data.get('questions')
        if not questions_data:
            raise ValidationError({"detail": "Questions are required."})

        for question_data in questions_data:
            answers_data = question_data.pop('answers', None)
            if not answers_data:
                raise ValidationError({"detail": "Answers are required for each question."})

            question = SurveyQuestion.objects.create(survey=survey, **question_data)
            for answer_data in answers_data:
                SurveyAnswer.objects.create(question=question, **answer_data)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        survey = self.get_object()
        questions = survey.surveyquestion_set.all()
        results = []
        for question in questions:
            question_data = {
                'question': question.question_text,
                'answers': []
            }
            answers = question.surveyanswer_set.all()
            for answer in answers:
                count = SurveyQuestionAnswer.objects.filter(question=question, answer=answer).count()
                question_data['answers'].append({
                    'answer': answer.answer_text,
                    'count': count
                })
            results.append(question_data)
        return Response(results)


class SurveyQuestionAnswerViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = SurveyQuestionAnswer.objects.all()
    serializer_class = SurveyQuestionAnswerSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user
        question = data.get('question')
        answer = data.get('answer')

        try:
            # Kiểm tra xem câu hỏi có tồn tại hay không
            survey_question = SurveyQuestion.objects.get(id=question)
        except SurveyQuestion.DoesNotExist:
            return Response({'error': 'Question does not exist'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Kiểm tra xem câu trả lời có tồn tại hay không
            survey_answer = SurveyAnswer.objects.get(id=answer, question=survey_question)
        except SurveyAnswer.DoesNotExist:
            return Response({'error': 'Answer does not exist for the given question'}, status=status.HTTP_404_NOT_FOUND)

        # Tạo câu trả lời cho câu hỏi khảo sát
        survey_question_answer = SurveyQuestionAnswer.objects.create(
            user=user,
            question=survey_question,
            answer=survey_answer
        )

        serializer = self.get_serializer(survey_question_answer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StatViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        period = request.query_params.get('period', 'year')
        current_year = datetime.now().year

        if period == 'year':
            users_data = User.objects.filter(date_joined__year=current_year).annotate(
                year=ExtractYear('date_joined')
            ).values('year').annotate(count=Count('id'))

            posts_data = Post.objects.filter(created_date__year=current_year).annotate(
                year=ExtractYear('created_date')
            ).values('year').annotate(count=Count('id'))

            data = {
                'users_by_period': list(users_data),
                'posts_by_period': list(posts_data),
            }
            return Response(data)

        elif period == 'month':
            users_data = User.objects.filter(date_joined__year=current_year).annotate(
                month=ExtractMonth('date_joined')
            ).values('month').annotate(count=Count('id'))

            posts_data = Post.objects.filter(created_date__year=current_year).annotate(
                month=ExtractMonth('created_date')
            ).values('month').annotate(count=Count('id'))

            data = {
                'users_by_period': list(users_data),
                'posts_by_period': list(posts_data),
            }
            return Response(data)

        elif period == 'quarter':
            users_data = User.objects.filter(date_joined__year=current_year).annotate(
                quarter=ExtractQuarter('date_joined')
            ).values('quarter').annotate(count=Count('id'))

            posts_data = Post.objects.filter(created_date__year=current_year).annotate(
                quarter=ExtractQuarter('created_date')
            ).values('quarter').annotate(count=Count('id'))

            data = {
                'users_by_period': list(users_data),
                'posts_by_period': list(posts_data),
            }
            return Response(data)

        else:
            return Response({'error': 'Invalid period'}, status=400)
