import { messages, userProfile, type Message, type InsertMessage, type UserProfile, type InsertUserProfile } from "@shared/schema";
import { 
  db, 
  messagesCollection, 
  userProfileCollection, 
  convertFirebaseDocToMessage, 
  convertFirebaseDocToUserProfile 
} from "./firebase";
import { 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  collection
} from "firebase/firestore";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  clearMessages(): Promise<void>;
  getUserProfile(): Promise<UserProfile | undefined>;
  updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
}

export class FirebaseStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      // Add message to Firestore
      const docRef = await addDoc(messagesCollection, {
        ...insertMessage,
        timestamp: insertMessage.timestamp
      });
      
      // Return the newly created message with its id
      return {
        ...insertMessage,
        id: docRef.id,
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Failed to create message in Firestore");
    }
  }

  async getAllMessages(): Promise<Message[]> {
    try {
      // Query messages ordered by timestamp
      const q = query(messagesCollection, orderBy("timestamp"));
      const querySnapshot = await getDocs(q);
      
      // Convert Firebase docs to Message objects
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const message = convertFirebaseDocToMessage(doc);
        messages.push(message);
      });
      
      return messages;
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  async clearMessages(): Promise<void> {
    try {
      // Get all messages
      const querySnapshot = await getDocs(messagesCollection);
      
      // Delete each message document
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error clearing messages:", error);
      throw new Error("Failed to clear messages from Firestore");
    }
  }

  async getUserProfile(): Promise<UserProfile | undefined> {
    try {
      const querySnapshot = await getDocs(userProfileCollection);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      // Return the first user profile found (assuming there's only one)
      return convertFirebaseDocToUserProfile(querySnapshot.docs[0]);
    } catch (error) {
      console.error("Error getting user profile:", error);
      return undefined;
    }
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Check if profile already exists
      const existingProfile = await this.getUserProfile();
      
      if (existingProfile) {
        // Update existing profile
        const profileRef = doc(userProfileCollection, existingProfile.id);
        
        // Merge interests arrays
        const combinedInterests = [
          ...(existingProfile.interests || []),
          ...(profileData.interests || [])
        ];
        // Remove duplicates
        const mergedInterests = Array.from(new Set(combinedInterests));
        
        // Merge preferences objects
        const mergedPreferences = {
          ...(existingProfile.preferences || {}),
          ...(profileData.preferences || {})
        };
        
        // Update document
        await updateDoc(profileRef, {
          ...profileData,
          interests: mergedInterests,
          preferences: mergedPreferences
        });
        
        // Return updated profile
        return {
          ...existingProfile,
          ...profileData,
          interests: mergedInterests,
          preferences: mergedPreferences
        };
      } else {
        // Create new profile
        const newProfile: UserProfile = {
          id: "", // Temporary ID, will be replaced with Firebase document ID
          interests: profileData.interests || [],
          communicationStyle: profileData.communicationStyle || "neutral",
          preferences: profileData.preferences || {}
        };
        
        // Add to Firestore
        const docRef = await addDoc(userProfileCollection, newProfile);
        
        // Return new profile with proper ID
        return {
          ...newProfile,
          id: docRef.id
        };
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile in Firestore");
    }
  }
}

// Create a fallback memory storage in case Firebase has permission issues
export class MemStorage implements IStorage {
  private messages: Map<string, Message>;
  private userProfile: UserProfile | undefined;
  private currentId: number;

  constructor() {
    this.messages = new Map();
    this.currentId = 1;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = `msg_${this.currentId++}`;
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
    return;
  }

  async getUserProfile(): Promise<UserProfile | undefined> {
    return this.userProfile;
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.userProfile) {
      this.userProfile = {
        id: "profile_1",
        interests: [],
        communicationStyle: "neutral",
        preferences: {},
        ...profileData
      };
    } else {
      this.userProfile = {
        ...this.userProfile,
        ...profileData,
        // Merge arrays for interests
        interests: Array.from(new Set([
          ...(this.userProfile.interests || []),
          ...(profileData.interests || [])
        ])),
        // Merge objects for preferences
        preferences: {
          ...(this.userProfile.preferences || {}),
          ...(profileData.preferences || {})
        }
      };
    }
    
    return this.userProfile;
  }
}

// Try to use Firebase first, if it fails (permission issues), fall back to memory storage
let storageInstance: IStorage;

try {
  storageInstance = new FirebaseStorage();
  console.log("Using Firebase storage");
} catch (error) {
  console.warn("Failed to initialize Firebase storage, falling back to memory storage:", error);
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
