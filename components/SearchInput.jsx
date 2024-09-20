import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { icons } from "../constants";
import { router, usePathname } from "expo-router";

const SearchInput = ({ initialQuery, placeholder }) => {
  const pathName = usePathname();
  const [query, setQuery] = useState(initialQuery || "");
  // const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        // value={value}
        value={query}
        placeholder={placeholder}
        placeholderTextColor="#CDCDE0"
        // onChangeText={handleChangeText}
        onChangeText={(e) => setQuery(e)}
        // secureTextEntry={title === "Password" && !showPassword}
      />
      <TouchableOpacity
        onPress={() => {
          if (!query) {
            return Alert.alert(
              "Missing Query",
              "please input something to search result across database"
            );
          }

          if (pathName.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
