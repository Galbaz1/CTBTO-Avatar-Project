const express = require('express');
const cors = require('cors');

// Load environment variables from both .env and .env.local
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Conference default location
const CONFERENCE_LOCATION = 'Vienna, Austria';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ROSA Weather Service is running',
    conference_location: CONFERENCE_LOCATION,
    default_weather: 'Vienna'
  });
});

// Default Vienna weather endpoint
app.get('/api/weather/vienna', async (req, res) => {
  try {
    const weatherApiKey = process.env.WEATHER_API_KEY;
    if (!weatherApiKey) {
      return res.status(500).json({ 
        error: 'Weather API key not configured' 
      });
    }

    // Get Vienna weather (conference location)
    const url = `https://api.weatherapi.com/v1/current.json` +
                `?key=${weatherApiKey}` +
                `&q=Vienna,Austria&aqi=no`;

    const response = await fetch(url, { 
      cache: "no-store",
      headers: {
        'User-Agent': 'ROSA-Conference-Assistant/1.0'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ 
        error: 'Weather service temporarily unavailable' 
      });
    }

    const data = await response.json();
    
    // Vienna-specific response for conference context
    const weatherData = {
      location: 'Vienna, Austria (Conference Location)',
      localTime: data.location.localtime,
      timezone: data.location.tz_id,
      temperature: {
        celsius: data.current.temp_c,
        fahrenheit: data.current.temp_f
      },
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      windKph: data.current.wind_kph,
      feelsLikeC: data.current.feelslike_c,
      visibility: data.current.vis_km,
      isDay: data.current.is_day === 1,
      // Conference-relevant additions
      isConferenceLocation: true,
      conferenceWeatherAdvice: getConferenceWeatherAdvice(data.current)
    };

    console.log('Vienna (conference) weather requested:', weatherData);
    res.json(weatherData);

  } catch (error) {
    console.error('Vienna weather API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Vienna conference weather',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Custom location weather endpoint
app.post('/api/weather', async (req, res) => {
  try {
    const { location } = req.body;

    // Default to Vienna if no location specified
    const requestedLocation = location || CONFERENCE_LOCATION;

    if (!requestedLocation) {
      return res.status(400).json({ 
        error: 'Location is required' 
      });
    }

    const weatherApiKey = process.env.WEATHER_API_KEY;
    if (!weatherApiKey) {
      return res.status(500).json({ 
        error: 'Weather API key not configured' 
      });
    }

    // Use WeatherAPI as researched - single call for weather + time
    const url = `https://api.weatherapi.com/v1/current.json` +
                `?key=${weatherApiKey}` +
                `&q=${encodeURIComponent(requestedLocation)}&aqi=no`;

    const response = await fetch(url, { 
      cache: "no-store",
      headers: {
        'User-Agent': 'ROSA-Conference-Assistant/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 400) {
        return res.status(400).json({ 
          error: 'Invalid location. Please provide a valid city name, postal code, or coordinates.',
          suggestion: 'Try: Vienna, New York, or 48.2082,16.3738'
        });
      }
      return res.status(502).json({ error: 'Weather service temporarily unavailable' });
    }

    const data = await response.json();
    
    // Normalized response - exactly as user researched
    const isViennaConference = data.location.name.toLowerCase().includes('vienna');
    
    const weatherData = {
      location: data.location.name + (data.location.country !== data.location.name ? `, ${data.location.country}` : ''),
      localTime: data.location.localtime,    // "2025-01-18 12:15"
      timezone: data.location.tz_id,         // "Europe/Vienna"
      temperature: {
        celsius: data.current.temp_c,
        fahrenheit: data.current.temp_f
      },
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      windKph: data.current.wind_kph,
      feelsLikeC: data.current.feelslike_c,
      visibility: data.current.vis_km,
      isDay: data.current.is_day === 1,
      // Conference context
      isConferenceLocation: isViennaConference,
      conferenceWeatherAdvice: isViennaConference ? getConferenceWeatherAdvice(data.current) : null
    };

    console.log(`Weather request for ${requestedLocation}:`, weatherData);
    res.json(weatherData);

  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function for conference-specific weather advice
function getConferenceWeatherAdvice(currentWeather) {
  const temp = currentWeather.temp_c;
  const condition = currentWeather.condition.text.toLowerCase();
  
  let advice = [];
  
  // Temperature advice
  if (temp < 0) {
    advice.push("Very cold - heavy coat recommended for outdoor sessions");
  } else if (temp < 10) {
    advice.push("Cold - warm jacket needed for conference venue");
  } else if (temp > 25) {
    advice.push("Warm - light clothing suitable for indoor sessions");
  }
  
  // Condition advice
  if (condition.includes('rain')) {
    advice.push("Rain expected - umbrella recommended for venue transfers");
  } else if (condition.includes('snow')) {
    advice.push("Snow conditions - allow extra travel time to venue");
  } else if (condition.includes('clear') || condition.includes('sunny')) {
    advice.push("Clear conditions - ideal for networking breaks outdoors");
  }
  
  return advice.length > 0 ? advice.join('. ') : "Pleasant conditions for conference activities";
}

app.listen(PORT, () => {
  console.log(`🌤️  ROSA Weather Service running on port ${PORT}`);
  console.log(`🏛️  Conference location: ${CONFERENCE_LOCATION}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Vienna weather: http://localhost:${PORT}/api/weather/vienna`);
  console.log(`Custom weather: http://localhost:${PORT}/api/weather`);
}); 