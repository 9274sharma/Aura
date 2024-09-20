import { Alert } from "react-native";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "aura.yash.in",
  projectId: "66df3e2c0019c3d8ca79",
  databaseId: "66df408f00217b95c16b",
  userCollectionId: "66df40b50035885ee347",
  videoCollectionId: "66df40d3001d96d50adb",
  storageId: "66df424d003426ad67a2",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", (await currentAccount).$id)]
    );

    if (!currentUser) throw Error;
    return currentUser.documents[0];

    //   const user = await databases.getDocument(
    //      databaseId,
    //      userCollectionId,
    //     client.getCurrentUser().$id
    //   );

    //   return user;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getAllPost = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};
export const getLatestPost = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt", Query.limit(7)),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);
    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId),
      Query.orderDesc("$createdAt"),
    ]);
    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

// export const getUserSavedPosts = async (userId) => {
//   try {
//     const userDoc = await databases.getDocument(
//       databaseId,
//       userCollectionId,
//       userId
//     );

//     // Check if the user has any saved videos
//     if (!userDoc.saved_videos || userDoc.saved_videos.length === 0) {
//       return [];
//     }

//     // Fetch all the saved videos
//     const savedVideos = await databases.listDocuments(
//       databaseId,
//       videoCollectionId,
//       [Query.equal("$id", userDoc.saved_videos), Query.orderDesc("$createdAt")]
//     );

//     if (!savedVideos) throw new Error("Failed to fetch saved videos");

//     return savedVideos.documents;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

export const getUserSavedPosts = async (userId) => {
  try {
    const savedVideos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.equal("saved_by", userId), Query.orderDesc("$createdAt")]
    );

    if (!savedVideos || savedVideos.documents.length === 0) {
      return [];
    }

    return savedVideos.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const saveVideoForUser = async (userId, videoId) => {
  try {
    const video = await databases.getDocument(
      databaseId,
      videoCollectionId,
      videoId
    );
    const updatedSavedBy = video.saved_by
      ? [...video.saved_by, userId]
      : [userId];

    await databases.updateDocument(databaseId, videoCollectionId, videoId, {
      saved_by: updatedSavedBy,
    });
  } catch (error) {
    Alert.alert("Error", error.message);
    throw new Error(error);
  }
};

export const removeSavedVideoForUser = async (userId, videoId) => {
  try {
    const video = await databases.getDocument(
      databaseId,
      videoCollectionId,
      videoId
    );

    const updatedSavedBy = video.saved_by.filter((id) => id !== userId);
    await databases.updateDocument(databaseId, videoCollectionId, videoId, {
      saved_by: updatedSavedBy,
    });
  } catch (error) {
    console.error("Error in removeSavedVideoForUser:", error);
    throw new Error("Failed to remove saved video for user");
  }
};
