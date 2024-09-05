import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";

const reactions = [
  { type: "like", emoji: "👍", color: "blue" },
  { type: "love", emoji: "❤️", color: "red" },
  { type: "care", emoji: "🥰", color: "orange" },
  { type: "haha", emoji: "😂", color: "yellow" },
];

const ReactionBar = ({ onReact }) => {
  return (
    <View style={styles.reactionBar}>
      {reactions.map((reaction) => (
        <TouchableOpacity
          key={reaction.type}
          onPress={() => onReact(reaction.type)}
        >
          <Text style={{ fontSize: 24 }}>{reaction.emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  reactionBar: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    elevation: 3,
  },
});

export default ReactionBar;
