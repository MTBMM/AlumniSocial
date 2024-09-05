import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { authAPI, endpoints } from '../../configs/API';
import MyContext from '../../configs/MyContext';
import {id, secret} from "@env"

import SignInFirebase from '../ChatApp/SignInFirebase';
import { useDispatch } from 'react-redux';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, dispatch] = useContext(MyContext);
    const dispatch1 = useDispatch();

    console.log()
    const handleLogin = async () => {
        // setIsLoading(true);
        console.log('AAAAAAA')

       dispatch1( SignInFirebase(username, password))
        try {
            const response = await API.post(endpoints['login'], {
                grant_type: 'password',
                client_id: 'Vqkbiixnxy1dLNQ0SvrbGByOoFVYwjtC0ApUwmyl',
                client_secret: 'umbKPmtEHYZo2VO1m7ALYCnKqBvq7cZpKmpdFlCEFgkLwhOihQY0erg5kOfXrorraKyIrGOU4d9j6K3VmgdxEpPpyrv5cr4xXtQAm3tLzXcKl3iej4ZGmfjCj9WBWqqn',
                username: username,
                password: password,
            });
            const accessToken = response.data.access_token;
            console.log(accessToken)
            await AsyncStorage.setItem('access-token', response.data.access_token)
            console.log(AsyncStorage.getItem('access-token'))

            let user = await authAPI(response.data.access_token).get(endpoints['current-user']);
            console.log(user.data)
            setIsLoading(false);

            dispatch({
                "type": "login",
                "payload": user.data
            });
            navigation.navigate("Home");

        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>


            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={(text) => setUsername(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? "Processing..." : "Sign In"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>


        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#ffb6c1', // Màu hồng pastel
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        color: '#007bff',
        marginTop: 10,
    },
});

export default Login;
