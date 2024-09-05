import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Switch,
  FlatList,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import API, { authAPI, endpoints } from "../configs/API";
import CheckBox from "expo-checkbox";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { htmlToText } from "html-to-text";

const AdminCreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false); // state for group modal visibility
  const [userModalVisible, setUserModalVisible] = useState(false); // state for user modal visibility
  const richText = useRef(); // reference to the RichEditor
  const [modalVisible, setModalVisible] = useState(false); // state for modal visibility
  const [newGroupName, setNewGroupName] = useState(""); // state for new group name
  const [newGroupUsers, setNewGroupUsers] = useState([]); // state for selected users in the new group
  const [groupCreateModalVisible, setCreateGroupModalVisible] = useState(false);
  useEffect(() => {
    // Fetch groups and users from the backend
    const getGroups = async () => {
      try {
        let accessToken = await AsyncStorage.getItem("access-token");
        let response = await authAPI(accessToken).get(endpoints["groups"]);
        setGroups(response.data);
      } catch (ex) {
        console.log(ex);
      }
    };
    const getUsers = async () => {
      try {
        let accessToken = await AsyncStorage.getItem("access-token");

        let response = await authAPI(accessToken).get(endpoints["users"]);
        setUsers(response.data);
      } catch (ex) {
        console.log(ex);
      }
    };
    getGroups();
    getUsers();
  }, []);

  const handleCreateEvent = async () => {
    const plainTextContent = htmlToText(content);
    const data = {
      content: plainTextContent, // Use plain text content
      group_notification: selectedGroups,
      user_notification: selectedUsers,
      event: {
        title,
        content,
        assigned_groups: selectedGroups,
      },
    };
    try {
      let accessToken = await AsyncStorage.getItem("access-token");
      let response = await authAPI(accessToken).post(
        endpoints["notification"],
        data
      );
      navigation.navigate("Home");
      alert("Thành công")
      setSelectedGroups([])
      setUsers([])
      setTitle("")
      setContent("")
    } catch (ex) {
      console.log(ex);
    }
  };

  const handleCreateGroup = async () => {
    const data = {
      name: newGroupName,
      members: newGroupUsers,
    };
    console.log(data);
    try {
      let accessToken = await AsyncStorage.getItem("access-token");
      let response = await authAPI(accessToken).post(endpoints["groups"], data);
      setGroups([...groups, response.data]);
      setCreateGroupModalVisible(false);
      setNewGroupName("");
      setNewGroupUsers([]);
      getGroups();
      getUsers();
    } catch (ex) {
      console.log(ex);
    }
  };
  const handleSendToAllToggle = (value) => {
    setSendToAll(value); // Update the state for "Send to All Users"
  
    // Update selected users based on the switch value
    if (value) {
      // If toggled to true (select all)
      setSelectedUsers(users.map((user) => user.id)); // Select all user IDs
      setSelectedGroups(groups.map((group) => group.id)); // Select all group IDs
    } else {
      // If toggled to false (deselect all)
      setSelectedUsers([]); // Clear selected users
      setSelectedGroups([]); // Clear selected groups

    }
  
    
  };
  const renderModal = (
    visible,
    setVisible,
    data,
    selectedItems,
    setSelectedItems,
    title
  ) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setVisible(!visible);
      }}
    >
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput placeholder="Tìm kiếm" style={styles.searchInput} />
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.modalItem}>
                <CheckBox
                  value={selectedItems.includes(item.id)}
                  onValueChange={() => {
                    setSelectedItems((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                />
                <Text style={styles.modalItemText}>
                  {item.username || item.name}
                </Text>
              </View>
            )}
          />
          <Button title="Chấp Nhận" onPress={() => setVisible(false)} />
        </View>
      </View>
    </Modal>
  );

  const renderGroupModal = (
    groupCreateModalVisible,
    setCreateGroupModalVisible,
    users,
    newGroupUsers,
    setNewGroupUsers,
    newGroupName,
    setNewGroupName
  ) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={groupCreateModalVisible}
      onRequestClose={() => {
        setCreateGroupModalVisible(!groupCreateModalVisible);
      }}
    >
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Tạo nhóm mới</Text>
          <TextInput
            placeholder="Tên nhóm"
            style={styles.searchInput}
            value={newGroupName}
            onChangeText={setNewGroupName}
          />
          <Text style={styles.modalSubtitle}>Chọn người dùng</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.modalItem}>
                <CheckBox
                  value={newGroupUsers.includes(item.id)}
                  onValueChange={() => {
                    setNewGroupUsers((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                />
                <Text style={styles.modalItemText}>{item.username}</Text>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGroup}
          >
            <Text style={styles.buttonText}>Tạo nhóm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCreateGroupModalVisible(false)}
          >
            <Text style={styles.buttonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Event Title"
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setGroupModalVisible(true)}
      >
        <Text style={styles.buttonText}>Chọn nhóm</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setUserModalVisible(true)}
      >
        <Text style={styles.buttonText}>Chọn người dùng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Soạn nội dung</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setCreateGroupModalVisible(true)}
      >
        <Text style={styles.buttonText}>Tạo Nhóm</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scroll}>
            <RichEditor
              ref={richText}
              style={styles.richTextEditor}
              placeholder="Start typing here..."
              initialHeight={300}
              value={content}
              onChange={(text) => setContent(text)}
            />
          </ScrollView>
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.heading1,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.insertImage,
            ]}
            iconTint="#000033"
            selectedIconTint="#2095F2"
            selectedButtonStyle={{ backgroundColor: "transparent" }}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.switchContainer}>
        <Text>Send to All Users</Text>
        <Switch value={sendToAll} onValueChange={handleSendToAllToggle} />
      </View>
      <Button title="Tạo sự kiện" onPress={handleCreateEvent} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {renderModal(
          groupModalVisible,
          setGroupModalVisible,
          groups,
          selectedGroups,
          setSelectedGroups,
          "Chọn nhóm"
        )}
      </KeyboardAvoidingView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {renderModal(
          userModalVisible,
          setUserModalVisible,
          users,
          selectedUsers,
          setSelectedUsers,
          "Chọn người dùng"
        )}
      </KeyboardAvoidingView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        
      >
        {renderGroupModal(
          groupCreateModalVisible,
          setCreateGroupModalVisible,
          users,
          newGroupUsers,
          setNewGroupUsers,
          newGroupName,
          setNewGroupName,
          "Tạo Nhóm"
        )}
      </KeyboardAvoidingView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  openButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalCenteredView: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    height: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    paddingLeft: 10,
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalItemText: {
    marginLeft: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: "#28a745",
    padding: 10,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  scroll: {
    flex: 1,
  },
  richTextEditor: {
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    minHeight: 300,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});

export default AdminCreateEventScreen;
