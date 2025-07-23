# ChatGPT Clone with Streaming Components

A modern ChatGPT clone built with Next.js and FastAPI, featuring streaming responses and custom interactive components for weather and stock data.

## Features

- 🚀 **Streaming Responses**: Real-time message streaming using Server-Sent Events
- 🌤️ **Weather Components**: Interactive weather cards with current conditions and 5-day forecasts
- 📈 **Stock Components**: Dynamic stock price cards with historical data and charts
- 💬 **Chat Management**: Create, delete, and manage multiple chat sessions
- 🌓 **Dark/Light Theme**: Toggle between light and dark modes
- 📱 **Responsive Design**: Beautiful UI that works on desktop and mobile
- 🔍 **Web Search**: Powered by OpenAI's gpt-4o model

## Architecture

### Frontend (Next.js)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Context API** for state management
- **Custom Components** for weather and stock data visualization

### Backend (FastAPI)
- **FastAPI** with Python
- **OpenAI API** integration with streaming support
- **Structured JSON responses** for component data
- **CORS enabled** for frontend communication

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- OpenAI API key

### Frontend Setup

1. Navigate to the project directory:
```bash
cd streaming_components
```

2. Install Node.js dependencies:
```bash
npm install
# or
npm i
```

3. Start the Next.js development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd streaming_components/BACKEND
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

4. Start the FastAPI server:
```bash
python main.py
```

The backend API will be available at `http://localhost:8000`

## How It Works

### Chat Interface
- **New Chat**: Click the "New Chat" button to start a fresh conversation
- **Message History**: View all your chat sessions in the collapsible sidebar
- **Delete Chats**: Hover over any chat in the sidebar and click the delete button
- **Theme Toggle**: Switch between light and dark modes using the theme button

### Custom Components

#### Weather Component
Ask questions like:
- "What's the weather in New York?"
- "Show me the weather forecast for London"
- "How's the weather in Tokyo today?"

The AI will respond with an interactive weather card showing:
- Current temperature and conditions
- Humidity and wind speed
- 5-day weather forecast with icons

#### Stock Component
Ask questions like:
- "What's the current price of Apple stock?"
- "Show me Tesla stock information"
- "How is Microsoft stock performing?"

The AI will respond with an interactive stock card showing:
- Current stock price and daily change
- Price change percentage (with color coding)
- 10-day price history chart
- Recent price data table

### Streaming Technology
- Messages are delivered in real-time using Server-Sent Events (SSE)
- The AI response appears character by character as it's generated
- Component data is parsed from JSON responses and rendered as interactive cards

## API Endpoints

### POST /api/chat
Send a chat message and receive a streaming response.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's the weather in Paris?"
    }
  ],
  "use_components": true
}
```

**Response:** Server-Sent Events stream with content updates

### GET /
Health check endpoint

## Technologies Used

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend
- **FastAPI** - Python web framework
- **OpenAI API** - AI model integration
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## Project Structure

```
streaming_components/
├── app/
│   ├── components/           # React components
│   │   ├── ChatInterface.tsx # Main chat interface
│   │   ├── Sidebar.tsx      # Chat history sidebar
│   │   ├── WeatherCard.tsx  # Weather component
│   │   └── StockCard.tsx    # Stock component
│   ├── contexts/            # React contexts
│   │   ├── ChatContext.tsx  # Chat state management
│   │   └── ThemeContext.tsx # Theme management
│   ├── lib/                 # Utility functions
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main page
├── BACKEND/
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
├── public/                 # Static assets
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please ensure you comply with OpenAI's usage policies when using their API.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure both frontend (port 3000) and backend (port 8000) are running
2. **OpenAI API Errors**: Verify your API key is correctly set
3. **Component Not Rendering**: Check that the AI response contains valid JSON structure
4. **Streaming Issues**: Ensure your browser supports Server-Sent Events

### Support

If you encounter any issues, please check:
1. All dependencies are installed correctly
2. OpenAI API key is valid and has sufficient credits
3. Both servers are running on correct ports
4. Network connectivity is stable

For additional help, refer to the documentation of the respective technologies used in this project.
