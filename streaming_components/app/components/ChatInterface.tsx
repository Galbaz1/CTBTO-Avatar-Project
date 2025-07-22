'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat, Message } from '../contexts/ChatContext';
import { WeatherCard } from './WeatherCard';
import { StockCard } from './StockCard';

interface ChatInterfaceProps {
  onToggleSidebar: () => void;
}

export function ChatInterface({ onToggleSidebar }: ChatInterfaceProps) {
  const { currentChat, addMessage, updateLastMessage, createNewChat, currentChatId } = useChat();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const parseProgressiveJSON = (content: string) => {
    // Check if content contains JSON
    const jsonStart = content.indexOf('{');
    if (jsonStart === -1) {
      return { componentData: null, textContent: content, isJsonDetected: false };
    }

    // Extract potential JSON portion
    const jsonPortion = content.substring(jsonStart);
    
    try {
      // Try to parse complete JSON
      const jsonData = JSON.parse(jsonPortion);
      if (jsonData.type && jsonData.data) {
        return {
          componentData: jsonData,
          textContent: content.substring(0, jsonStart).trim(),
          isJsonDetected: true,
          isComplete: true
        };
      }
    } catch (error) {
      // JSON is incomplete, try to detect type and parse partial data
      try {
        // Look for type field to determine component type
        const typeMatch = jsonPortion.match(/"type"\s*:\s*"(weather|stock)"/);
        if (typeMatch) {
          const componentType = typeMatch[1];
          
          // Try to parse partial data for progressive loading
          const partialData = parsePartialJSON(jsonPortion, componentType);
          
          return {
            componentData: { type: componentType, data: partialData },
            textContent: content.substring(0, jsonStart).trim(),
            isJsonDetected: true,
            isComplete: false
          };
        }
      } catch (parseError) {
        // Still parsing, continue
      }
    }

    return { 
      componentData: null, 
      textContent: content, 
      isJsonDetected: jsonStart !== -1,
      isComplete: false 
    };
  };

  const parsePartialJSON = (jsonString: string, type: string) => {
    const partialData: any = {};
    
    if (type === 'weather') {
      // Extract location
      const locationMatch = jsonString.match(/"location"\s*:\s*"([^"]*)"?/);
      if (locationMatch) partialData.location = locationMatch[1];
      
      // Extract current weather data
      const tempMatch = jsonString.match(/"temperature"\s*:\s*(\d+)/);
      if (tempMatch) {
        partialData.current = partialData.current || {};
        partialData.current.temperature = parseInt(tempMatch[1]);
      }
      
      const conditionMatch = jsonString.match(/"condition"\s*:\s*"([^"]*)"?/);
      if (conditionMatch) {
        partialData.current = partialData.current || {};
        partialData.current.condition = conditionMatch[1];
      }
      
      const humidityMatch = jsonString.match(/"humidity"\s*:\s*(\d+)/);
      if (humidityMatch) {
        partialData.current = partialData.current || {};
        partialData.current.humidity = parseInt(humidityMatch[1]);
      }
      
      const windMatch = jsonString.match(/"windSpeed"\s*:\s*(\d+)/);
      if (windMatch) {
        partialData.current = partialData.current || {};
        partialData.current.windSpeed = parseInt(windMatch[1]);
      }
      
      const iconMatch = jsonString.match(/"icon"\s*:\s*"([^"]*)"?/);
      if (iconMatch) {
        partialData.current = partialData.current || {};
        partialData.current.icon = iconMatch[1];
      }
    } else if (type === 'stock') {
      // Extract stock data
      const symbolMatch = jsonString.match(/"symbol"\s*:\s*"([^"]*)"?/);
      if (symbolMatch) partialData.symbol = symbolMatch[1];
      
      const nameMatch = jsonString.match(/"name"\s*:\s*"([^"]*)"?/);
      if (nameMatch) partialData.name = nameMatch[1];
      
      const priceMatch = jsonString.match(/"currentPrice"\s*:\s*([\d.]+)/);
      if (priceMatch) partialData.currentPrice = parseFloat(priceMatch[1]);
      
      const changeMatch = jsonString.match(/"change"\s*:\s*([-\d.]+)/);
      if (changeMatch) partialData.change = parseFloat(changeMatch[1]);
      
      const changePercentMatch = jsonString.match(/"changePercent"\s*:\s*([-\d.]+)/);
      if (changePercentMatch) partialData.changePercent = parseFloat(changePercentMatch[1]);
    }
    
    return partialData;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    let chatId = currentChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message - pass chatId to ensure it uses the correct chat
    addMessage({
      role: 'user',
      content: userMessage,
    }, chatId);

    // Add empty assistant message that will be updated - pass chatId to ensure it uses the correct chat
    addMessage({
      role: 'assistant',
      content: '',
    }, chatId);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...(currentChat?.messages || []),
            { role: 'user', content: userMessage }
          ],
          use_components: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response reader');
      }

      let accumulatedContent = '';
      let lastComponentData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                updateLastMessage(`Error: ${data.error}`, undefined, chatId);
                break;
              }
              
              if (data.done) {
                const { componentData, textContent } = parseProgressiveJSON(accumulatedContent);
                updateLastMessage(textContent, componentData, chatId);
                break;
              }
              
              if (data.content) {
                accumulatedContent += data.content;
                
                // Parse progressive JSON
                const { componentData, textContent, isJsonDetected } = parseProgressiveJSON(accumulatedContent);
                
                // If we detected JSON and it's different from last update, update the message
                if (isJsonDetected && (!lastComponentData || JSON.stringify(componentData) !== JSON.stringify(lastComponentData))) {
                  lastComponentData = componentData;
                  updateLastMessage(textContent, componentData, chatId);
                } else if (!isJsonDetected) {
                  // Regular text update
                  updateLastMessage(accumulatedContent, undefined, chatId);
                }
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      updateLastMessage('Sorry, there was an error processing your request.', undefined, chatId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-3xl ${isUser ? 'ml-auto' : 'mr-auto'}`}>
          <div className={`
            rounded-lg px-4 py-2 ${
              isUser 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
            }
          `}>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          
          {/* Render component if available */}
          {message.componentData && (
            <div className="mt-3">
              {message.componentData.type === 'weather' && (
                <WeatherCard 
                  data={message.componentData.data} 
                  isLoading={!message.content && isLoading} 
                />
              )}
              {message.componentData.type === 'stock' && (
                <StockCard 
                  data={message.componentData.data} 
                  isLoading={!message.content && isLoading} 
                />
              )}
            </div>
          )}
          
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {currentChat?.title || 'ChatGPT Clone'}
            </h1>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Welcome to ChatGPT Clone
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ask me anything! I can provide weather information, stock prices, and much more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Weather Updates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get current weather and 5-day forecasts for any location
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Stock Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    View real-time stock prices and historical data
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {currentChat.messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-white min-h-[50px] max-h-32"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors min-w-[80px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                'Send'
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
} 