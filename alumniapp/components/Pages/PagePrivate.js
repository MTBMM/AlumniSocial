import React, { useContext, useState } from 'react';
import { Text, View, ImageBackground, Image, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/Entypo';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Posts from './posts';
import MyContext from '../../configs/MyContext';
const PagePrivate = ({ navigation }) => {
    const [collectionSelected, setCollectionSelected] = useState(true);
    const [user, dispatch] = useContext(MyContext);
    console.log(user)
    const onTabPressed = () => {
        setCollectionSelected(!collectionSelected);
    };

    return (
        <ScrollView style={detailStyles.container}
        >
            <ImageBackground
                source={require('../../images/1.jpg')}
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

                    {/* Phần nội dung khác của header */}

                </View>
            </ImageBackground>
            <View style={detailStyles.avatarContainer}>
                <Image
                    source={require('../../images/2.jpg')}
                    style={detailStyles.avatarImage}
                />
                {/* <Text style={detailStyles.username}>Ksenia Bator</Text> */}
                <Text style={detailStyles.location}>{user.username}</Text>
            </View>

            {/* <View style={detailStyles.collectionContainer}>
                Các nút tab COLLECTIONS và FEATURED 
               
            </View> */}

            <View style={{ flexDirection: 'row' }}>

                <Posts
                    name="Erka Berka"
                    profile={require('../../images/p2.jpg')}
                    photo={require('../../images/6.jpg')}
                />

            </View>

            <View style={{ flexDirection: 'row' }}>

                <Posts
                    name="Erka Berka"
                    profile={require('../../images/p2.jpg')}
                    photo={require('../../images/6.jpg')}
                />

            </View>

            <View style={{ flexDirection: 'row' }}>

                <Posts
                    name="Erka Berka"
                    profile={require('../../images/p2.jpg')}
                    photo={require('../../images/6.jpg')}
                />

            </View>

            <View style={{ flexDirection: 'row' }}>

                <Posts
                    name="Erka Berka"
                    profile={require('../../images/p2.jpg')}
                    photo={require('../../images/6.jpg')}
                />

            </View>


            {/* <View style={{ flexDirection: 'row' }}>
                <View style={detailStyles.collectionCard}>

                </View>

                <View style={detailStyles.featuredBar}>
                  
                </View>
            </View> */}
        </ScrollView>
    );
};


export const detailStyles = StyleSheet.create({
    container: {
        backgroundColor: '#044244',
        // height: '100%',
        flex:1

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
    }
    // Các kiểu dáng khác bạn muốn tách ra cũng có thể được định nghĩa ở đây
});
export default PagePrivate;
