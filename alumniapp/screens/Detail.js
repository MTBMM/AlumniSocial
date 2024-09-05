import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, endpoints } from '../configs/API';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const DEFAULT_AVATAR = '../images/default-avatar.png';
const DEFAULT_COVER = '../images/default-cover.png';

const Detail = ({ navigation, route }) => {
  const { user } = route.params;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfileAndPosts = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access-token');

        const profileResponse = await authAPI(accessToken).get(
          endpoints['profile'](user)
        );
        setProfile(profileResponse.data);

        const postsResponse = await authAPI(accessToken).get(
          endpoints['timeLine'](user)
        );
        const postsWithCommentsAndReactions = await Promise.all(
          postsResponse.data.map(async (post) => {
            const [commentCountResponse, reactionsResponse] = await Promise.all([
              authAPI(accessToken).get(endpoints['postComments'](post.id)),
              authAPI(accessToken).get(endpoints['countReactPost'](post.id)),
            ]);

            return {
              ...post,
              commentCount: commentCountResponse.data.length,
              reactions: reactionsResponse.data,
              totalReactions: Object.values(reactionsResponse.data).reduce((a, b) => a + b, 0),
            };
          })
        );
        setPosts(postsWithCommentsAndReactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile or posts:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchUserProfileAndPosts();
  }, [user]);

  const renderPostItem = ({ item }) => {
    const onFixPage = () => {
      navigation.navigate('FixPage', { postId: item.id });
    };

    const onComments = () => {
      navigation.navigate('CommentScreen', {
        postId: item.id,
        allowComments: item.allow_comments,
      });
    };

    const onDetail = () => {
      navigation.navigate('Detail', { user: item.user });
    };

    return (
      <View style={styles.postContainer}>
        <TouchableOpacity onPress={onDetail}>
          <View style={styles.header}>
            <Avatar
              rounded
              source={{ uri: item.alumni_avatar || DEFAULT_AVATAR }}
              size="medium"
            />
            <View style={styles.headerText}>
              <Text style={styles.username}>{item.alumni_name}</Text>
              <Text style={styles.time}>
                {moment(item.created_date).fromNow()}
              </Text>
            </View>
            <TouchableOpacity onPress={onFixPage}>
              <Icon
                name="dots-three-horizontal"
                type="entypo"
                size={24}
                color="#044244"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <Text style={styles.content}>{item.content}</Text>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
        <View style={styles.footer}>
          <View style={styles.reactionContainer}>
            <View style={styles.reactionItem}>
              <Icon name="thumbs-up" type="font-awesome-5" color="#3b5998" size={18} />
              <Text style={styles.reactionCount}>{item.reactions.like}</Text>
            </View>
            <View style={styles.reactionItem}>
              <Icon name="laugh" type="font-awesome-5" color="#f39c12" size={18} />
              <Text style={styles.reactionCount}>{item.reactions.haha}</Text>
            </View>
            <View style={styles.reactionItem}>
              <Icon name="heart" type="font-awesome-5" color="#e74c3c" size={18} />
              <Text style={styles.reactionCount}>{item.reactions.heart}</Text>
            </View>
          </View>
          <Text style={styles.totalReactionsText}>
            Tổng: {item.totalReactions}
          </Text>
          <TouchableOpacity onPress={onComments} style={styles.commentButton}>
            <Icon
              name="comment"
              type="font-awesome"
              color="gray"
              size={20}
            />
            <Text style={styles.footerButtonText}>{item.commentCount} Bình luận</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#044244" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red' }}>Error fetching data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={{ uri: profile.cover || DEFAULT_COVER }}
        style={styles.coverImage}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color="#044244" />
          </TouchableOpacity>
          <View style={{ width: '50%', alignItems: 'flex-end' }}>
            <Icon name="dots-two-vertical" type="entypo" size={24} style={ styles.dotsContainer } color="#044244" />
          </View>
        </View>
      </ImageBackground>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: profile.avatar || DEFAULT_AVATAR }} style={styles.avatar} />
        <Text style={styles.location}>{`${profile.first_name} ${profile.last_name}`}</Text>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    height: 200,
        resizeMode: 'cover',
        justifyContent: 'flex-end',
        alignItems: 'flex-start', // Align the back button to the left
        paddingLeft: 20, // Add some left padding for better spacing
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
  },
  location: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#044244',
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    marginLeft: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  time: {
    color: 'gray',
  },
  content: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  reactionCount: {
    marginLeft: 5,
    color: 'gray',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    marginLeft: 5,
    color: 'gray',
  },
  totalReactionsText: {
    color: 'gray',
  },
  backButton: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
  },
  dotsContainer: {
      width: 700,
      height: 150,
      justifyContent: 'center',
      alignItems: 'center',
      top: 20,
      right: 10,
    },
});

export default Detail;
