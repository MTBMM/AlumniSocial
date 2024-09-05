import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import MyContext from '../configs/MyContext';
import API, { authAPI, endpoints } from '../configs/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, dispatch] = useContext(MyContext);

    const handleLogin = async () => {
        setIsLoading(true);
        console.log(username)
        console.log(password)

        try {
            const response = await API.post(endpoints['login'], {
                grant_type: 'password',
                client_id: 'xAdBRkZfHPcIDXpasXxyBNuu5OobVcrcpkzSr8TA',
                client_secret: 'rNjpNIlGeifKkIHHhoKlcrsiHEKw9U2OD6wlAzDU8dts11HO4nVOP09lsQUW6LBVNKREvTOqrcre2N1kriYaNsAKKNBf9IpJuyh8DSCK8fbi5wc1YJnatTKsiKR95BzJ',
                username: username,
                password: password,
            });
            const accessToken = response.data.access_token;
            console.log(accessToken)
            await AsyncStorage.setItem('access-token', response.data.access_token)
            // console.log(AsyncStorage.getItem('access-token'))

            let user = await authAPI(response.data.access_token).get(endpoints['current-user']);

            console.log("==============================================================", user)
            setIsLoading(false);
            // navigation.navigate('AdminHome');
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
