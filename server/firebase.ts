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

// Collection references - using flat structure to maintain compatibility with existing rules
const usersCollection = collection(db, "users");
const messagesCollection = collection(db, "messages");
const userProfileCollection = collection(db, "userProfiles");

export { db, usersCollection, messagesCollection, userProfileCollection };

// Get user-specific messages collection
export const getUserMessagesCollection = (userId: string) => {
  return collection(db, `messages`);
};

// Helper function to get user by name
export const getUserByName = async (name: string): Promise<User | null> => {
  try {
    const q = query(usersCollection, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No user found with name: ${name}`);
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return convertFirebaseDocToUser(userDoc);
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
      const userRef = doc(usersCollection, existingUser.id);
      await updateDoc(userRef, { lastSeen: new Date() });
      return existingUser;
    }

    // Create new user
    const now = new Date();
    const newUserData = {
      ...userData,
      createdAt: now,
      lastSeen: now
    };
    
    const docRef = await addDoc(usersCollection, newUserData);
    console.log(`Created new user with ID: ${docRef.id}`);
    
    return {
      ...newUserData,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user in Firebase");
  }
};

// Helper functions for data conversion
export const convertFirebaseDocToUser = (doc: DocumentData): User => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    lastSeen: data.lastSeen instanceof Timestamp ? data.lastSeen.toDate() : data.lastSeen
  };
};

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

export const convertFirebaseDocToUserProfile = (doc: DocumentData): UserProfile => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    interests: data.interests || [],
    communicationStyle: data.communicationStyle || "neutral",
    preferences: data.preferences || {},
  };
};