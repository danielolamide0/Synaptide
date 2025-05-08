import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, analyzeUserPreferences } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      });

      // Get all messages for context
      const messageHistory = await storage.getAllMessages();
      
      // Format messages for OpenAI
      const formattedMessages = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Generate AI response
      const aiResponseContent = await generateChatResponse(formattedMessages);
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        role: "assistant",
        content: aiResponseContent,
        timestamp: new Date().toISOString(),
      });

      // Analyze user preferences (happens in background, doesn't block response)
      if (messageHistory.length % 5 === 0) { // Only analyze periodically
        analyzeUserPreferences(formattedMessages)
          .then(preferences => {
            storage.updateUserProfile(preferences);
          })
          .catch(error => {
            console.error("Error analyzing user preferences:", error);
          });
      }

      res.status(201).json(aiMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Delete all messages (clear chat)
  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.status(200).json({ message: "Chat history cleared" });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  // Get user profile
  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getUserProfile();
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
