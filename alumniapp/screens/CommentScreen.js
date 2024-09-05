import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Modal } from 'react-native';
import Icon from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { endpoints } from '../configs/API';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const CommentScreen = ({ route, navigation }) => {
    const { postId, allowComments } = route.params;
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState('');
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedComment, setEditedComment] = useState('');

    useEffect(() => {
        fetchComments();
    }, []);


    const fetchComments = async () => {
        try {
            const token = await AsyncStorage.getItem('access-token');
            const response = await API.get(endpoints.postComments(postId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response:', response.data);

            setComments(response.data);
        } catch (error) {
            console.error('Lỗi khi tải bình luận:', error);
        }
    };

    const addComment = async () => {
        if (!allowComments) {
            Alert.alert('Không thể bình luận', 'Chức năng bình luận đã bị vô hiệu hóa cho bài viết này.');
            return;
        }

        if (input.trim().length > 0) {
            try {
                const token = await AsyncStorage.getItem('access-token');
                const newComment = {
                    post: postId,
                    content: input,
                };
                const response = await API.post(endpoints.addComments(postId), newComment, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Thêm bình luận thành công:', response.data);

                const updatedComments = [...comments, response.data];
                setComments(updatedComments);
                setInput('');
            } catch (error) {
                console.error('Lỗi khi thêm bình luận:', error);
                if (error.response) {
                    console.error('Phản hồi từ máy chủ:', error.response.data);
                }
                Alert.alert('Lỗi', 'Thêm bình luận thất bại. Vui lòng thử lại.');
            }
        } else {
            Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận.');
        }
    };

    const handleDeleteComment = async () => {
        try {
            const token = await AsyncStorage.getItem('access-token');
            await API.delete(endpoints.deleteComment(selectedCommentId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Sau khi xóa thành công, tải lại danh sách bình luận
            fetchComments();
            closeModal();

        } catch (error) {
            fetchComments();
            closeModal();
            Alert.alert('Xóa bình luận thành công!!');
        }
    };

    const showOptions = (id, content) => {
        setSelectedCommentId(id);
        setEditedComment(content); // Lưu nội dung bình luận cần chỉnh sửa
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedCommentId(null);
        setModalVisible(false);
    };

    const openEditModal = () => {
        setModalVisible(false);
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setSelectedCommentId(null);
        setEditModalVisible(false);
    };

    const handleEditComment = async () => {
        try {
            const token = await AsyncStorage.getItem('access-token');
            const commentToUpdate = comments.find(comment => comment.id === selectedCommentId);

            const updatedComment = { ...commentToUpdate, content: editedComment };

            const response = await API.patch(endpoints.updateComment(selectedCommentId), updatedComment, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Cập nhật bình luận thành công:', response.data);

            const updatedComments = comments.map(comment =>
                comment.id === selectedCommentId ? response.data : comment
            );
            setComments(updatedComments);

            closeEditModal();
        } catch (error) {
            console.error('Lỗi khi cập nhật bình luận:', error);
            Alert.alert('Lỗi', 'Cập nhật bình luận thất bại. Vui lòng thử lại.');
        }
    };

    const renderCommentItem = ({ item }) => {
        return (
            <View style={styles.comment}>
                <Image source={{ uri: item.alumni_avatar }} style={styles.avatar} />
                <View style={styles.commentContent}>
                    <Text style={styles.commentUser}>{item.user_name}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <Text style={styles.commentTime}>{moment(item.created_date).fromNow()}</Text>
                </View>
                <TouchableOpacity onPress={() => showOptions(item.id, item.content)} style={styles.deleteButton}>
                    <Icon name="dots-three-horizontal" size={20} color="#9ca1a2" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <Icon name="chevron-left" size={24} color="#044244" />
                <Text style={{ marginLeft: 8, fontSize: 16, color: '#044244' }}>Quay lại</Text>
            </TouchableOpacity>
            <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCommentItem}
                contentContainerStyle={{ paddingBottom: 16 }}
            />
            {allowComments && (
                <>
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            style={styles.input}
                            placeholder="Viết bình luận..."
                        />
                        <TouchableOpacity onPress={addComment} style={styles.button}>
                            <Icon name="paper-plane" color="#fff" size={20} />
                        </TouchableOpacity>
                    </View>
                    <Modal
                        visible={modalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={closeModal}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity onPress={openEditModal} style={styles.modalOption}>
                                    <Text style={styles.modalOptionText}>Chỉnh sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDeleteComment} style={styles.modalOption}>
                                    <Text style={[styles.modalOptionText, { color: '#ff0000' }]}>Xóa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={closeModal} style={styles.modalOption}>
                                    <Text style={styles.modalOptionText}>Hủy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        visible={editModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={closeEditModal}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.editModalContent}>
                                <TextInput
                                    style={styles.editInput}
                                    value={editedComment}
                                    onChangeText={setEditedComment}
                                    placeholder="Chỉnh sửa bình luận..."
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity onPress={handleEditComment} style={styles.saveButton}>
                                        <Text style={styles.modalButtonText}>Lưu</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={closeEditModal} style={styles.cancelButton}>
                                        <Text style={styles.modalButtonText}>Hủy</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    comment: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 8,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 8,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 8,
    },
    commentContent: {
        flex: 1,
    },
    commentUser: {
        fontFamily: 'Bold',
        fontSize: 14,
        color: '#044244',
    },
    commentText: {
        fontSize: 14,
        color: '#333',
    },
    commentTime: {
        fontSize: 12,
        color: '#9ca1a2',
    },
    deleteButton: {
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 8,
        backgroundColor: '#e8e8e8',
        borderRadius: 8,
        marginRight: 8,
    },
    button: {
        padding: 8,
        backgroundColor: '#044244',
        borderRadius: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        width: '80%',
    },
    modalOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
    },
    modalOptionText: {
        fontSize: 18,
        color: '#044244',
    },
    editModalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        width: '80%',
    },
    editInput: {
        fontSize: 14,
        color: '#333',
        backgroundColor: '#e8e8e8',
        borderRadius: 8,
        padding: 8,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        padding: 10,
        backgroundColor: '#044244',
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        padding: 10,
        backgroundColor: '#ff0000',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CommentScreen;
