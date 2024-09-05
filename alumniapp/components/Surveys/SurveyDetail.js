import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, endpoints } from '../../configs/API';

const SurveyDetail = ({ route, navigation }) => {
  const { surveyId } = route.params;
  const [survey, setSurvey] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  console.log(surveyId)  
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access-token');
        const response = await authAPI(accessToken).get(endpoints['getSurvey'](surveyId));
        console.log(response.data)
        setSurvey(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSurvey();
  }, [surveyId]);

  const handleSelectAnswer = (questionId, answerId) => {
    setSelectedAnswers(prevState => ({
      ...prevState,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access-token');
      const requests = Object.keys(selectedAnswers).map(questionId =>
        authAPI(accessToken).post(endpoints['UserAnswer'], {
          question: questionId,
          answer: selectedAnswers[questionId],
        })
      );
      await Promise.all(requests);
      alert('Survey submitted successfully!');
      navigation.goBack()
    } catch (error) {
      console.log(error);
      alert('Failed to submit the survey.');
    }
  };

  if (!survey) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderQuestion = ({ item }) => (
    <View style={styles.questionItem}>
      <Text style={styles.questionText}>{item.question_text}</Text>
      {item.answers.map(answer => (
        <TouchableOpacity
          key={answer.id}
          style={[
            styles.answerItem,
            selectedAnswers[item.id] === answer.id && styles.selectedAnswerItem,
          ]}
          onPress={() => handleSelectAnswer(item.id, answer.id)}
        >
          <Text style={styles.answerText}>{answer.answer_text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={survey}
        keyExtractor={item => item.id.toString()}
        renderItem={renderQuestion}
        ListHeaderComponent={() => <Text style={styles.surveyTitle}>{survey.title}</Text>}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  surveyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  questionItem: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 8,
  },
  answerItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
  },
  selectedAnswerItem: {
    backgroundColor: '#cce5ff',
  },
  answerText: {
    fontSize: 16,
  },
});

export default SurveyDetail;
