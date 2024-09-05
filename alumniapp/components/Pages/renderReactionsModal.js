import { useState } from "react";
import { StyleSheet } from "react-native";

const reactionOptions = [
    { emoji: "👍", label: "Like" },
    { emoji: "😂", label: "Haha" },
    { emoji: "❤️", label: "Love" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😡", label: "Angry" },
    { emoji: "😲", label: "Wow" },
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
                  handleReactionPress(selectedPostId, item.label.toLowerCase());
                  setModalVisible(false);
                }}
              >
                <Text style={styles.reactionEmoji}>{item.emoji}</Text>
                <Text style={styles.reactionLabel}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
 const styles = StyleSheet.create({

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2
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
  reactionButton: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  reactionEmoji: {
    fontSize: 30,
  },
  reactionLabel: {
    fontSize: 12,
    color: "gray",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
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
})
  export default renderReactionsModal