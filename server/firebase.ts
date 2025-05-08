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

// Helper function to get user by name - we still need a users collection for name lookup
// We'll use a separate collection to map usernames to user IDs
export const getUserByName = async (name: string): Promise<User | null> => {
  try {
    // Look up user in the users collection (simple name -> id mapping)
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No user found with name: ${name}`);
      return null;
    }
    
    // Get the user ID from the mapping
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    
    // Get the actual user data from the chats collection
    const userDataDoc = await getDoc(getUserDoc(userId));
    
    if (!userDataDoc.exists()) {
      console.log(`User data not found for ID: ${userId}`);
      return null;
    }
    
    // Return the user data
    return {
      id: userId,
      name: name,
      createdAt: userDoc.data().createdAt instanceof Timestamp ? 
        userDoc.data().createdAt.toDate() : userDoc.data().createdAt,
      lastSeen: userDoc.data().lastSeen instanceof Timestamp ? 
        userDoc.data().lastSeen.toDate() : userDoc.data().lastSeen
    };
  } catch (error) {
    console.error("Error fetching user by name:", error);
    return null;
  }
};

// Helper function to create user
export const createUserInFirebase = async (userData: any): Promise<User> => {
  try {
    // Check if user already exists
    const existingUser = await getUserByName(userData.name);
    if (existingUser) {
      console.log(`User ${userData.name} already exists, returning existing user`);
      // Update lastSeen
      const usersCollection = collection(db, "users");
      const userRef = doc(usersCollection, existingUser.id);
      await updateDoc(userRef, { lastSeen: new Date() });
      return existingUser;
    }

    // Create new user
    const now = new Date();
    const newUserData = {
      name: userData.name,
      createdAt: now,
      lastSeen: now
    };
    
    // Create a new entry in the users collection (for name lookup)
    const usersCollection = collection(db, "users");
    const userRef = await addDoc(usersCollection, newUserData);
    const userId = userRef.id;
    
    console.log(`Created new user with ID: ${userId}`);
    
    // Initialize the user's data structure in the chats collection
    const userDoc = getUserDoc(userId);
    await setDoc(userDoc, {
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