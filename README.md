# Synaptide - AI Chatbot with Perfect Memory

Synaptide is an intelligent AI-powered chatbot application that delivers dynamic, personalized conversational experiences with advanced memory and interaction capabilities. Designed by Olamide Daniel Oladimeji.

## Features

- **Perfect Memory**: Remembers entire conversation history to provide context-aware responses
- **Personalized Experience**: Learns user preferences and adapts communication style over time
- **Multi-User Support**: Separate conversation histories for different users
- **Responsive Design**: Works seamlessly across mobile, tablet, and desktop devices
- **Real-time Chat**: Instant messaging with typing indicators and smooth animations
- **Dark Theme**: Minimalist black/gray themed interface inspired by modern AI assistants

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Firebase Firestore** for data persistence
- **OpenAI GPT-4o** for AI responses

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd synaptide
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration (automatically set by Replit)
DATABASE_URL=your_database_url
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Create a web app and get your configuration keys
4. Add your domain to the authorized domains list

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
synaptide/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
├── server/                # Backend Express server
│   ├── firebase.ts       # Firebase configuration and helpers
│   ├── openai.ts         # OpenAI integration
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage interface
├── shared/               # Shared types and schemas
└── attached_assets/      # Static assets
```

## Database Structure

Synaptide uses Firebase Firestore with the following hierarchical structure:

```
chats/
  {username}/
    messages/
      {message_id}/
        - user_input: string
        - ai_response: string
        - timestamp: Date
        - version: number
    profile/
      data/
        - bio: UserBio
        - preferences: object
        - interests: array
        - last_updated: Date
```

## API Endpoints

- `GET /api/users?name={username}` - Get user by name
- `POST /api/users` - Create new user
- `GET /api/users/{userId}/messages` - Get user's messages
- `POST /api/users/{userId}/messages` - Send new message
- `DELETE /api/users/{userId}/messages` - Clear user's messages

## Usage

1. Enter your name on the home page to start or continue a conversation
2. The system will load your previous conversation history if you've used the app before
3. Chat with Synaptide - it will remember your entire conversation history
4. Use the menu to clear chat history or log out

## Deployment

The app is designed to work with Replit Deployments but can be deployed to any Node.js hosting platform that supports:
- Environment variables
- Firebase connections
- OpenAI API access

## Contributing

This project was created by Olamide Daniel Oladimeji. Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Designed by Olamide Daniel Oladimeji
- Built with modern web technologies and AI integration
- Inspired by the vision of AI assistants with perfect memory