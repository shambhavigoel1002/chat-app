import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';


interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

let messages: Message[] = [];

const chatModel = new ChatOpenAI({
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { text, sender } = body;
  
  // Validate required fields
 if (!text || !sender) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const userMessage: Message = {
    id: Date.now().toString(),
    text,
    sender,
    timestamp: new Date(),
  };
  
  // Add user message to messages array
  messages.push(userMessage);
  
  try {
    const langchainMessages = messages
      .slice(-10) 
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
    
    return NextResponse.json([userMessage, aiMessage], { status: 201 });
  } catch (error) {
    console.error('Error getting response from Langchain:', error);
    return NextResponse.json({ error: 'Failed to process with Langchain' }, { status: 500 });
  }
}