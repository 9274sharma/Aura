import { View, Text, FlatList } from "react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import { getUserSavedPosts } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";
import { useGlobalContext } from "../../context/GlobalProvider";

const Bookmark = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() =>
    getUserSavedPosts(user.$id)
  );

  useEffect(() => {
    refetch();
  }, []);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        // data={[]}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <Text className="font-pmedium text-sm text-gray-100">
              Search Result
            </Text>
            {/* <Text className="text-2xl font-psemibold text-white">{query}</Text> */}
            {/* <View className="mt-6 mb-8">
              <SearchInput
                initialQuery={query}
                placeholder="Search for a video topic"
              />
            </View> */}
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Video Found"
            subtitle="No Video Found for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Bookmark;
