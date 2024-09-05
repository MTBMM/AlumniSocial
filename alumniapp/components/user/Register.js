import React, { useContext, useState } from "react";
import { ActivityIndicator, Text, View, TextInput, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';

import MyStyles from "../../styles/MyStyles";
import axios from "axios";
import SignUpFirebase from "../ChatApp/SignUpFirebase";
import { useDispatch } from "react-redux";


const form = new FormData();
const Register = ({ navigation }) => {

  const checkPasswordMatch = () => {
    return user.password === user.confirm;
  };

  const [img, setImg] = useState("");
  const [user, setUser] = useState({
    "student_id": "",
    "last_name": "",
    "first_name": "",
    "username": "",
    "email": "",
    "password": "",
    "confirm": "",
    "avatar": null
  });
  const dispatch1 = useDispatch();

  const register = async () => {
    // console.log(user.username)
    dispatch1(SignUpFirebase(user.username, user.password, user.last_name, user.first_name))

    setLoading(true);
    for (let key in user) {
     if(key!=='avatar' && key!=='confirm')
             {
                 form.append(key, user[key]);
             }
    }

    if (user.confirm !== user.password) {
      Alert.alert("Cảnh báo", "Nhập lại mật khẩu!!");
      setLoading(false);
      return;
    }

    try {
      let res = await axios.post("http://192.168.1.5:8000/Alumnus/", form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.info(res.data);
      navigation.navigate("Login")
      Alert.alert("Thông báo", "Đăng kí thành công!!!");
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const change = (field, value) => {
    setUser(user => {
      return { ...user, [field]: value };
    });
  };

  const [loading, setLoading] = useState(false);

  const picker = async () => {
    setLoading(true);
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permission Denied");
    } else {
      let res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) {
        console.log('Đường dẫn ảnh được chọn:', res.assets[0].uri);
        console.log('Dữ liệu trong biến avatar:', res.assets[0]);
        setImg(res.assets[0].fileName);
        form.append('avatar', {
          uri:res.assets[0].uri,
          type:res.assets[0].mimeType,
          name: res.assets[0].fileName,
        });

        change("avatar", res.assets[0]);
      }
    }

    setLoading(false);
  };

  return (
    <View style={MyStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <Text style={MyStyles.subject}>ĐĂNG KÝ</Text>
          <TextInput value={user.student_id} onChangeText={t => change("student_id", t)} placeholder="id..." style={MyStyles.input} />
          <TextInput value={user.first_name} onChangeText={t => change("first_name", t)} placeholder="Tên..." style={MyStyles.input} />
          <TextInput value={user.last_name} onChangeText={t => change("last_name", t)} placeholder="Họ và chữ lót..." style={MyStyles.input} />
          <TextInput value={user.username} onChangeText={t => change("username", t)} placeholder="Tên đăng nhập..." style={MyStyles.input} />
          <TextInput value={user.email} onChangeText={t => change("email", t)} placeholder="email..." style={MyStyles.input} />
          <TextInput value={user.password} onChangeText={t => change("password", t)} secureTextEntry={true} placeholder="Mật khẩu..." style={MyStyles.input} />
          <TextInput value={user.confirm} onChangeText={t => change("confirm", t)} secureTextEntry={true} placeholder="Xác nhận lại mật khẩu..." style={MyStyles.input} />
          {user.avatar ? <Image style={MyStyles.avt} source={{ uri: user.avatar.uri }} /> : ""}
          {img!==""?<Text style={MyStyles.imgName}>{img}</Text>:<></>}
          {loading===true?<ActivityIndicator/>:<>
          <TouchableOpacity onPress={picker} style={MyStyles.input}>
               <Text>Chọn ảnh đại diện...</Text>
          </TouchableOpacity>
           </>}
          <TouchableOpacity onPress={register}>
            <Text style={MyStyles.button}>Đăng ký</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Register;