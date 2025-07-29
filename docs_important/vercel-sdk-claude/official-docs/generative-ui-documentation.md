# Vercel AI SDK v5 - Generative User Interfaces Official Documentation

Source: https://v5.ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces

## Overview

Generative user interfaces (generative UI) is the process of allowing a large language model (LLM) to go beyond text and "generate UI". This creates a more engaging and AI-native experience for users.

**Example interaction:**
```
User: What is the weather in SF?
AI: getWeather("San Francisco")
[Weather component is generated and rendered]
```

## Core Concepts

At the core of generative UI are **tools**, which are functions you provide to the model to perform specialized tasks like getting the weather in a location. The model can decide when and how to use these tools based on the context of the conversation.

### How Generative UI Works

1. You provide the model with a prompt or conversation history, along with a set of tools
2. Based on the context, the model may decide to call a tool
3. If a tool is called, it will execute and return data
4. This data can then be passed to a React component for rendering

By passing the tool results to React components, you can create a generative UI experience that's more engaging and adaptive to your needs.

## Implementation Guide

### Basic Chat Implementation

Start with a basic chat implementation using the `useChat` hook:

```typescript
'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          <div>
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index}>{part.text}</span>;
              }
              return null;
            })}
          </div>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### API Route Implementation

To handle the chat requests and model responses, set up an API route:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  
  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a friendly assistant!',
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
```

## Creating Tools for UI Generation

### Tool Definition

Create a new file called `ai/tools.ts`:

```typescript
import { tool as createTool } from 'ai';
import { z } from 'zod';

export const weatherTool = createTool({
  description: 'Display the weather for a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function({ location }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { weather: 'Sunny', temperature: 75, location };
  },
});

export const tools = {
  displayWeather: weatherTool,
};
```

### UI Component for Tool Results

Create a corresponding React component in `components/weather.tsx`:

```typescript
type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
};

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  return (
    <div>
      <h3>Current Weather for {location}</h3>
      <p>Condition: {weather}</p>
      <p>Temperature: {temperature}°C</p>
    </div>
  );
};
```

### Updated API Route with Tools

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { tools } from '@/ai/tools';

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  
  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a friendly assistant!',
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  });

  return result.toUIMessageStreamResponse();
}
```

## Rendering Tool Components

Update your page component to handle tool-generated UI:

```typescript
'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Weather } from '@/components/weather';

export default function Page() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          <div>
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index}>{part.text}</span>;
              }
              
              if (part.type === 'tool-displayWeather') {
                switch (part.state) {
                  case 'input-available':
                    return <div key={index}>Loading weather...</div>;
                  case 'output-available':
                    return (
                      <div key={index}>
                        <Weather 
                          temperature={part.output.temperature}
                          weather={part.output.weather}
                          location={part.output.location}
                        />
                      </div>
                    );
                  case 'output-error':
                    return <div key={index}>Error: {part.errorText}</div>;
                  default:
                    return null;
                }
              }
              return null;
            })}
          </div>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Key Features for Voice-First Applications

### Tool State Management

In AI SDK 5.0, tool parts use typed naming: `tool-${toolName}` instead of generic types. This provides better type safety and clearer component logic.

### State Handling

The tool execution has three main states:
- `input-available`: Tool is being executed (loading state)
- `output-available`: Tool has completed successfully
- `output-error`: Tool execution failed

### Expanding Applications

You can enhance your chat application by adding more tools and components:

```typescript
// Add a stock tool
export const stockTool = createTool({
  description: 'Get price for a stock',
  inputSchema: z.object({
    symbol: z.string().describe('The stock symbol to get the price for'),
  }),
  execute: async function({ symbol }) {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { symbol, price: 100 };
  },
});

// Update the tools object
export const tools = {
  displayWeather: weatherTool,
  getStockPrice: stockTool,
};
```

This pattern allows for unlimited expansion of AI-driven UI capabilities, making it perfect for voice-first kiosk applications where users can request different types of information through voice commands.

## Critical Advantages for Voice-First Systems

1. **No User Interaction Required**: Components are generated by AI based on voice input, not user clicks
2. **Real-time Streaming**: Updates appear immediately as the AI processes requests
3. **Type-safe Tool Integration**: Strongly typed tool definitions ensure reliable component generation
4. **Semantic Component Structure**: Generated components can be made fully accessible with proper ARIA labels
5. **Performance Optimized**: SSE-based streaming is efficient for kiosk hardware

This approach solves the fundamental issues with traditional interactive UIs in voice-first environments by removing the need for user interaction while maintaining rich, dynamic content presentation. 