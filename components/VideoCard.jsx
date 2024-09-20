import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { icons } from "../constants";
import { useEffect, useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { useGlobalContext } from "../context/GlobalProvider";
import { removeSavedVideoForUser, saveVideoForUser } from "../lib/appwrite";

const VideoCard = ({
  video: {
    $id,
    title,
    thumbnail,
    video,
    users,
    creator: { username, avatar },
  },
}) => {
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (user && users) {
      const userIds = users.map((userObj) => userObj.$id);

      const isSaved = userIds.includes(user.$id);
      setIsBookmarked(isSaved);
    }
  }, [users, user]);

  const handleBookmarkPress = async () => {
    if (!user || !$id) {
      Alert.alert("Error", "User not available or invalid video ID.");
      return;
    }

    console.log("userid", user.$id);
    console.log("video id", $id);
    try {
      if (isBookmarked) {
        await removeSavedVideoForUser(user.$id, $id);
        setIsBookmarked(false);
      } else {
        await saveVideoForUser(user.$id, $id);
        setIsBookmarked(true);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to ${isBookmarked ? "unsave" : "save"} video`
      );
    }
  };

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 item-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMethod="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-gray-100 font-pregular text-xs"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="pt-3" onPress={handleBookmarkPress}>
          <Image
            source={icons.bookmark}
            className="w-5 h-5"
            resizeMode="contain"
            style={{ tintColor: isBookmarked ? "green" : "white" }}
          />
        </TouchableOpacity>
      </View>
      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setPlay(true);
          }}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
