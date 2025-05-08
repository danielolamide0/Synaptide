import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, DocumentData, where, doc, getDoc, setDoc } from "firebase/firestore";
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
const userProfileCollection = collection(db, "userProfile");

export { db, usersCollection, messagesCollection, userProfileCollection };

// Get user-specific messages - use the main messages collection with a userId field
// This approach works with the existing permissions
export const getUserMessagesCollection = (userId: string) => {
  return messagesCollection; // Return the main messages collection
};

// Helper functions for data conversion
export const convertFirebaseDocToUser = (doc: DocumentData): User => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    createdAt: data.createdAt,
    lastSeen: data.lastSeen
  };
};

export const convertFirebaseDocToMessage = (doc: DocumentData): Message => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    role: data.role,
    content: data.content,
    timestamp: data.timestamp,
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