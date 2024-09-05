// FacebookPost.js

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import Icon from "@expo/vector-icons/Entypo";

const EventPage = ({
  title,
  content,
  date,
  profile,
  photo,
  onPress,
  onComments,
  onDetailEvent,
  onFixPage,
}) => {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    // onLike(!liked); // Truyền trạng thái like mới qua prop onLike
  };

  return (
    <View>
      <View style={postStyles.postContainer}>
        <View style={{ width: "20%" }}>
          <Image
            source={profile}
            style={postStyles.profileImage}
          />
        </View>
        <View style={postStyles.profileInfo}>
          <Text style={postStyles.profileText}>
            admin
          </Text>
          <Text style={postStyles.profileText}>{date}</Text>
        </View>
        <TouchableOpacity
          style={{ width: "20%", alignItems: "flex-end" }}
          onPress={onFixPage}
        >
          <Icon name="sound-mix" color="#044244" size={20} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onDetailEvent}>
        <View style={postStyles.title}>
          <Text>{title}</Text>
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", width: "100%", paddingTop: 20 }}>
        <ImageBackground
          source={photo}
          style={{
            width: "100%",
            height: 220,
          }}
          imageStyle={{ borderRadius: 30 }}
        >
          <View
            style={{
              height: "100%",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={onComments}
              style={[
                postStyles.postActions,
                { marginBottom: 20, marginRight: 150 },
              ]}
            >
              <Icon name="chat" color="#044244" size={20} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onPress} style={postStyles.postActions}>
              <Icon name="forward" color="#044244" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleLike} // Sử dụng hàm toggleLike thay vì onLike
              style={[
                postStyles.postActions,
                { marginLeft: 10, marginRight: 20 },
              ]}
            >
              <Icon
                name={liked ? "heart" : "heart-outlined"}
                color={liked ? "red" : "#044244"}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

import { StyleSheet } from "react-native";

const postStyles = StyleSheet.create({
  title: {
    fontFamily: "Bold",
    fontSize: 18,
    color: "#044244",
    // paddingHorizontal: 20,
    marginLeft: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 13,
  },
  profileInfo: {
    width: "60%",
  },
  postContainer: {
    flexDirection: "row",
    paddingTop: 10,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  postActions: {
    marginBottom: 20,
    borderRadius: 5,
    padding: 5,
    backgroundColor: "#e8e8e8",
  },
});
export default EventPage;
