import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../configs/API";
import moment from "moment";
import MyContext from "../configs/MyContext";
import { Tab } from "react-native-elements";

const tabs = ['All', 'Alumnus', 'Lecturers']
const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [user, dispatch] = useContext(MyContext);
  const [getInactiveUsers, setInactiveUsers] = useState([]);
  const [type, setType] = useState("Alumnus")
  const [inactiveLecturers, setInactiveLecturers] = useState([]);

  
  useEffect(() => {
   
    getInactiveUser()
    getNotifications();
   
  }, [type]);
  const getInactiveUser = async () => {
    try {
      let accessToken = await AsyncStorage.getItem("access-token");

      let res = await authAPI(accessToken).get(endpoints["inactiveUsers"](type));
      setInactiveUsers(res.data);
    } catch (ex) {
      console.log(ex);
    }
  };
  const getNotifications = async () => {
    try {
      let accessToken = await AsyncStorage.getItem("access-token");

      let res = await authAPI(accessToken).get(endpoints["notification"]);
      setNotifications(res.data);
    } catch (ex) {
      console.log(ex);
    }
  };
 
  const resetPasswordLecture = async ({item}) => {
    console.log(item);
    try {
      let accessToken = await AsyncStorage.getItem("access-token");
      let res = await authAPI(accessToken).patch(
        endpoints["activeLecturer"](item.id),
        {}
      );
      getInactiveUser()
      setInactiveLecturers([])
      alert("Thành công");
    } catch (ex) {
      console.log(ex);
    }

  }
  const activeUser = async ({ item }) => {
    console.log(item);
    try {
      let accessToken = await AsyncStorage.getItem("access-token");
      let res = await authAPI(accessToken).post(
        endpoints["activeUser"](item.id),
        {}
      );
      getInactiveUser();
      alert("Thành công");
    } catch (ex) {
      console.log(ex);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() =>
        SubmitReadNotification({
          id: item.id,
          title: item.event.title,
          content: item.event.content,
        })
      }
    >
      <Icon name="user-plus" size={24} color="#000" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.user}>Admin</Text>
        <Text style={styles.message}>{item.content}</Text>
        <Text style={styles.time}>
          {moment(item.event.created_date).fromNow()}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const renderNotificationAdmin = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem}>
      <Icon name="user-plus" size={24} color="#000" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.user}>{item.student_id}</Text>
        <Text style={styles.message}>{item.username}</Text>
        <Text style={styles.time}></Text>
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <TouchableOpacity>
          <Text style={styles.subMit} onPress={() => activeUser({ item })}>
            Xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.detail}> Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderNotificationLecturers = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem}>
      <Icon name="user-plus" size={24} color="#000" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.user}>{item.email}</Text>
        <Text style={styles.message}>{item.username}</Text>
        <Text style={styles.time}></Text>
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <TouchableOpacity>
          <Text style={styles.subMit} onPress={() => resetPasswordLecture({ item })}>
            Xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.detail}> Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {user.role === "admin" ? (
        <View>
          <View style={{ padding: 40, flexDirection: "row", justifyContent: "center" }}>
            {tabs.map(tab => (
              <>
                <TouchableOpacity onPress={() => setType(tab)}>
                 <Text style={[styles.subMit, type === tab ? {backgroundColor: "blue"}: {}]}>{tab}</Text>
               </TouchableOpacity>
              </>
                 

            ))}
           
          </View>
          <FlatList
            data={getInactiveUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationLecturers}
          />
          <FlatList
            data={getInactiveUsers}
            keyExtractor={(item) => item.student_id}
            renderItem={renderNotificationAdmin}
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  user: {
    fontWeight: "bold",
  },
  message: {
    marginVertical: 5,
  },
  time: {
    color: "#aaa",
  },
  subMitContainer: {
    flex: "row",
  },
  subMit: {
    backgroundColor: "#28a745",
    padding: 10,
    // width: "30%",
    color: "white",
    borderRadius: 10,
    margin: 5,
  },
  detail: {
    backgroundColor: "blue",
    padding: 10,
    // width: "30%",
    color: "white",
    borderRadius: 10,
    margin: 5,
  },
});

export default NotificationsScreen;