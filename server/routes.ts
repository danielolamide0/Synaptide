import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, analyzeUserPreferences } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  // Create or get user
  app.post("/api/users", async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "User name is required" });
      }
      
      const user = await storage.createUser({ name });
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Get user by name
  app.get("/api/users", async (req, res) => {
    try {
      const { name } = req.query;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: "User name is required" });
      }
      
      const user = await storage.getUser(name);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Message routes
  // Get messages for a specific user
  app.get("/api/users/:userId/messages", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const messages = await storage.getMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      console.error(`Error fetching messages for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a new message for a specific user
  app.post("/api/users/:userId/messages", async (req, res) => {
    try {
      const { userId } = req.params;
      const { content } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }

      console.log(`Processing message for user ${userId}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);

      // Save user message
      const userMessage = await storage.createMessage(userId, {
        userId,
        role: "user",
        content,
        timestamp: new Date(),
      });

      // Get all messages for context
      const messageHistory = await storage.getMessagesForUser(userId);
      console.log(`Retrieved ${messageHistory.length} messages for context`);
      
      // Create conversation history for OpenAI
      // Include at least 2 system messages to ensure context is maintained
      const formattedMessages = [
        {
          role: "system",
          content: "You are Synaptide, an intelligent assistant with perfect memory. Always reference past conversations and build on what you've learned about the user. Be helpful, concise, and conversational."
        },
        {
          role: "system",
          content: "Today is " + new Date().toLocaleDateString() + ". Make sure to provide accurate and up-to-date information."
        }
      ];
      
      // Add message history
      messageHistory.forEach(msg => {
        formattedMessages.push({
          role: msg.role,
          content: msg.content,
        });
      });
      
      console.log(`Sending ${formattedMessages.length} messages to OpenAI for processing`);

      // Generate AI response
      const aiResponseContent = await generateChatResponse(formattedMessages);
      
      // Save AI response
      const aiMessage = await storage.createMessage(userId, {
        userId,
        role: "assistant",
        content: aiResponseContent,
        timestamp: new Date(),
      });

      console.log(`Saved AI response with ID: ${aiMessage.id}`);

      // Analyze user preferences (happens in background, doesn't block response)
      if (messageHistory.length % 5 === 0) { // Only analyze periodically
        analyzeUserPreferences(formattedMessages)
          .then(preferences => {
            storage.updateUserProfile(userId, preferences);
          })
          .catch(error => {
            console.error("Error analyzing user preferences:", error);
          });
      }

      // Return the full conversation in response
      res.status(201).json(aiMessage);
    } catch (error) {
      console.error(`Error sending message for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Delete all messages for a specific user (clear chat)
  app.delete("/api/users/:userId/messages", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      await storage.clearMessagesForUser(userId);
      res.status(200).json({ message: "Chat history cleared" });
    } catch (error) {
      console.error(`Error clearing messages for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  // Get user profile for a specific user
  app.get("/api/users/:userId/profile", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error(`Error fetching profile for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Legacy routes to maintain backward compatibility temporarily
  app.get("/api/messages", async (req, res) => {
    res.status(400).json({ message: "Please use /api/users/:userId/messages endpoint instead" });
  });
  
  app.post("/api/messages", async (req, res) => {
    res.status(400).json({ message: "Please use /api/users/:userId/messages endpoint instead" });
  });
  
  app.delete("/api/messages", async (req, res) => {
    res.status(400).json({ message: "Please use /api/users/:userId/messages endpoint instead" });
  });
  
  app.get("/api/profile", async (req, res) => {
    res.status(400).json({ message: "Please use /api/users/:userId/profile endpoint instead" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
