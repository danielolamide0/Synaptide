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
      console.log(`Creating message for user ${userId}:`, insertMessage);
      
      // Add message to main messages collection with userId field
      const messageData = {
        ...insertMessage,
        userId,
        timestamp: insertMessage.timestamp || new Date()
      };
      
      // Add to Firestore
      const docRef = await addDoc(messagesCollection, messageData);
      console.log(`Created message with ID: ${docRef.id}`);
      
      // Return the newly created message with its id
      return {
        ...messageData,
        id: docRef.id
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Failed to create message in Firestore");
    }
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    try {
      console.log(`Getting messages for user ${userId}`);
      
      // Query messages where userId matches
      const q = query(
        messagesCollection,
        where("userId", "==", userId),
        orderBy("timestamp")
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} messages for user ${userId}`);
      
      // Convert to Message objects
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push(convertFirebaseDocToMessage(doc));
      });
      
      return messages;
    } catch (error) {
      console.error(`Error getting messages for user ${userId}:`, error);
      return [];
    }
  }

  async clearMessagesForUser(userId: string): Promise<void> {
    try {
      console.log(`Clearing messages for user ${userId}`);
      
      // Query all messages for this user
      const q = query(messagesCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      console.log(`Found ${querySnapshot.size} messages to delete for user ${userId}`);
      
      // Delete each message document
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      console.log(`Cleared all messages for user ${userId}`);
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
  private users: Map<string, User>;
  private userMessages: Map<string, Map<string, Message>>;
  private userProfiles: Map<string, UserProfile>;
  private currentIds: {
    users: number;
    messages: number;
    profiles: number;
  };

  constructor() {
    this.users = new Map();
    this.userMessages = new Map();
    this.userProfiles = new Map();
    this.currentIds = {
      users: 1,
      messages: 1,
      profiles: 1
    };
  }

  // User related methods
  async getUser(name: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.name === name);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUser(insertUser.name);
    if (existingUser) {
      // Update last seen time
      await this.updateUserLastSeen(existingUser.id);
      return existingUser;
    }
    
    // Create new user
    const id = `user_${this.currentIds.users++}`;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      lastSeen: now
    };
    
    this.users.set(id, user);
    
    // Initialize empty message collection for this user
    if (!this.userMessages.has(id)) {
      this.userMessages.set(id, new Map());
    }
    
    return user;
  }
  
  async updateUserLastSeen(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastSeen = new Date();
      this.users.set(userId, user);
    }
  }
  
  // Message related methods
  async createMessage(userId: string, insertMessage: InsertMessage): Promise<Message> {
    // Get or create the user's message collection
    if (!this.userMessages.has(userId)) {
      this.userMessages.set(userId, new Map());
    }
    
    const id = `msg_${this.currentIds.messages++}`;
    const message: Message = { 
      ...insertMessage, 
      id,
      userId // Ensure userId is included
    };
    
    this.userMessages.get(userId)!.set(id, message);
    return message;
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    if (!this.userMessages.has(userId)) {
      return [];
    }
    
    return Array.from(this.userMessages.get(userId)!.values()).sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async clearMessagesForUser(userId: string): Promise<void> {
    if (this.userMessages.has(userId)) {
      this.userMessages.get(userId)!.clear();
    }
  }

  // User profile related methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(userId);
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      // Update existing profile
      const updatedProfile: UserProfile = {
        ...existingProfile,
        ...profileData,
        // Ensure required fields
        userId,
        // Merge arrays for interests
        interests: Array.from(new Set([
          ...(existingProfile.interests || []),
          ...(profileData.interests || [])
        ])),
        // Merge objects for preferences
        preferences: {
          ...(existingProfile.preferences || {}),
          ...(profileData.preferences || {})
        }
      };
      
      this.userProfiles.set(userId, updatedProfile);
      return updatedProfile;
    } else {
      // Create new profile
      const id = `profile_${this.currentIds.profiles++}`;
      const newProfile: UserProfile = {
        id,
        userId,
        interests: profileData.interests || [],
        communicationStyle: profileData.communicationStyle || "neutral",
        preferences: profileData.preferences || {}
      };
      
      this.userProfiles.set(userId, newProfile);
      return newProfile;
    }
  }
}

// Use Firebase storage since permissions are now set up
console.log("Using Firebase storage for data persistence");
export const storage = new FirebaseStorage();
