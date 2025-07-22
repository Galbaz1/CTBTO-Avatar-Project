'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  componentData?: any;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  createNewChat: () => string;
  deleteChat: (chatId: string) => void;
  selectChat: (chatId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>, targetChatId?: string) => void;
  updateLastMessage: (content: string, componentData?: any, targetChatId?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Generate unique ID by combining timestamp with random number
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  const createNewChat = useCallback(() => {
    const newChatId = generateUniqueId();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    return newChatId;
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  }, [chats, currentChatId]);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>, targetChatId?: string) => {
    const chatId = targetChatId || currentChatId;
    if (!chatId) return;

    const newMessage: Message = {
      ...message,
      id: generateUniqueId(),
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, newMessage];
        const title = chat.title === 'New Chat' && message.role === 'user' 
          ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
          : chat.title;
        
        return {
          ...chat,
          title,
          messages: updatedMessages,
          updatedAt: new Date(),
        };
      }
      return chat;
    }));
  }, [currentChatId]);

  const updateLastMessage = useCallback((content: string, componentData?: any, targetChatId?: string) => {
    const chatId = targetChatId || currentChatId;
    if (!chatId) return;

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const messages = [...chat.messages];
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: content,
              componentData: componentData,
            };
          }
        }
        return {
          ...chat,
          messages,
          updatedAt: new Date(),
        };
      }
      return chat;
    }));
  }, [currentChatId]);

  return (
    <ChatContext.Provider value={{
      chats,
      currentChatId,
      currentChat,
      createNewChat,
      deleteChat,
      selectChat,
      addMessage,
      updateLastMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 