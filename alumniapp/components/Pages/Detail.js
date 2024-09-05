import React, { useState, useEffect } from 'react';
import { Text, View, ImageBackground, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Entypo';
import { StyleSheet } from 'react-native';
import Posts from './posts';
import { authAPI, endpoints } from "../../configs/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Detail = ({ navigation, route }) => {
    const { user } = route.params;
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchTimeline = async () => {
        try {
          let accessToken = await AsyncStorage.getItem("access-token");
          let res = await authAPI(accessToken).get(endpoints["timeLine"](2));
          setProfile(profile);
          setPosts(posts);
        } catch (ex) {
          console.log(ex);
        }
      };
      fetchTimeline();
    }, []);

    if (loading) {
        return (
            <View style={detailStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#044244" />
            </View>
        );
    }

    return (
        <ScrollView style={detailStyles.container}>
            <ImageBackground
                source={profile && profile.cover ? { uri: profile.cover } : require('../../images/1.jpg')}
                style={detailStyles.coverImage}
            >
                <View style={detailStyles.headerContainer}>
                    <View style={detailStyles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ width: '50%' }}
                        >
                            <Icon name="chevron-left" size={24} color="#044244" />
                        </TouchableOpacity>
                        <View style={{ width: '50%', alignItems: 'flex-end' }}>
                            <Icon name="dots-two-vertical" size={24} color="#044244" />
                        </View>
                    </View>
                </View>
            </ImageBackground>
            <View style={detailStyles.avatarContainer}>
                <Image
                    source={profile && profile.avatar ? { uri: profile.avatar } : require('../../images/2.jpg')}
                    style={detailStyles.avatarImage}
                />
                <Text style={detailStyles.username}>{profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}</Text>
                <Text style={detailStyles.location}>Location unknown</Text>
            </View>

            {posts.map((post, index) => (
                <View key={index} style={{ flexDirection: 'row' }}>
                    <Posts
                        name={post.alumni_name}
                        profile={{ uri: post.alumni_avatar }}
                        photo={{ uri: post.image }}
                        content={post.content}
                        created_date={post.created_date}
                    />
                </View>
            ))}
        </ScrollView>
    );
};

export const detailStyles = StyleSheet.create({
    container: {
        backgroundColor: '#044244',
        flex: 1
    },
    headerContainer: {
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        height: '40%',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    headerContent: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 40,
    },
    tabButton: {
        borderBottomWidth: 4,
        paddingVertical: 6,
        marginLeft: 30,
    },
    collectionContainer: {
        flexDirection: 'column',
        paddingHorizontal: 40,
        paddingTop: 20,
    },
    collectionCard: {
        backgroundColor: '#728c8e',
        height: 260,
        width: 280,
        marginHorizontal: 40,
        borderRadius: 30,
        marginTop: 30,
    },
    featuredBar: {
        height: 180,
        backgroundColor: '#FFF',
        width: 20,
        marginLeft: -20,
        marginTop: 70,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: -50,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    username: {
        fontSize: 22,
        fontFamily: 'Bold',
        color: '#044244',
        marginTop: 10,
    },
    location: {
        fontFamily: 'Medium',
        fontSize: 20,
        color: '#9ca1a2',
    },
    coverImage: {
        height: 300,
        resizeMode: 'cover',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#044244',
    },
});
export default Detail;
