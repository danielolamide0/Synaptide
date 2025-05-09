import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  DocumentData, 
  where, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  Timestamp 
} from "firebase/firestore";
import { Message, UserProfile, User } from "@shared/schema";

// Log environment variables for debugging
console.log("Firebase config check:", {
  apiKey: process.env.VITE_FIREBASE_API_KEY ? "Present" : "Missing",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ? "Present" : "Missing",
  appId: process.env.VITE_FIREBASE_APP_ID ? "Present" : "Missing",
});

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: process.env.VITE_FIREBASE_APP_ID,
  // Adding these to fix Firebase permissions
  databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Root collection for all user data
const chatsCollection = collection(db, "chats");

export { db, chatsCollection };

// Helper function to get a reference to a user document
export const getUserDoc = (userId: string) => {
  return doc(chatsCollection, userId);
};

// Helper function to get messages collection for a specific user
export const getUserMessagesCollection = (userId: string) => {
  return collection(getUserDoc(userId), "messages");
};

// Helper function to get profile document for a specific user
export const getUserProfileDoc = (userId: string) => {
  return doc(collection(getUserDoc(userId), "profile"), "data");
};

// Helper function to get summaries collection for a specific user
export const getUserSummariesCollection = (userId: string) => {
  return collection(getUserDoc(userId), "summaries");
};

// Helper function to get user directly by name (using name as document ID)
export const getUserByName = async (name: string): Promise<User | null> => {
  try {
    // Trim the name to ensure consistency
    const trimmedName = name.trim();
    console.log(`Looking for user with trimmed name: ${trimmedName}`);
    
    // Look up user directly in the chats collection using trimmed name as document ID
    const userDoc = getUserDoc(trimmedName);
    const userDataDoc = await getDoc(userDoc);
    
    if (!userDataDoc.exists()) {
      console.log(`No user found with name: ${name}`);
      return null;
    }
    
    const userData = userDataDoc.data();
    
    // Return the user data
    return {
      id: name, // Using name as the ID
      name: name,
      createdAt: userData.createdAt instanceof Timestamp ? 
        userData.createdAt.toDate() : userData.createdAt,
      lastSeen: userData.lastSeen instanceof Timestamp ? 
        userData.lastSeen.toDate() : userData.lastSeen
    };
  } catch (error) {
    console.error("Error fetching user by name:", error);
    return null;
  }
};

// Helper function to create user
export const createUserInFirebase = async (userData: any): Promise<User> => {
  try {
    // Use trimmed name as the document ID
    const userId = userData.name.trim();
    
    // Check if user already exists
    const existingUser = await getUserByName(userId);
    if (existingUser) {
      console.log(`User ${userId} already exists, returning existing user`);
      // Update lastSeen directly in the user document
      const userDoc = getUserDoc(userId);
      await updateDoc(userDoc, { lastSeen: new Date() });
      return existingUser;
    }

    // Create new user using trimmed name as document ID
    const now = new Date();
    
    console.log(`Creating new user with name as ID: ${userId}`);
    
    // Initialize the user's data structure in the chats collection
    const userDoc = getUserDoc(userId);
    await setDoc(userDoc, {
      name: userData.name,
      createdAt: now,
      lastSeen: now,
      created: now
    });
    
    // Initialize the user's profile
    const profileDoc = getUserProfileDoc(userId);
    await setDoc(profileDoc, {
      bio: {
        name: userData.name,
        age: null,
        birthday: "",
        nationality: "",
        location: "",
        food_preferences: [],
        hobbies: [],
        interests: [],
        personality_traits: [],
        occupation: "",
        education: "",
        relationship_status: "",
        languages: []
      },
      short_term_interests: [],
      long_term_interests: [],
      traits: [],
      preferences: {},
      last_updated: now,
      version: 1,
      versionHistory: []
    });
    
    return {
      id: userId,
      name: userData.name,
      createdAt: now,
      lastSeen: now
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user in Firebase");
  }
};

// Convert Firestore message document to Message object
export const convertFirebaseDocToMessage = (doc: DocumentData): Message => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    role: data.role,
    content: data.content,
    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp,
  };
};

// Convert Firestore profile document to UserProfile object
export const convertFirebaseDocToUserProfile = (doc: DocumentData): UserProfile => {
  const data = doc.data();
  // Extract the relevant data from the profile format
  return {
    id: doc.id,
    userId: data.userId || doc.ref.parent.parent?.id || "",
    interests: data.short_term_interests || data.interests || [],
    communicationStyle: data.bio?.personality_traits?.[0] || data.communicationStyle || "neutral",
    preferences: data.preferences || {},
  };
};