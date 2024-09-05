import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://192.168.1.5:8000"


export const endpoints = {
    'login': '/o/token/',
    'posts': '/posts/get_posts/',
    'post': '/posts/',
    'register': '/Alumnus/',
    'current-user': '/User/current-user/',
    'users': '/User/',
    'groups': '/Groups/',
    'notification': '/notification/',
    'NotificationUnread': '/notification/unread/',
    'event': '/Event/',
    'NotificationRead': (id) => `/notification/${id}/mark_as_read/`,
    'surveys': '/surveys/',
    'getSurvey': (surveyId) => `/surveys/${surveyId}/questions/`,
    'reportSurey': (surveyId) => `surveys/${surveyId}/results/` ,
    'UserAnswer': '/UserAnswer/',
    'postComments': (postId) => `/posts/${postId}/comments/`,
    'updatePost': (postId) => `/posts/${postId}/update_post/`,
    'deletePost': (postId) => `/posts/${postId}/delete_post/`,
    'lockComments': (postId) => `/posts/${postId}/lock-comments/`,
    'addComments': (postId) => `/posts/${postId}/add_comments/`,
    'hidePost': (postId) => `/posts/${postId}/hide_post/`,
    'deleteComment': (commentId) => `/comments/${commentId}/delete_comment/`,
    'updateComment': (commentId) => `/comments/${commentId}/update_comment/`,
    'reactPost': (idPost) => `/posts/${idPost}/react/`,
    'countReactPost': (idPost) => `/posts/${idPost}/reactions_count/`,
    'inactiveUsers': '/Alumnus/inactive_users/',
    'timeLine': (user) => `/User/${user}/timeline/`,
    'profile': (user) => `/User/${user}/profile/`,
    'stats': '/stat/statistics/',
    // 'inactiveUsers': '/Alumnus/inactive_users/',
    'activeUser': (userId) => `/Alumnus/${userId}/activate_user/`,
    'lecturer': '/Lecturers/',
    'updatePasswordLecturer': '/Lecturers/update-password/',
    'inactiveLecturer': '/Lecturers/inactive_lecturers/',
    'inactiveUsers': (user) => `/${user}/inactive_users/`,
    'activeLecturer': (user) => `Lecturers/${user}/reset-password-deadline/`

};


export const authAPI = (accessToken) => axios.create({
    baseURL: API_URL,
    headers: {
        Authorization: `bearer ${accessToken?accessToken:AsyncStorage.getItem("access-token")}`
    }
})

export default axios.create({
    baseURL:API_URL
})