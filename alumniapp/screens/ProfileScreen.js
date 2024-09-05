import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { authAPI, endpoints } from "../configs/API";
import MyContext from "../configs/MyContext";
import SignUpFirebase from "../components/ChatApp/SignUpFirebase";
import { useDispatch } from "react-redux";

const ProfileScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [user, dispatch] = React.useContext(MyContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("ou@123");
  const [oldPassword, setOldPassword] = useState("");
  const dispatch1 = useDispatch();

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleAddLecturer = async () => {
    // Handle the logic for adding a lecturer here
    dispatch1(SignUpFirebase(username, password))
    try {
      let accessToken = await AsyncStorage.getItem("access-token");
      let res = await authAPI(accessToken).post(endpoints["lecturer"], {
        username: username,
        password: password,
        email: email,
      });
      
      setUsername("");
      toggleModal();
    } catch (ex) {
      alert(ex);
    }
  };
  const changePassword = async () => {
    try {
      let accessToken = await AsyncStorage.getItem("access-token");
      let res = await authAPI(accessToken).patch(
        endpoints["updatePasswordLecturer"],
        {
          username: username,
          new_password: password,
          old_password: oldPassword,
          email: email,
        }
      );
      setUsername("");
      alert("Thành công");
      toggleModal();
    } catch (ex) {
      alert(ex);
    }
  };

  const handleLogout = async () => {
    try {
      setTimeout(() => {
        navigation.navigate("Login"); // Redirect to the login screen
      }, 200); // Thời gian chờ là 2 giây (2000 ms)
      await AsyncStorage.clear();
      dispatch({ type: "logout" }); // Dispatch an action to update the global state

     
      // Redirect to the login screen
    } catch (ex) {
      alert(ex);
    }
  };

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.profileName}>Trung Kiên Idol</Text>
      <Text style={styles.link} onPress={() => alert("See all profiles")}>
        See all profiles
      </Text>
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="cog" size={20} color="#000" style={styles.icon} />
        <Text style={styles.menuText}>Settings & privacy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <Icon
          name="question-circle"
          size={20}
          color="#000"
          style={styles.icon}
        />
        <Text style={styles.menuText}>Help & support</Text>
      </TouchableOpacity>
      {user.role === "admin" ? (
        <TouchableOpacity style={styles.menuItem} onPress={toggleModal}>
          <Icon name="adjust" size={20} color="#000" style={styles.icon} />
          <Text style={styles.menuText}>Thêm tài khoản cho giảng viên</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.menuItem} onPress={toggleModal}>
          <Icon name="adjust" size={20} color="#000" style={styles.icon} />
          <Text style={styles.menuText}>Thay đổi mật khẩu</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("ChatListScreen")}
      >
        <Icon name="comment" size={20} color="#000" style={styles.icon} />
        <Text style={styles.menuText}>Tin nhắn</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="sign-out" size={20} color="#000" style={styles.icon} />
        <Text style={styles.menuText} onPress={handleLogout}>
          Log Out
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Thêm tài khoản giảng viên</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            {user.role == "lecturer" && (
              <TextInput
                style={styles.input}
                placeholder="Old Password"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={true}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {/* <TextInput
              style={styles.input}
              placeholder="last name"
              value={lastName}
              onChangeText={setLastName}
              keyboardType="last name"
            />
             <TextInput
              style={styles.input}
              placeholder="first name"
              value={firstName}
              onChangeText={setfirstName}
              keyboardType="first name"
            /> */}

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={toggleModal} />
              {user.role == "admin" ? (
                <Button title="Add" onPress={handleAddLecturer} />
              ) : (
                <Button title="Add" onPress={changePassword} />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  link: {
    color: "blue",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default ProfileScreen;
