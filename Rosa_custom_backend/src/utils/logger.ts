// ROSA Logging Utilities
// Centralized logging system for comprehensive debugging and monitoring

export interface LogConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  categories: {
    api: boolean;
    conversation: boolean;
    toolCalls: boolean;
    connection: boolean;
    ui: boolean;
    weather: boolean;
  };
}

// Default logging configuration (reduced noise)
const defaultConfig: LogConfig = {
  enabled: true,
  level: 'info',  // Changed from 'debug' to 'info' to reduce noise
  categories: {
    api: false,        // Disable API polling logs
    conversation: true,
    toolCalls: true,
    connection: false, // Disable connection polling logs
    ui: true,
    weather: true,
  }
};

// Get configuration from localStorage or use defaults
const getLogConfig = (): LogConfig => {
  try {
    const stored = localStorage.getItem('rosa-log-config');
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to parse log config from localStorage, using defaults');
  }
  return defaultConfig;
};

// Store configuration to localStorage
export const setLogConfig = (config: Partial<LogConfig>) => {
  try {
    const currentConfig = getLogConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('rosa-log-config', JSON.stringify(newConfig));
  } catch (e) {
    console.warn('Failed to save log config to localStorage');
  }
};

// Color scheme for different categories
const categoryColors = {
  api: '#00d2d3',
  conversation: '#2ed573',
  toolCalls: '#ff6b6b',
  connection: '#3742fa',
  ui: '#5f27cd',
  weather: '#ffa502',
  error: '#ff4757',
  warn: '#ffa502',
  info: '#54a0ff',
  debug: '#747d8c'
};

// Log levels hierarchy
const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Enhanced logger class
export class ROSALogger {
  private config: LogConfig;
  private category: keyof LogConfig['categories'] | 'general';
  private sessionId: string | null = null;

  constructor(category: keyof LogConfig['categories'] | 'general' = 'general') {
    this.category = category;
    this.config = getLogConfig();
  }

  // Set session ID for correlation with backend logs
  setSessionId(sessionId: string | null) {
    this.sessionId = sessionId;
    // Debug: Verify session ID is properly set
    if (sessionId && sessionId !== 'undefined') {
      console.log(`📍 Logger session set: [${sessionId.slice(0, 8)}]`);
    }
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    if (!this.config.enabled) return false;
    if (this.category !== 'general' && !this.config.categories[this.category as keyof LogConfig['categories']]) return false;
    return logLevels[level] >= logLevels[this.config.level];
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', event: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'info' ? 'ℹ️' : '🔍';
    const color = categoryColors[this.category as keyof typeof categoryColors] || categoryColors[level];
    
    // Format session ID like backend logger
    const sessionPrefix = this.sessionId ? `[${this.sessionId.slice(0, 8)}]` : '[no-session]';
    const logPrefix = `${sessionPrefix} ${emoji} ${event}`;

    console.group(`%c${logPrefix} [${timestamp}]`, `color: ${color}; font-weight: bold;`);
    if (data) {
      console.log('📋 Data:', data);
    }
    console.groupEnd();
  }

  debug(event: string, data?: any) {
    this.log('debug', event, data);
  }

  info(event: string, data?: any) {
    this.log('info', event, data);
  }

  warn(event: string, data?: any) {
    this.log('warn', event, data);
  }

  error(event: string, data?: any) {
    this.log('error', event, data);
  }

  // Convenience method for function calls
  functionCall(toolName: string, args: any, response?: any) {
    this.info('function-call', {
      toolName,
      arguments: args,
      response,
      timestamp: new Date().toISOString()
    });
  }

