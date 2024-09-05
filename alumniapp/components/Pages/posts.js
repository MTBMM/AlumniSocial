import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Avatar, Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import EmojiButton from "./EmojiButton";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from '@react-navigation/native';
import { authAPI, endpoints } from "../../configs/API";
import { FlatList } from "react-native-gesture-handler";
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const getToken = async () => {
  return await AsyncStorage.getItem("access-token");
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReactions, setSelectedReactions] = useState({});
  const isFocused = useIsFocused();
  const [reactions, setReactions] = useState({
    like: 0,
    haha: 0,
    tym: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
          if (isFocused) {
              fetchPosts();
          }
      }, [isFocused]);

  const fetchPosts = async () => {
    try {
      const accessToken = await getToken();
            let response = await authAPI(accessToken).get(
                    endpoints["posts"]
                  );
            console.log("Post:", response)


            const postsWithComments = await Promise.all(
              response.data.map(async (post) => {
              let commentCountResponse = await authAPI(accessToken).get(
                            endpoints["postComments"](post.id)
                          );


                return { ...post, commentCount: commentCountResponse.data.length };
              })
            );

      setPosts(postsWithComments);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handleReactionPress = async (postId, reaction) => {
    try {
      const accessToken = await AsyncStorage.getItem("access-token");
      console.log(accessToken);
      const res = await authAPI(accessToken).post(
        endpoints["reactPost"](postId),
        {
          post: postId,
          reaction: reaction,
        }
      );
      setSelectedReactions((prevReactions) => ({
        ...prevReactions,
        [postId]: reaction,
      }));
      // fetchReactionsCount(postId);
    } catch (ex) {
      alert(ex);
    }
  };
  const fetchReactionsCount = async (postId) => {
    console.log("count", postId);
    try {
      const accessToken = await AsyncStorage.getItem("access-token");
      let response = await authAPI(accessToken).get(
        endpoints["countReactPost"](postId)
      );
      const { like, haha, tym } = response.data;
      setReactions({ like, haha, tym });
      console.log(like, haha, tym);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching reactions count:", error);
    }
  };

  const onComments = (postId, allowComments) => {
    navigation.navigate("CommentScreen", { postId, allowComments });
  };

  const onFixPage =  (postId) => {
       navigation.navigate("FixPage", { postId });
  };

  const onDetail =  (user) => {
         navigation.navigate("Detail", { user });
    };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  const reactionOptions = [
    { emoji: "👍", label: "Like", count: reactions.like },
    { emoji: "😂", label: "Haha", count: reactions.haha },
    { emoji: "❤️", label: "Love", count: reactions.tym },
  ];

  const renderReactionsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <FlatList
            data={reactionOptions}
            horizontal={true}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <Pressable
                style={styles.reactionButton}
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text style={styles.reactionEmoji}>{item.emoji}</Text>
                <Text style={styles.reactionLabel}>
                  {item.label}: {item.count}
                </Text>
              </Pressable>
            )}
          />
          <Pressable
            style={styles.iconX}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Icon name="close" type="font-awesome" color="#044244" size={20} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return (
    <View>
      {posts.map((post) => (
        <View key={post.id} style={styles.postContainer}>
          <TouchableOpacity onPress={() => onDetail(post.user)}>
            <View style={styles.header}>
              <Avatar
                rounded
                source={{
                  uri: post.alumni_avatar || "https://i.imgur.com/C9pGQ2h.png",
                }}
                size="medium"
              />
              <View style={styles.headerText}>
                <Text style={styles.pageName}>
                  {post.alumni_name || "Unknown User"}
                </Text>
                <Text style={styles.commentTime}>{moment(post.created_date).fromNow()}</Text>
              </View>

              <TouchableOpacity
                style={{ width: "20%", alignItems: "flex-end" }}
                onPress={() => onFixPage(post.id)}
              >
                <Icon
                  name="dots-three-horizontal"
                  type="entypo"
                  color="#044244"
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <Text style={styles.content}>{post.content}</Text>
          {post.image && (
            <Image source={{ uri: post.image }} style={styles.image} />
          )}
          <View style={styles.footer}>
            <View style={styles.reactionContainer}>
              <EmojiButton
                emoji="👍"
                count={post.reactions.like}
                isSelected={selectedReactions[post.id] === "like"}
                onSelect={() => handleReactionPress(post.id, "like")}
              />
              <EmojiButton
                emoji="😂"
                count={post.reactions.haha}
                isSelected={selectedReactions[post.id] === "haha"}
                onSelect={() => handleReactionPress(post.id, "haha")}
              />
              <EmojiButton
                emoji="❤️"
                count={post.reactions.haha}
                isSelected={selectedReactions[post.id] === "heart"}
                onSelect={() => handleReactionPress(post.id, "heart")}
              />
            </View>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => onComments(post.id, post.allow_comments)}
            >
              <Icon name="comment" type="font-awesome" color="gray" size={30} />
              <Text style={styles.footerButtonText}>
                {post.commentCount} Bình luận
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.centeredView}>
            {renderReactionsModal()}
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={() => fetchReactionsCount(post.id)}
            >
              <Text style={styles.textStyle}>{reactions.like+reactions.haha+reactions.tym} icon</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 10,
  },
  pageName: {
    fontWeight: "bold",
  },
  time: {
    color: "gray",
  },
  content: {
    marginVertical: 10,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    marginVertical: 10,
    borderRadius: 10,
  },
  reactionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerButtonText: {
    marginLeft: 5,
    color: "gray",
  },
  commentCount: {
    color: "gray",
    marginVertical: 5,
  },
  centeredView: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    marginTop: 15,
    marginRight: 3,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "blue",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  reactionButton: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  iconX: {
      marginTop: -50,
      marginLeft: 250
  },
});

export default Posts;