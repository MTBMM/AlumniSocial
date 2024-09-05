import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import axios from "axios";
import { authAPI, endpoints } from "../../configs/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome';

const screenWidth = Dimensions.get("window").width;

const SurveyResults = ({ route }) => {
  const{ surveyId } = route.params 
  console.log(surveyId);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      let acesssToken = await AsyncStorage.getItem("access-token");
      let response = await authAPI(acesssToken).get(
        endpoints["reportSurey"](surveyId)
      );
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Survey Results</Text>
      {results.map((item, index) => {
        const labels = item.answers.map((answer) => answer.answer);
        const data = item.answers.map((answer) => answer.count);

        return (
          <View key={index} style={styles.chartContainer}>
            <Text style={styles.question}>{item.question}</Text>
            <BarChart
              data={{
                labels: labels,
                datasets: [
                  {
                    data: data,
                  },
                ],
              }}
              width={screenWidth - 32}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
            <View style={styles.iconsContainer}>
              {item.answers.map((answer, idx) => (
                <View key={idx} style={styles.iconItem}>
                  <Icon name="bar-chart" size={24} color="#4CAF50" />
                  <Text style={styles.iconText}>{answer.answer}: {answer.count}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  iconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  iconText: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default SurveyResults;
