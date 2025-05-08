import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, DocumentData } from "firebase/firestore";
import { Message, UserProfile } from "@shared/schema";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const messagesCollection = collection(db, "messages");
const userProfileCollection = collection(db, "userProfile");

export { db, messagesCollection, userProfileCollection };

// Helper functions for message conversion
export const convertFirebaseDocToMessage = (doc: DocumentData): Message => {
  const data = doc.data();
  return {
    id: doc.id,
    role: data.role,
    content: data.content,
    timestamp: data.timestamp,
  };
};

export const convertFirebaseDocToUserProfile = (doc: DocumentData): UserProfile => {
  const data = doc.data();
  return {
    id: doc.id,
    interests: data.interests || [],
    communicationStyle: data.communicationStyle || "neutral",
    preferences: data.preferences || {},
  };
};