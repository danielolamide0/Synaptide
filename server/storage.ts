import { 
  messages, 
  userProfile, 
  users, 
  type Message, 
  type InsertMessage, 
  type UserProfile, 
  type InsertUserProfile,
  type User,
  type InsertUser 
} from "@shared/schema";
import { 
  db, 
  usersCollection,
  messagesCollection, 
  userProfileCollection,
  getUserMessagesCollection,
  convertFirebaseDocToUser,
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
  collection,
  where
} from "firebase/firestore";

export interface IStorage {
  // User related methods
  getUser(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastSeen(userId: string): Promise<void>;
  
  // Message related methods
  createMessage(userId: string, message: InsertMessage): Promise<Message>;
  getMessagesForUser(userId: string): Promise<Message[]>;
  clearMessagesForUser(userId: string): Promise<void>;
  
  // User profile related methods
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile>;
}

export class FirebaseStorage implements IStorage {
  // User related methods
  async getUser(name: string): Promise<User | undefined> {
    try {
      // Query users with matching name
      const q = query(usersCollection, where("name", "==", name));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      // Return the first user found with this name
      return convertFirebaseDocToUser(querySnapshot.docs[0]);
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getUser(insertUser.name);
      if (existingUser) {
        // Update last seen time
        await this.updateUserLastSeen(existingUser.id);
        return existingUser;
      }
      
      // Create new user with timestamp
      const now = new Date();
      const userData = {
        ...insertUser,
        createdAt: now,
        lastSeen: now
      };
      
      // Add to Firestore
      const docRef = await addDoc(usersCollection, userData);
      
      // Return the newly created user with its id
      return {
        ...userData,
        id: docRef.id
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user in Firestore");
    }
  }
  
  async updateUserLastSeen(userId: string): Promise<void> {
    try {
      const userRef = doc(usersCollection, userId);
      await updateDoc(userRef, {
        lastSeen: new Date()
      });
    } catch (error) {
      console.error("Error updating user last seen:", error);
    }
  }
  
  // Message related methods
  async createMessage(userId: string, insertMessage: InsertMessage): Promise<Message> {
    try {
      // Get user-specific messages collection
      const userMessagesCollection = getUserMessagesCollection(userId);
      
      // Add message to user's messages collection
      const docRef = await addDoc(userMessagesCollection, {
        ...insertMessage,
        userId,
        timestamp: insertMessage.timestamp || new Date()
      });
      
      // Return the newly created message with its id
      return {
        ...insertMessage,
        id: docRef.id,
        userId
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Failed to create message in Firestore");
    }
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    try {
      // Get user-specific messages collection
      const userMessagesCollection = getUserMessagesCollection(userId);
      
      // Query messages ordered by timestamp
      const q = query(userMessagesCollection, orderBy("timestamp"));
      const querySnapshot = await getDocs(q);
      
      // Convert Firebase docs to Message objects
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const message = convertFirebaseDocToMessage({
          ...doc,
          data: () => ({
            ...doc.data(),
            userId // Ensure userId is included
          })
        });
        messages.push(message);
      });
      
      return messages;
    } catch (error) {
      console.error(`Error getting messages for user ${userId}:`, error);
      return [];
    }
  }

  async clearMessagesForUser(userId: string): Promise<void> {
    try {
      // Get user-specific messages collection
      const userMessagesCollection = getUserMessagesCollection(userId);
      
      // Get all messages for this user
      const querySnapshot = await getDocs(userMessagesCollection);
      
      // Delete each message document
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Error clearing messages for user ${userId}:`, error);
      throw new Error("Failed to clear messages from Firestore");
    }
  }

  // User profile related methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    try {
      // Query user profile with matching userId
      const q = query(userProfileCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      // Return the first profile found for this user
      return convertFirebaseDocToUserProfile(querySnapshot.docs[0]);
    } catch (error) {
      console.error(`Error getting profile for user ${userId}:`, error);
      return undefined;
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Check if profile already exists
      const existingProfile = await this.getUserProfile(userId);
      
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
          userId, // Link to the user
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
      console.error(`Error updating profile for user ${userId}:`, error);
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

// Use Firebase storage since permissions are now set up
console.log("Using Firebase storage for data persistence");
export const storage = new FirebaseStorage();
