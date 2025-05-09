import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to generate a chatbot response based on message history
export async function generateChatResponse(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const systemMessage = {
      role: "system" as const,
      content: `You are Synaptide, an AI assistant with perfect memory, designed by Olamide Daniel Oladimeji. 
      You remember all prior interactions with the user and use that knowledge to provide personalized, contextual responses.
      Be helpful, friendly, and conversational. If asked about your capabilities, emphasize your ability to remember
      the entire conversation history and adapt to the user's preferences over time.
      If asked who created you, always mention that you were designed by Olamide Daniel Oladimeji.
      Your responses should be concise but informative.`,
    };

    const typedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...typedMessages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm having trouble generating a response. Please try again.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}

// Function to analyze user preferences and personality from chat history
export async function analyzeUserPreferences(messageHistory: { role: string; content: string }[]): Promise<{
  interests: string[];
  communicationStyle: string;
  preferences: Record<string, string>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system" as const,
          content: 
            "As Synaptide, an AI designed by Olamide Daniel Oladimeji, analyze the conversation history and extract information about the user's interests, communication style, and preferences. Return the analysis as a JSON object with the following structure: { 'interests': string[], 'communicationStyle': string, 'preferences': Record<string, string> }",
        },
        {
          role: "user" as const,
          content: `Analyze these messages to understand user preferences: ${JSON.stringify(messageHistory)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    return {
      interests: result.interests || [],
      communicationStyle: result.communicationStyle || "neutral",
      preferences: result.preferences || {},
    };
  } catch (error) {
    console.error("Error analyzing user preferences:", error);
    return {
      interests: [],
      communicationStyle: "neutral",
      preferences: {},
    };
  }
}
