import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI, endpoints } from "../configs/API";

const StatisticsScreen = () => {
  const navigation = useNavigation();
  const [statistics, setStatistics] = useState({ users_by_period: [], posts_by_period: [] });
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null); // Reset error state
      try {
        const accessToken = await AsyncStorage.getItem('access-token');
        const response = await authAPI(accessToken).get(`${endpoints.stats}?period=${selectedPeriod}`);
        setStatistics(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedPeriod]);

  const screenWidth = Dimensions.get('window').width;

  const preparePieChartData = (data, period) => {
    return data.map(item => ({
      name: `${period.charAt(0).toUpperCase()}${period.slice(1)} ${item[period]}`,
      population: item.count,
      color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
    }));
  };

  const renderPieChart = (data, title) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <PieChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );

  const renderDataTable = (data, title, period) => (
    <View style={styles.tableContainer}>
      <Text style={styles.tableTitle}>{title}</Text>
      <ScrollView horizontal={true}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { marginRight: 65 }]}>Thời gian</Text>
            <Text style={[styles.columnHeader, { marginLeft: 65 }]}>Số lượng</Text>
          </View>
          {data.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.columnCell, { marginRight: 35 }]}>{item[period]}</Text>
              <Text style={[styles.columnCell, { marginLeft: 35 }]}>{item.count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
        <MaterialIcons name="arrow-back" size={24} color="blue" />
      </TouchableOpacity>
      <Text style={styles.title}>Thống kê</Text>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPeriod}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
            >
              <Picker.Item label="Năm" value="year" />
              <Picker.Item label="Tháng" value="month" />
              <Picker.Item label="Quý" value="quarter" />
            </Picker>
          </View>
          {statistics.users_by_period.length > 0 && renderPieChart(preparePieChartData(statistics.users_by_period, selectedPeriod), 'Người dùng')}
          {statistics.users_by_period.length > 0 && renderDataTable(statistics.users_by_period, 'Thống kê Người dùng', selectedPeriod)}

          {statistics.posts_by_period.length > 0 && renderPieChart(preparePieChartData(statistics.posts_by_period, selectedPeriod), 'Bài viết')}
          {statistics.posts_by_period.length > 0 && renderDataTable(statistics.posts_by_period, 'Thống kê Bài viết', selectedPeriod)}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    width: '80%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignSelf: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    alignSelf: 'center',
  },
  chartContainer: {
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  tableContainer: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    alignSelf: 'center',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  columnHeader: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginBottom: 5,
  },
  columnCell: {
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  errorContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default StatisticsScreen;
