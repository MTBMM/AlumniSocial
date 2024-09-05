import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Avatar, Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { authAPI, endpoints } from "../../configs/API";

const getToken = async () => {
  return await AsyncStorage.getItem("access-token");
};


const Fixpage = ({ route }) => {
  const { postId } = route.params;
  const navigation = useNavigation();


  const handleHidePost = async () => {
    try {
      const accessToken = await getToken();
      await authAPI(accessToken).patch(endpoints["hidePost"](postId));
      showAlertAndNavigate("Bài viết đã được ẩn thành công.");
    } catch (error) {
      console.error("Error hiding post:", error);
      showAlert("Đã xảy ra lỗi khi ẩn bài viết.");
    }
  };

  const handleDeletePost = async () => {
    try {
      const accessToken = await getToken();
      await authAPI(accessToken).delete(endpoints["deletePost"](postId));
      showAlertAndNavigate("Bài viết đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting post:", error);
      showAlertAndNavigate("Bài viết đã được xóa thành công.");
    }
  };

  const handleDisableComments = async () => {
    try {
      const accessToken = await getToken();
      await authAPI(accessToken).patch(endpoints["lockComments"](postId));
      showAlertAndNavigate("Bình luận đã được khóa thành công.");
    } catch (error) {
      console.error("Error locking comments:", error);
      showAlert("Đã xảy ra lỗi khi khóa bình luận.");
    }
  };

  const handleEditPost = async () => {
    try {
      const accessToken = await getToken();
      await authAPI(accessToken).put(endpoints["updatePost"](postId));
      showAlertAndNavigate("Bài viết đã được chỉnh sửa thành công.");
    } catch (error) {
      console.error("Error editing post:", error);
      showAlert("Đã xảy ra lỗi khi chỉnh sửa bài viết.");
    }
  };

  const showAlertAndNavigate = (message) => {
    Alert.alert(
      "Thành công",
      message,
      [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ],
      { cancelable: false }
    );
    navigation.navigate("Posts");
  };

  const showAlert = (message) => {
    Alert.alert("Lỗi", message, [{ text: "OK", onPress: () => {} }], {
      cancelable: false,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-left" size={24} color="#044244" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerText}>Các tác vụ thực hiện với bài viết này:</Text>
      </View>

      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.option} onPress={handleHidePost}>
          <Icon name="times-circle" type="entypo" size={20} color="#000" />
          <Text style={styles.optionText}>Ẩn bài viết</Text>
          <Text style={styles.optionSubText}>Quản trị viên và chủ bài đăng được ẩn bài đăng.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleDeletePost}>
          <Icon name="trash" type="entypo" size={20} color="#000" />
          <Text style={styles.optionText}>Xóa bài viết</Text>
          <Text style={styles.optionSubText}>Quản trị viên và chủ bài đăng được xóa bài đăng.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleDisableComments}>
          <Icon name="lock" size={20} color="#000" />
          <Text style={styles.optionText}>Khóa bình luận</Text>
          <Text style={styles.optionSubText}>Chủ bài đăng được chặn người dùng bình luận.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleEditPost}>
          <Icon name="pencil" type="entypo" size={20} color="#000" />
          <Text style={styles.optionText}>Sửa bài viết</Text>
          <Text style={styles.optionSubText}>Chủ bài đăng được chỉnh sửa nội dung bài viết.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  backButton: {
    width: "10%",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  optionContainer: {
    padding: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#000",
  },
  optionSubText: {
    fontSize: 8,
    marginLeft: 5,
    color: "#666",
  },
});

export default Fixpage;
