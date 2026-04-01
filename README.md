# Automated-MCA

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## About This Project

**MCA Dept. Auto-Greeter** is an automated system for sending messages, greetings, announcements, and generating certificates for the MCA Department. This application leverages AI-powered template suggestions using Google's Gemini API to streamline communication and event management.

### Key Features

- 🎯 **Automated Greetings**: Send personalized birthday wishes, festival greetings, and event announcements
- 🤖 **AI-Powered Suggestions**: Generate message templates using Google Gemini API
- 🎓 **Certificate Generation**: Automated certificate creation for achievements and accomplishments
- 👥 **Role-Based Access**: Support for multiple roles including Student, Faculty, Alumni, Admin, and Director
- 📋 **Event Categories**: Manage Birthday, Festival, Achievement, Farewell, and Notice events
- ✅ **Approval Workflow**: Built-in approval system for messages and achievements
- 📊 **Activity Logging**: Track all system actions and communications
- 🔐 **Secure Admin Panel**: Protected admin dashboard for management

### Tech Stack

- **Frontend**: React 19.2.1 with TypeScript (93.7%)
- **Build Tool**: Vite 6.2.0
- **Styling**: CSS 2.8%, HTML 2.5%
- **AI Integration**: Google Generative AI (@google/genai)
- **Routing**: React Router DOM 7.10.1
- **UI Icons**: Lucide React 0.556.0

## Project Structure

```
Automated-MCA/
├── App.tsx                 # Main routing configuration
├── index.tsx              # Application entry point
├── types.ts               # TypeScript interfaces and enums
├── metadata.json          # Project metadata
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── components/            # Reusable React components
├── pages/                 # Page components (PublicHome, AdminPanel, Login)
├── services/              # Service modules for API calls
├── utils/                 # Utility functions
├── public/                # Static assets
└── src/                   # Additional source files
```

## Core Types

The application uses TypeScript interfaces for type safety:

- **Member**: User data including role, contact info, and department
- **Template**: Message templates with categories and AI-generated content
- **Achievement**: User accomplishments with approval workflow
- **Log**: Activity logs for tracking system actions

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- Gemini API key for AI features

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yadhu-tj/Automated-MCA.git
   cd Automated-MCA
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Create a `.env.local` file in the project root
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. **Run the application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server with hot module reloading
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build

## User Roles & Permissions

- **Student**: Can view announcements and receive greetings
- **Faculty**: Can create and manage events
- **Alumni**: Can receive anniversary greetings and updates
- **Admin**: Can manage users, templates, and approvals
- **Director**: Full system access and administrative control

## Event Categories

- **Birthday**: Personalized birthday greetings
- **Festival**: Festival announcements and wishes
- **Achievement**: Achievement notifications with certificates
- **Farewell**: Farewell messages for departing members
- **Notice**: General announcements and notices

## AI Features

The application uses Google's Gemini API to:
- Generate creative message suggestions based on event context
- Provide tone-appropriate greetings
- Create personalized templates for different event categories

## Deployment

View and manage your app in AI Studio:
https://ai.studio/apps/drive/1piVw7pzJC8vSv6lWkWCW2WCbR5oyd6ss

## Security

- Protected admin routes with authentication
- Role-based access control
- Environment variable management for sensitive data
- Approval workflows for critical operations

## Development Notes

- Built with React 19.2.1 for latest React features
- Vite for fast development and optimized production builds
- TypeScript for type safety and better developer experience
- React Router for client-side navigation
- ESLint for code quality

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is private and part of the MCA Department initiative.

---

For questions or support, please reach out to the development team.