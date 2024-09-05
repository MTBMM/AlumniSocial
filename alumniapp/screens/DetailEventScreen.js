import React from 'react';
import { View, Text } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const DetailEventScreen = ({ route }) => {
    const { title, content } = route.params;
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', elevation: 2 }}>
                <Icon name="arrow-back" size={25} onPress={() => navigation.goBack()} />
                <Text style={{ marginLeft: 10, fontSize: 18 }}>{title}</Text>
            </View>
            <View style={{ padding: 20 }}>
                <Text>{content}</Text>
            </View>
        </View>
    );
};

export default DetailEventScreen;
