import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/API";
import { Icon } from "react-native-elements";

const SurveyList = ({ navigation }) => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access-token");
        const response = await authAPI(accessToken).get(endpoints["surveys"]);
        console.log(accessToken);
        setSurveys(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSurveys();
  }, []);

  const renderSurvey = ({ item }) => (
    <View style={styles.surveyContainer}>
      <TouchableOpacity
        style={styles.surveyItem}
        onPress={() =>
          navigation.navigate("SurveyDetail", { surveyId: item.id })
        }
      >
        <Text style={styles.surveyTitle}>{item.title}</Text>
      </TouchableOpacity>
      <TouchableOpacity  style={styles.barChart} onPress={() => navigation.navigate("SurveyResults", {surveyId: item.id})}>
            <Icon name="bar-chart" size={34} color="#4CAF50" />

      </TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={surveys}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSurvey}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  surveyItem: {
    flex: 1,

    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  surveyContainer: {
    flex: 1,
    flexDirection: "row"

  },
  barChart: {
        alignItems: 'center'
  }
});

export default SurveyList;