  // Convenience method for API calls
  apiCall(method: string, endpoint: string, data?: any, duration?: number) {
    this.info('api-call', {
      method,
      endpoint,
      data,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Specialized logging methods for structured conversation flow
  user(message: string) {
    const cleanMessage = message.length > 50 ? message.slice(0, 50) + '...' : message;
    this.log('info', `🟢 USER: "${cleanMessage}"`);
  }

  assistant(message: string) {
    const cleanMessage = message.length > 50 ? message.slice(0, 50) + '...' : message;
    this.log('info', `💬 ROSA: "${cleanMessage}"`);
  }

  toolCall(toolName: string, args: any) {
    // Create clean args display
    let cleanArgs = '';
    if (toolName === 'get_weather' && args.location) {
      cleanArgs = `location="${args.location}"`;
    } else if (toolName === 'search_conference_knowledge' && args.query) {
      cleanArgs = `query="${args.query}"`;
    } else {
      // Generic fallback
      cleanArgs = Object.entries(args)
        .map(([key, value]) => `${key}="${value}"`)
        .join(', ');
    }
    this.log('info', `🔧 TOOL_CALL: ${toolName}(${cleanArgs})`);
  }

  cardShow(cardType: string, details?: string) {
    const detailsStr = details ? `: ${details}` : '';
    this.log('info', `🎴 CARD_SHOW: ${cardType}${detailsStr}`);
  }

  sessionState(state: string, details?: string) {
    const detailsStr = details ? `: ${details}` : '';
    this.log('info', `📍 SESSION: ${state}${detailsStr}`);
  }

  performance(operation: string, duration: number) {
    this.log('info', `⏱️ ${operation}: ${duration.toFixed(2)}ms`);
  }

  connection(status: string, details?: string) {
    const detailsStr = details ? `: ${details}` : '';
    this.log('info', `🔗 CONNECTION: ${status}${detailsStr}`);
  }
}

// Pre-configured loggers for different categories
export const loggers = {
  api: new ROSALogger('api'),
  conversation: new ROSALogger('conversation'),
  toolCalls: new ROSALogger('toolCalls'),
  connection: new ROSALogger('connection'),
  ui: new ROSALogger('ui'),
  weather: new ROSALogger('weather'),
  general: new ROSALogger('general')
};

// Utility function to enable/disable all logging
export const setLoggingEnabled = (enabled: boolean) => {
  setLogConfig({ enabled });
  console.log(`%cROSA Logging ${enabled ? 'ENABLED' : 'DISABLED'}`, 
    `color: ${enabled ? '#2ed573' : '#ff4757'}; font-weight: bold; font-size: 14px;`);
};

// Utility function to set log level
export const setLogLevel = (level: 'debug' | 'info' | 'warn' | 'error') => {
  setLogConfig({ level });
  console.log(`%cROSA Log Level set to: ${level.toUpperCase()}`, 
    'color: #3742fa; font-weight: bold; font-size: 14px;');
};

// Utility function to toggle specific categories
export const toggleLogCategory = (category: keyof LogConfig['categories'], enabled?: boolean) => {
  const currentConfig = getLogConfig();
  const newEnabled = enabled !== undefined ? enabled : !currentConfig.categories[category];
  setLogConfig({ 
    categories: { 
      ...currentConfig.categories, 
      [category]: newEnabled 
    } 
  });
  console.log(`%cROSA ${category} logging ${newEnabled ? 'ENABLED' : 'DISABLED'}`, 
    `color: ${newEnabled ? '#2ed573' : '#ff4757'}; font-weight: bold;`);
};

// Global logging controls for the browser console
(window as any).ROSALogging = {
  enable: () => setLoggingEnabled(true),
  disable: () => setLoggingEnabled(false),
  setLevel: setLogLevel,
  toggleCategory: toggleLogCategory,
  getConfig: getLogConfig,
  loggers
};

// Log initialization
console.log('%cROSA Logging System Initialized', 'color: #2ed573; font-weight: bold; font-size: 16px;');
console.log('%c📊 Frontend Logging: Conversation-focused, minimal polling noise', 'color: #70a1ff; font-style: italic;');
console.log('%cUse window.ROSALogging to control logging settings', 'color: #54a0ff; font-style: italic;');

export default loggers; 