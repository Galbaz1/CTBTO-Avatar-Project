export interface CardData {
  id: string;
  type: 'weather' | 'session' | 'speaker' | 'topic' | 'floor-plan' | 'qr-schedule' | 'live-status';
  content: any;
  priority?: number;
  size?: 'compact' | 'full' | 'hero';
}

export interface WeatherData {
  location: string;
  country?: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  feelsLike?: number;
  pressure?: number;
  icon: string;
  success: boolean;
} 