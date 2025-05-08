import { messages, userProfile, type Message, type InsertMessage, type UserProfile, type InsertUserProfile } from "@shared/schema";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  clearMessages(): Promise<void>;
  getUserProfile(): Promise<UserProfile | undefined>;
  updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
}

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
        interests: [
          ...new Set([
            ...(this.userProfile.interests || []),
            ...(profileData.interests || [])
          ])
        ],
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

export const storage = new MemStorage();
