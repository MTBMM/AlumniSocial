import React, {useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  StyleSheet,
} from "react-native";
import Icon from "@expo/vector-icons/Entypo";
import EventPage from "../components/Pages/EventPage";
import Posts from "../components/Pages/posts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { authAPI, endpoints } from "../configs/API";
import SurveyList from "../components/Surveys/SurveyList";
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import MyContext from '../configs/MyContext';

const Home = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("post");
  const [events, setEvent] = useState([]);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false); // State for menu modal visibility
  const [image, setImage] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [dispatch] = useContext(MyContext);
  
  useEffect(() => {
    const getEvents = async () => {
      try {
        let accessToken = await AsyncStorage.getItem("access-token");
        let res = await authAPI(accessToken).get(endpoints["event"]);
        let userRes = await authAPI(accessToken).get(endpoints["current-user"]);
        setEvent(res.data);
        setUser(userRes.data);
      } catch (ex) {
        console.log(ex);
      }
    };
    getEvents();
  }, []);

  const onDetail = (userId) => {
    navigation.navigate('Detail', { userId });
  };

  const onTabPressed = (tab) => {
    if (tab !== selectedTab) {
      setSelectedTab(tab);
    }
  };

  const pickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied");
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    }
  };

  const handlePost = async () => {
    try {
      setLoading(true);

      let accessToken = await AsyncStorage.getItem("access-token");
      let formData = new FormData();
      formData.append('content', content);
      formData.append('allow_comments', true);
      formData.append('active', true);

      if (image) {
        formData.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: image.fileName || `${Date.now()}.jpg`,
        });
      }

      let response = await authAPI(accessToken).post(endpoints["post"], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setModalVisible(false);
      setImage(null);
      setContent("");
      setLoading(false);
    } catch (error) {
      console.error('Error creating post:', error);
      setLoading(false);
    }
  };

const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('access-token');
            dispatch({ "type": "logout" });
            navigation.navigate('login');

        } catch (error) {

            navigation.navigate('login');
            console.error('Error logging out:', error);

        }
    };
  const openStatistics = () => {
    navigation.navigate("Statistics");
  };

  // Render conditionally based on user role
  const renderAdminOption = () => {
    if (user && user.role === "admin") {
      return (
        <TouchableOpacity style={styles.menuItem} onPress={openStatistics}>
          <Text style={styles.menuText}>Statistics</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
      <ScrollView style={{ backgroundColor: "#044244" }}>
        <View style={{ height: 200, width: "100%", paddingHorizontal: 35 }}>
          <View style={{ flexDirection: "row", width: "100%", paddingTop: 40, alignItems: "center" }}>
            <TouchableOpacity onPress={() => onDetail(user.id)} style={{ width: "50%", flexDirection: "row", alignItems: "center" }}>
              {user && user.alumni && user.alumni.avatar ? (
                <Image source={{ uri: user.alumni.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
              ) : (
                <Image source={require("../images/1.jpg")} style={{ width: 50, height: 50, borderRadius: 25 }} />
              )}
              {user && (
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ color: "#FFF", fontSize: 18 }}>
                    {user.alumni ? user.alumni.username : user.username}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={{ color: "#FFF", fontSize: 14, opacity: 0.7 }}>
                      + Thêm bài post
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ width: "50%", alignItems: "flex-end" }}>
              <TouchableOpacity onPress={() => setMenuModalVisible(true)}>
                <Icon name="dots-two-vertical" size={22} color="#d2d2d2" style={{ marginRight: -7, marginTop: 7 }} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={{ fontFamily: "Bold", fontSize: 25, color: "#FFF", paddingVertical: 25 }}>
            Mạng xã hội cựu sinh viên
          </Text>
        </View>
        <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 35, paddingBottom: 100 }}>
          <View style={{ flexDirection: "row", paddingTop: 20 }}>
            <TouchableOpacity onPress={() => onTabPressed("post")} style={{ borderBottomColor: selectedTab === "post" ? "#044244" : "#FFF", borderBottomWidth: 4, paddingVertical: 6 }}>
              <Text style={{ fontFamily: "Bold", color: selectedTab === "post" ? "#044244" : "#9ca1a2" }}>
                Post
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onTabPressed("event")} style={{ borderBottomColor: selectedTab === "event" ? "#044244" : "#FFF", borderBottomWidth: 4, paddingVertical: 6, marginLeft: 30 }}>
              <Text style={{ fontFamily: "Bold", color: selectedTab === "event" ? "#044244" : "#9ca1a2" }}>
                Event
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onTabPressed("survey")} style={{ borderBottomColor: selectedTab === "survey" ? "#044244" : "#FFF", borderBottomWidth: 4, paddingVertical: 6, marginLeft: 30 }}>
              <Text style={{ fontFamily: "Bold", color: selectedTab === "survey" ? "#044244" : "#9ca1a2" }}>
                Survey
              </Text>
            </TouchableOpacity>
          </View>
          {selectedTab === "post" && (
            <View style={{ flexDirection: "row", paddingTop: 20 }}>
              <Posts
                onFixPage={() => navigation.navigate("FixPage")}
                onPagePrivate={() => navigation.navigate("PagePrivate")}
                onComments={() => navigation.navigate("CommentScreen")}
                onDetail={() => navigation.navigate("Detail")}
                name="Max Bator"
                profile={require("../images/p1.jpg")}
                photo={require("../images/5.jpg")}
              />
            </View>
          )}
          {selectedTab === "event" && events.map((ev, index) => (
            <View key={index} style={{ flexDirection: "row" }}>
              <EventPage
                title={ev.title}
                onDetailEvent={() => navigation.navigate("DetailEvent", { title: ev.title, content: ev.content })}
                content={ev.content}
                date={ev.created_date}
                profile={require("../images/p1.jpg")}
                photo={require("../images/5.jpg")}
              />
            </View>
          ))}
          {selectedTab === "survey" && <SurveyList navigation={navigation} />}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Tạo Bài Đăng</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Nhập nội dung bài post..."
                  style={styles.input}
                  multiline
                  value={content}
                  onChangeText={setContent}
                />
                <TouchableOpacity style={styles.iconContainer} onPress={pickImage}>
                  <MaterialIcons name="photo" size={24} color="white" />
                </TouchableOpacity>
              </View>
              {image && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <Text style={styles.imageName}>{image.fileName}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                <Text style={styles.postButtonText}>Đăng bài</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={menuModalVisible} onRequestClose={() => setMenuModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPressOut={() => setMenuModalVisible(false)}>
          <View style={styles.menuModalView}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
            {renderAdminOption()}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "#FFF",
    width: "100%",
    height: 500,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  menuModalView: {
    backgroundColor: "#FFF",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  menuItem: {
    width: "100%",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  menuText: {
    color: "#044244",
    fontSize: 18,
    fontFamily: "Bold",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderText: {
    color: "#044244",
    fontSize: 20,
    fontFamily: "Bold",
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  iconContainer: {
    padding: 5,
    backgroundColor: "#044244",
    borderRadius: 10,
    marginLeft: 10,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageName: {
    fontSize: 12,
    color: "#888",
  },
  postButton: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  postButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Bold",
  },
});

export default Home;
