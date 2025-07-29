// Voice-First Kiosk Template for CTBTO-Avatar-Project
// Based on Vercel AI SDK v5 & Tavus CVI Research

'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { CVIProvider, useCVICall, useObservableEvent, useSendAppMessage } from '@/components/cvi'; // Assuming centralized CVI exports

// ========================
// Types and Interfaces
// ========================

interface SessionData {
  title: string;
  speaker: string;
  abstract: string;
  startTime: string;
  duration: string;
  room: string;
  sessionType: string;
}

interface SpeakerData {
  name: string;
  bio: string;
  expertise: string[];
  sessions: SessionData[];
  profileImage?: string;
  organization: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  recommendation: string;
}

interface NavigationData {
  destination: string;
  route: string[];
  estimatedWalkTime: string;
  accessibility: boolean;
  landmarks: string[];
}

// ========================
// Voice-First Components (Non-interactive)
// ========================

// NOTE: The visual components (VoiceSessionCard, VoiceSpeakerCard, etc.)
// remain the same as the previous version. They are pure, non-interactive
// components designed for accessibility and clarity.

const VoiceSessionCard = ({ sessions }: { sessions: SessionData[] }) => {
  return (
    <section 
      role="region" 
      aria-labelledby="sessions-heading"
      className="w-full max-w-5xl mx-auto"
    >
      <h2 id="sessions-heading" className="text-3xl font-bold text-white mb-6">
        Conference Sessions
      </h2>
      <div className="grid gap-6">
        {sessions.map((session, index) => (
          <article 
            key={`${session.title}-${index}`}
            role="article"
            aria-labelledby={`session-${index}-title`}
            className="bg-gray-800 rounded-lg p-6 border border-gray-600 shadow-lg"
          >
            <header className="mb-4">
              <h3 
                id={`session-${index}-title`}
                className="text-xl font-semibold text-white mb-2"
              >
                {session.title}
              </h3>
              <p className="text-blue-300 font-medium text-lg">{session.speaker}</p>
            </header>
            
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-3 text-lg">
                <time aria-label="Session time" className="font-medium text-green-300">
                  {session.startTime}
                </time>
                <span className="text-gray-500">•</span>
                <span aria-label="Duration">{session.duration}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <span className="font-medium text-yellow-300">Room:</span>
                <span aria-label="Location">{session.room}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <span className="font-medium text-purple-300">Type:</span>
                <span>{session.sessionType}</span>
              </div>
              <p className="text-base leading-relaxed mt-4 text-gray-200">
                {session.abstract}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const VoiceSpeakerCard = ({ speaker }: { speaker: SpeakerData }) => {
  return (
    <section 
      role="region" 
      aria-labelledby="speaker-heading"
      className="w-full max-w-5xl mx-auto"
    >
      <article 
        role="article"
        aria-labelledby="speaker-name"
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 border border-gray-600 shadow-xl"
      >
        <header className="mb-6">
          <h2 id="speaker-name" className="text-3xl font-bold text-white mb-2">
            {speaker.name}
          </h2>
          <p className="text-blue-300 font-medium text-xl">{speaker.organization}</p>
        </header>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Biography</h3>
            <p className="text-gray-300 text-lg leading-relaxed">{speaker.bio}</p>
          </div>
          
          {speaker.expertise.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {speaker.expertise.map((area, index) => (
                  <span 
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {speaker.sessions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Sessions</h3>
              <div className="space-y-2">
                {speaker.sessions.map((session, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <p className="text-white font-medium">{session.title}</p>
                    <p className="text-gray-300">{session.startTime} • {session.room}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </section>
  );
};

const VoiceWeatherCard = ({ weather }: { weather: WeatherData }) => {
  return (
    <section 
      role="region" 
      aria-labelledby="weather-heading"
      className="w-full max-w-3xl mx-auto"
    >
      <article 
        role="article"
        className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-6 border border-blue-600 shadow-lg"
      >
        <header className="mb-4">
          <h2 id="weather-heading" className="text-2xl font-bold text-white mb-2">
            Vienna Weather
          </h2>
        </header>
        
        <div className="grid grid-cols-2 gap-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold">{weather.temperature}°C</div>
            <div className="text-xl text-blue-200">{weather.condition}</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Humidity:</span>
              <span className="font-medium">{weather.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span>Wind Speed:</span>
              <span className="font-medium">{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
        
        {weather.recommendation && (
          <div className="mt-4 p-3 bg-blue-700 rounded">
            <p className="text-blue-100 text-sm">{weather.recommendation}</p>
          </div>
        )}
      </article>
    </section>
  );
};

const VoiceNavigationCard = ({ navigation }: { navigation: NavigationData }) => {
  return (
    <section 
      role="region" 
      aria-labelledby="navigation-heading"
      className="w-full max-w-4xl mx-auto"
    >
      <article 
        role="article"
        className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg p-6 border border-green-600 shadow-lg"
      >
        <header className="mb-4">
          <h2 id="navigation-heading" className="text-2xl font-bold text-white mb-2">
            Navigation to {navigation.destination}
          </h2>
          <div className="flex items-center gap-4 text-green-200">
            <span>Estimated walk time: {navigation.estimatedWalkTime}</span>
            {navigation.accessibility && (
              <span className="bg-green-600 px-2 py-1 rounded text-sm">
                Accessible Route
              </span>
            )}
          </div>
        </header>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Route</h3>
            <ol className="space-y-2">
              {navigation.route.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-green-100">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          {navigation.landmarks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Landmarks</h3>
              <ul className="space-y-1">
                {navigation.landmarks.map((landmark, index) => (
                  <li key={index} className="text-green-200">• {landmark}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </section>
  );
};


// ========================
// Message Renderer
// ========================

const MessageRenderer = ({ message }: { message: any }) => {
  // NOTE: This component remains largely the same, its role is to map the
  // `UIMessage` parts from the Vercel AI SDK to the correct voice-first
  // component. It's the bridge between the generative UI backend and the
  // visual frontend.

  return (
    <div className="mb-8 animate-fade-in">
      {message.parts?.map((part: any, index: number) => {
        if (part.type === 'text') {
          return (
            <div key={index} className="text-xl text-white leading-relaxed mb-6 max-w-4xl">
              {part.text}
            </div>
          );
        }
        
        if (part.type === 'tool-showSessionDetails') {
          if (part.state === 'output-available') {
            return <VoiceSessionCard key={index} sessions={part.output.sessions} />;
          }
          // Render loading/error states...
        }
        
        if (part.type === 'tool-showSpeakerInfo') {
            if (part.state === 'output-available') {
                return <VoiceSpeakerCard key={index} speaker={part.output} />;
            }
             // Render loading/error states...
        }

        // ... handlers for other tools
        
        return null;
      })}
    </div>
  );
};


// ========================
// Tavus Voice Wrapper
// ========================

interface TavusVoiceWrapperProps {
  conversationUrl: string;
  onUtterance: (text: string) => void;
  textToSpeak: string | null;
  children: React.ReactNode;
}

function TavusVoiceWrapper({ conversationUrl, onUtterance, textToSpeak, children }: TavusVoiceWrapperProps) {
  const { joinCall, leaveCall } = useCVICall();
  const sendMessage = useSendAppMessage();

  // Join/leave the Tavus conversation
  useEffect(() => {
    if (conversationUrl) {
      joinCall({ url: conversationUrl });
    }
    return () => leaveCall();
  }, [conversationUrl, joinCall, leaveCall]);

  // Listen for user speech from Tavus
  useObservableEvent((event) => {
    if (event.event_type === 'conversation.utterance' && event.properties.speech) {
      onUtterance(event.properties.speech);
    }
  });

  // Send text to Tavus for TTS playback
  useEffect(() => {
    if (textToSpeak) {
      sendMessage({
        message_type: 'conversation',
        event_type: 'conversation.respond',
        properties: { text: textToSpeak },
      });
    }
  }, [textToSpeak, sendMessage]);

  return <>{children}</>;
}


// ========================
// Main Kiosk Interface
// ========================

export default function VoiceFirstKiosk() {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [textToSpeak, setTextToSpeak] = useState<string | null>(null);

  // Vercel AI SDK hook for managing generative UI state
  const { messages, sendMessage } = useChat({
    api: '/api/voice-chat', // Your generative UI backend
    id: 'ctbto-kiosk',
    onFinish: (message) => {
      // When the Vercel AI SDK stream finishes, find the last text part
      // and send it to Tavus for TTS playback.
      const assistantResponse = message.parts.find(p => p.type === 'text');
      if (assistantResponse) {
        setTextToSpeak(assistantResponse.text);
      }
    }
  });

  // Create an audio-only Tavus conversation on component mount
  useEffect(() => {
    async function initConversation() {
      // This function calls your backend to get a Tavus conversation URL
      // const url = await createTavusConversation({ audio_only: true });
      // For demo, using a placeholder:
      const url = "https://tavus.daily.co/placeholder-room";
      setConversationUrl(url);
    }
    initConversation();
  }, []);

  // Callback for when Tavus STT detects user speech
  const handleUtterance = (transcript: string) => {
    setTextToSpeak(null); // Clear previous TTS on new user input
    sendMessage({ text: transcript }); // Send transcript to Vercel AI SDK backend
  };
  
  if (!conversationUrl) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Initializing Conversation...</div>
      </main>
    );
  }

  return (
    <CVIProvider>
      <TavusVoiceWrapper
        conversationUrl={conversationUrl}
        onUtterance={handleUtterance}
        textToSpeak={textToSpeak}
      >
        <main 
          className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black overflow-hidden"
          role="main"
          aria-label="CTBTO SnT2025 Conference Voice Assistant"
        >
          <div className="container mx-auto px-8 py-8 max-w-7xl">
            {/* Header */}
            <header className="mb-12 text-center">
              <h1 className="text-5xl font-bold text-white mb-4">CTBTO SnT2025</h1>
              <p className="text-2xl text-gray-300">Conference Voice Assistant</p>
            </header>
            
            {/* Messages */}
            <div className="space-y-8 min-h-[60vh]">
              {messages.map(message => (
                <MessageRenderer key={message.id} message={message} />
              ))}
              
              {messages.length === 0 && (
                 <div className="text-center py-16">
                    <h2 className="text-3xl text-gray-400 mb-6">Welcome</h2>
                    <p className="text-xl text-gray-500">The assistant is ready. Please speak your request.</p>
                 </div>
              )}
            </div>
          </div>
        </main>
      </TavusVoiceWrapper>
    </CVIProvider>
  );
} 