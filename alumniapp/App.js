import React, { useContext, useEffect, useReducer, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import Register from "./components/user/Register";
import Home from "./screens/Home";
import Detail from "./screens/Detail";
// import { createDrawerNavigator } from '@react-navigation/drawer';
import MyContext from "./configs/MyContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MyUserReducer from "./reducers/MyUserReducer";
import CommentScreen from "./screens/CommentScreen";
import Icon from "react-native-vector-icons/FontAwesome";
import { Alert, Platform, View } from "react-native";
import { STATUSBAR_HEIGHT } from "./constants";
import PagePrivate from "./components/Pages/PagePrivate";
import Fixpage from "./components/Pages/FixPage";
import Login from "./components/user/Login";
import ProfileScreen from "./screens/ProfileScreen";
import AdminCreateEventScreen from "./screens/AdminCreateEventScreen";
import NotificationsScreen from "./screens/NotificationScreen";
import { StyleSheet, Text } from "react-native";
import { authAPI, endpoints } from "./configs/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DetailEventScreen from "./screens/DetailEventScreen";
import CreateSurveyScreen from "./screens/SurveyScreen/CreateSurveyScreen";
import SurveyDetail from "./components/Surveys/SurveyDetail";
import SurveyList from "./components/Surveys/SurveyList";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SurveyResults from "./components/Surveys/SurveyResults";
import ChatScreen from "./components/ChatApp/ChatScreen";
import NewChatScreen from "./components/ChatApp/NewChatScreen";
import ChatListScreen from "./components/ChatApp/ChatListScreen";
import UsersList from "./components/ChatApp/UserList";
import { store } from "./components/ChatApp/store/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { setStoredUsers } from "./components/ChatApp/store/userSlice";
import { getFirebaseApp } from "./configs/Firebase";
import { child, get, getDatabase, off, onValue, ref } from "firebase/database";
import { setChatsData } from "./components/ChatApp/store/chatSlice";
import { setChatMessages } from "./components/ChatApp/store/messagesSlice";
import { TouchableOpacity } from "react-native-gesture-handler";
import StatisticsScreen from "./screens/StatisticsScreen";

const Stack = createStackNavigator();
const ChatStack = createStackNavigator();
// const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const rootStack = createStackNavigator();

const homeTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        options={{ cardStyle: { backgroundColor: "transparent" } }}
        name="CommentScreen"
        component={CommentScreen}
      />
      <Stack.Screen name="PagePrivate" component={PagePrivate} />
      <Stack.Screen name="FixPage" component={Fixpage} />
      <Stack.Screen name="DetailEvent" component={DetailEventScreen} />
      <Stack.Screen name="SurveyDetail" component={SurveyDetail} />
      <Stack.Screen name="SurveyList" component={SurveyList} />
      <Stack.Screen name="SurveyResults" component={SurveyResults} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="Detail" component={Detail} />

      <Stack.Group>
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="ChatListScreen"
          component={ChatListScreen}
          options={({ navigation }) => ({
            headerTitle: "Users",
            headerBackTitle: "Back",
            headerShown: true,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("NewChat");
                  /* Hành động khi nhấn vào biểu tượng */
                }}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={25}
                  color="black"
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Group>

      <Stack.Group screenOptions={{ presentation: "containedModal" }}>
        <Stack.Screen name="NewChat" component={NewChatScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const MainTab = () => {
  const [user, dispatch] = useContext(MyContext);
  // const [user, dispatch] = useReducer(MyUserReducer, null);

  const [notificationCount, setNotificationCount] = useState(0); // Example count
  useEffect(() => {
    const getNotificationUnread = async () => {
      try {
        let accessToken = await AsyncStorage.getItem("access-token");

        let res = await authAPI(accessToken).get(
          endpoints["NotificationUnread"]
        );
        console.log("API response:", res.data); // Kiểm tra dữ liệu trả về từ API

        setNotificationCount(res.data.length);
      } catch (ex) {
        console.log(ex);
      }
    };
    getNotificationUnread();
  }, []);
  console.log(notificationCount);
  console.log("aaaaaaaaaaaaaaaaaaaa")

    ChatApp()

 
  

 

  return (
    <Tab.Navigator>
      <Tab.Screen
        options={{
          tabBarIcon: ({ tintColor, focused }) => (
            <Icon
              name="home"
              size={30}
              color={focused ? "blue" : "gray"}
            ></Icon>
          ),
        }}
        name="Home"
        component={homeTab}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name="user" size={30} color={focused ? "blue" : "gray"} />
          ),
        }}
      />
      {user.role === "admin" && (
        <>
          <Tab.Screen
            name="AdminCreateEvent"
            component={AdminCreateEventScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <MaterialIcons
                  name="create"
                  size={30}
                  color={focused ? "blue" : "gray"}
                />
              ),
            }}
          />

          <Tab.Screen
            name="CreateSurvey"
            component={CreateSurveyScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name="create-sharp"
                  size={30}
                  color={focused ? "blue" : "gray"}
                />
              ),
            }}
          />
        </>
      )}

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Icon
                name="bell"
                size={30}
                color={focused ? "#6633FF" : "gray"}
              />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const ChatApp = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  console.log(userData);
  console.log(userData);

  if (userData != "") {
    useEffect(() => {
      console.log("Subscribing to firebase listeners");

      const app = getFirebaseApp();
      const dbRef = ref(getDatabase(app));
      const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
      const refs = [userChatsRef];

      onValue(userChatsRef, (querySnapshot) => {
        const chatIdsData = querySnapshot.val() || {};
        const chatIds = Object.values(chatIdsData);

        const chatsData = {};
        let chatsFoundCount = 0;

        for (let i = 0; i < chatIds.length; i++) {
          const chatId = chatIds[i];
          const chatRef = child(dbRef, `chats/${chatId}`);
          refs.push(chatRef);

          onValue(chatRef, (chatSnapshot) => {
            chatsFoundCount++;

            const data = chatSnapshot.val();

            if (data) {
              data.key = chatSnapshot.key;

              data.users.forEach((userId) => {
                if (storedUsers[userId]) return;

                const userRef = child(dbRef, `users/${userId}`);

                get(userRef).then((userSnapshot) => {
                  const userSnapshotData = userSnapshot.val();
                  dispatch(setStoredUsers({ newUsers: { userSnapshotData } }));
                });

                refs.push(userRef);
              });

              chatsData[chatSnapshot.key] = data;
            }

            if (chatsFoundCount >= chatIds.length) {
              dispatch(setChatsData({ chatsData }));
              setIsLoading(false);
            }
          });
          const messagesRef = child(dbRef, `messages/${chatId}`);
          refs.push(messagesRef);

          onValue(messagesRef, (messagesSnapshot) => {
            const messagesData = messagesSnapshot.val();
            dispatch(setChatMessages({ chatId, messagesData }));
          });

          if (chatsFoundCount == 0) {
            setIsLoading(false);
          }
        }
      });

      return () => {
        console.log("Unsubscribing firebase listeners");
        refs.forEach((ref) => off(ref));
      };
    }, []);
  }
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  console.log("aaa");
  return (
    <Provider store={store}>
      <MyContext.Provider value={[user, dispatch]}>
        <NavigationContainer>
          <rootStack.Navigator>
            {user === null ? (
              <>
                <rootStack.Screen
                  name="Login"
                  component={Login}
                  options={{ title: "Đăng nhập" }}
                />
                <rootStack.Screen
                  name="Register"
                  component={Register}
                  options={{ title: "Đăng ký" }}
                />
              </>
            ) : (
              <>
                <rootStack.Screen
                  options={{ headerShown: false }}
                  component={MainTab}
                  name="Home"
                />
              </>
            )}
          </rootStack.Navigator>
        </NavigationContainer>
      </MyContext.Provider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 3,
    minWidth: 20,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
export default App;
