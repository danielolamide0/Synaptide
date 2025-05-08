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
  chatsCollection,
  getUserDoc,
  getUserMessagesCollection,
  getUserProfileDoc,
  getUserSummariesCollection,
  getUserByName as getFirebaseUserByName,
  createUserInFirebase,
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
  where,
  writeBatch
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
      console.log(`Getting user by name: ${name}`);
      const user = await getFirebaseUserByName(name);
      
      if (!user) {
        console.log(`No user found with name: ${name}`);
        return undefined;
      }
      
      console.log(`Found user with ID: ${user.id}`);
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log(`Creating or retrieving user with name: ${insertUser.name}`);
      // Use the helper function from firebase.ts which handles the creation of user and profile
      return await createUserInFirebase(insertUser);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user in Firestore");
    }
  }
  
  async updateUserLastSeen(userId: string): Promise<void> {
    try {
      console.log(`Updating last seen for user ${userId}`);
      // Update the user document in the users collection (for username lookup)
      const usersCollection = collection(db, "users");
      const userRef = doc(usersCollection, userId);
      await updateDoc(userRef, { lastSeen: new Date() });
    } catch (error) {
      console.error("Error updating user last seen:", error);
    }
  }
  
  // Message related methods
  async createMessage(userId: string, insertMessage: InsertMessage): Promise<Message> {
    try {
      console.log(`Creating message for user ${userId}:`, insertMessage);
      
      // Get reference to the user's messages collection
      const messagesCollection = getUserMessagesCollection(userId);
      
      // Format the message in the structure expected for the chat
      const now = new Date();
      let messageData: any;
      
      if (insertMessage.role === 'user') {
        // User message only has user_input field
        messageData = {
          user_input: insertMessage.content,
          timestamp: now,
          version: 1
        };
      } else if (insertMessage.role === 'assistant') {
        // AI message needs both fields
        // Note: For our structure, we should have the user message create the document
        // and the AI message update it, but for now we'll support both
        messageData = {
          user_input: "",  // This would normally be filled with the user's input
          ai_response: insertMessage.content,
          timestamp: now,
          version: 1
        };
      } else {
        // Other message types (system, etc) - just store content
        messageData = {
          content: insertMessage.content,
          role: insertMessage.role,
          timestamp: now,
          version: 1
        };
      }
      
      // Add to Firestore
      const docRef = await addDoc(messagesCollection, messageData);
      console.log(`Created message with ID: ${docRef.id}`);
      
      // Return the newly created message in our expected format
      return {
        id: docRef.id,
        userId,
        role: insertMessage.role,
        content: insertMessage.content,
        timestamp: now
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Failed to create message in Firestore");
    }
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    try {
      console.log(`Getting messages for user ${userId}`);
      
      // Get the user's messages collection
      const messagesCollection = getUserMessagesCollection(userId);
      
      // Query all messages in the collection
      // We'll sort by timestamp afterward
      const querySnapshot = await getDocs(messagesCollection);
      console.log(`Found ${querySnapshot.size} messages for user ${userId}`);
      
      // Convert to our Message format
      const messages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Process user message
        if (data.user_input && !data.ai_response) {
          messages.push({
            id: doc.id,
            userId,
            role: 'user',
            content: data.user_input,
            timestamp: data.timestamp instanceof Timestamp ? 
              data.timestamp.toDate() : new Date(data.timestamp)
          });
        }
        
        // Process AI message
        if (data.ai_response) {
          messages.push({
            id: `${doc.id}_ai`,
            userId,
            role: 'assistant',
            content: data.ai_response,
            timestamp: data.timestamp instanceof Timestamp ? 
              new Date(data.timestamp.toDate().getTime() + 1000) : // add 1 second to ensure it comes after user message
              new Date(new Date(data.timestamp).getTime() + 1000)
          });
        }
        
        // Process other message types
        if (data.role && data.content) {
          messages.push({
            id: doc.id,
            userId,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp instanceof Timestamp ? 
              data.timestamp.toDate() : new Date(data.timestamp)
          });
        }
      });
      
      // Sort manually by timestamp
      messages.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return timeA - timeB;
      });
      
      console.log(`Returning ${messages.length} sorted messages for user ${userId}`);
      return messages;
    } catch (error) {
      console.error(`Error getting messages for user ${userId}:`, error);
      return [];
    }
  }

  async clearMessagesForUser(userId: string): Promise<void> {
    try {
      console.log(`Clearing messages for user ${userId}`);
      
      // Get the user's messages collection
      const messagesCollection = getUserMessagesCollection(userId);
      
      // Get all messages in the collection
      const querySnapshot = await getDocs(messagesCollection);
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
      console.log(`Getting profile for user ${userId}`);
      
      // Get the profile document reference
      const profileDoc = getUserProfileDoc(userId);
      
      // Check if it exists
      const docSnap = await getDoc(profileDoc);
      if (!docSnap.exists()) {
        console.log(`No profile found for user ${userId}`);
        return undefined;
      }
      
      // Convert to our UserProfile format
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId,
        interests: data.short_term_interests || data.interests || [],
        communicationStyle: (data.bio?.personality_traits?.[0]) || "neutral",
        preferences: data.preferences || {}
      };
    } catch (error) {
      console.error(`Error getting profile for user ${userId}:`, error);
      return undefined;
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      console.log(`Updating profile for user ${userId}`);
      
      // Get the profile document reference
      const profileDoc = getUserProfileDoc(userId);
      
      // Check if it exists
      const docSnap = await getDoc(profileDoc);
      
      if (docSnap.exists()) {
        console.log(`Updating existing profile for user ${userId}`);
        const data = docSnap.data();
        
        // Increment version
        const newVersion = (data.version || 1) + 1;
        
        // Merge interests
        const shortTermInterests = Array.from(new Set([
          ...(data.short_term_interests || []),
          ...(profileData.interests || [])
        ]));
        
        // Merge preferences
        const newPreferences = {
          ...(data.preferences || {}),
          ...(profileData.preferences || {})
        };
        
        // Add to version history
        const now = new Date();
        const versionHistory = data.versionHistory || [];
        versionHistory.push({
          timestamp: now,
          changes: {
            short_term_interests: shortTermInterests,
            preferences: newPreferences
          }
        });
        
        // Update the profile document
        await updateDoc(profileDoc, {
          short_term_interests: shortTermInterests,
          preferences: newPreferences,
          version: newVersion,
          versionHistory,
          last_updated: now
        });
        
        // Update personality traits if communicationStyle is provided
        if (profileData.communicationStyle && 
            profileData.communicationStyle !== "neutral" && 
            data.bio) {
          
          const personalityTraits = data.bio.personality_traits || [];
          if (!personalityTraits.includes(profileData.communicationStyle)) {
            personalityTraits.unshift(profileData.communicationStyle);
            
            // Update bio subfield
            await updateDoc(profileDoc, {
              "bio.personality_traits": personalityTraits
            });
          }
        }
        
        // Return the updated profile in our format
        return {
          id: docSnap.id,
          userId,
          interests: shortTermInterests,
          communicationStyle: profileData.communicationStyle || 
                             (data.bio?.personality_traits?.[0]) || 
                             "neutral",
          preferences: newPreferences
        };
      } else {
        // This shouldn't happen since we create the profile when creating the user
        console.log(`Profile for user ${userId} not found, creating new one`);
        
        // Initialize a new profile with the hierarchical structure
        const now = new Date();
        const newProfileData = {
          bio: {
            name: "",
            age: null,
            birthday: "",
            nationality: "",
            location: "",
            food_preferences: [],
            hobbies: [],
            interests: [],
            personality_traits: profileData.communicationStyle ? 
                               [profileData.communicationStyle] : [],
            occupation: "",
            education: "",
            relationship_status: "",
            languages: []
          },
          short_term_interests: profileData.interests || [],
          long_term_interests: [],
          traits: [],
          preferences: profileData.preferences || {},
          last_updated: now,
          version: 1,
          versionHistory: []
        };
        
        // Set the document
        await setDoc(profileDoc, newProfileData);
        
        // Return the profile in our format
        return {
          id: profileDoc.id,
          userId,
          interests: profileData.interests || [],
          communicationStyle: profileData.communicationStyle || "neutral",
          preferences: profileData.preferences || {}
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
