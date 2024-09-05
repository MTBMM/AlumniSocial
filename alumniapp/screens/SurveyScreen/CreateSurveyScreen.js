import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/API";
import Icon from "react-native-vector-icons/FontAwesome";
import AntDesign from 'react-native-vector-icons/AntDesign';


const CreateSurveyScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question_text: "",
      answers: [{ id: Date.now(), answer_text: "" }],
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        question_text: "",
        answers: [{ id: Date.now(), answer_text: "" }],
      },
    ]);
  };

  const handleAddAnswer = (questionId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: [...q.answers, { id: Date.now(), answer_text: "" }],
            }
          : q
      )
    );
  };

  const handleChangeQuestion = (questionId, text) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, question_text: text } : q
      )
    );
  };

  const handleChangeAnswer = (questionId, answerId, text) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, answer_text: text } : a
              ),
            }
          : q
      )
    );
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const handleDeleteAnswer = (questionId, answerId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
          : q
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access-token");
      await authAPI(accessToken).post(endpoints["surveys"], {
        content: "khao sat",
        title,
        questions: questions.map((q) => ({
          question_text: q.question_text,
          answers: q.answers.map((a) => ({ answer_text: a.answer_text })),
        })),
      });
      alert("Survey created successfully!");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      alert("Failed to create the survey.");
    }
  };

  const renderQuestion = ({ item }) => (
    <View style={styles.questionItem}>
      <TextInput
        style={styles.input1}
        placeholder="Enter question"
        value={item.question_text}
        onChangeText={(text) => handleChangeQuestion(item.id, text)}
      />
      <FlatList
        data={item.answers}
        keyExtractor={(answer) => answer.id.toString()}
        renderItem={({ item: answer }) => (
          <View style={styles.answerItem}>
            <TextInput
              style={styles.input1}
              placeholder="Enter answer"
              value={answer.answer_text}
              onChangeText={(text) =>
                handleChangeAnswer(item.id, answer.id, text)
              }
            />
            <TouchableOpacity
              onPress={() => handleDeleteAnswer(item.id, answer.id)}
            >
              <Icon
                name="trash"
                size={24}
                color="#FF6347"
                style={styles.iconButton}
              />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.trashPlus}>
            <TouchableOpacity onPress={() => handleAddAnswer(item.id)}>
              <Icon
                name="plus"
                size={24}
                color="#1E90FF"
                style={styles.iconButton}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteQuestion(item.id)}>
              <Icon
                name="trash"
                size={20}
                color="#FF6347"
                style={styles.iconButton}
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter survey title"
        value={title}
        onChangeText={setTitle}
      />
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderQuestion}
        ListFooterComponent={() => (
          <TouchableOpacity onPress={handleAddQuestion}>
            <AntDesign name="plussquareo" size={40} color="#1E90FF" style={styles.iconButton} />

          </TouchableOpacity>
        )}
      />
      <Button title="Submit Survey" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 20,
    marginBottom: 8,
    // flex: 1,
  },
  input1: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    flex:1
  },
  questionItem: {
    marginBottom: 16,
  },
  answerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  trashPlus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconButton: {
    marginLeft: 8,
  },
  addButton: {
    color: "#1E90FF",
    marginBottom: 8,
  },
});

export default CreateSurveyScreen;
