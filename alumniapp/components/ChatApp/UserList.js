import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../../configs/Firebase';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);
  console.log("aaa")
  alert("aaa")
  const startConversation = (userId) => {
    navigation.navigate('ChatScreen', { recipientId: userId });
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => startConversation(item.userId)}>
            <View style={{ padding: 10, backgroundColor: '#f9f9f9', marginVertical: 5 }}>
              <Text>{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default UsersList;
