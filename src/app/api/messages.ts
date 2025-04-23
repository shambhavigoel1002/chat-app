// pages/api/messages.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

// Message interface
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

// In-memory store for messages (would use a database in production)
let messages: Message[] = [];

// Initialize the Langchain chat model
const chatModel = new ChatOpenAI({
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET request - return all messages
  if (req.method === 'GET') {
    return res.status(200).json(messages);
  }
  
  // Handle POST request - add a new message
  if (req.method === 'POST') {
    const { text, sender } = req.body;
    
    // Validate required fields
    if (!text || !sender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    
    // Add user message to messages array
    messages.push(userMessage);
    
    try {
      // Convert previous messages to the format expected by Langchain
      const langchainMessages = messages
        .slice(-10) // Use last 10 messages for context
        .map(msg => {
          if (msg.sender === 'AI') {
            return new AIMessage(msg.text);
          } else {
            return new HumanMessage(msg.text);
          }
        });
      
      // Add a system message at the beginning for context
      langchainMessages.unshift(
        new SystemMessage("You are a helpful AI assistant in a chat application.")
      );
      
      // Get response from Langchain
      const response = await chatModel.invoke(langchainMessages);
      
      // Create AI message from the response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.content.toString(),
        sender: 'AI',
        timestamp: new Date(),
      };
      
      // Add AI message to messages array
      messages.push(aiMessage);
      
      // Return both the user message and AI response
      return res.status(201).json([userMessage, aiMessage]);
    } catch (error) {
      console.error('Error getting response from Langchain:', error);
      return res.status(500).json({ error: 'Failed to process with Langchain' });
    }
  }
  
  // Handle any other HTTP method
  return res.status(405).json({ error: 'Method not allowed' });
}