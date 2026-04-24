# Automated-MCA

<div align="center">

**UCC MCA Department Portal** — Automated greetings, achievements, events & certificate management

</div>

## About This Project

**MCA Dept. Auto-Greeter** is a full-stack web application for the UCC MCA Department that automates greetings, announcements, member management, and certificate generation. It features a modern, responsive public portal and a protected admin dashboard. AI-powered greeting generation is supported via Google's Gemini API.

### Key Features

- 🎯 **Automated Greetings** — Birthday wishes, festival announcements, and event notifications with a sliding card carousel
- 🤖 **AI-Powered Suggestions** — Generate message templates using Google Gemini API
- 🎓 **Certificate Generation** — Automated certificate creation for achievements with file upload support
- 👥 **Member Management** — CRUD operations with CSV import/export and **profile photo upload**
- 📅 **Department Calendar** — Create, edit, and display upcoming events
- 🏆 **Wall of Achievements** — Publicly displayed approved achievements with certificate links
- ✅ **Approval Workflow** — Built-in approval system (Pending → Approved / Rejected)
- 🔐 **Secure Admin Panel** — Protected routes with token-based authentication
- ✨ **Modern UI** — Parallax hero slideshow, glassmorphism, glow-on-hover cards, scroll-triggered fade-in animations

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | 19.2.1 |
| **Build Tool** | Vite | 6.4.2 |
| **CSS** | Tailwind CSS (CDN) | 3.x |
| **Routing** | React Router DOM | 7.10.1 |
| **Icons** | Lucide React | 0.556.0 |
| **Backend** | FastAPI + Uvicorn | 0.136.0 |
| **ORM** | SQLAlchemy | 2.0.49 |
| **Database** | SQLite | — |
| **AI** | Google Generative AI (`google-genai`) | 1.73.1 |
| **Validation** | Pydantic + email-validator | 2.13.3 |

## Project Structure

```
Automated-MCA/
├── index.html              # HTML entry + Tailwind config + custom CSS
├── index.tsx               # React DOM mount
├── index.css               # Base reset styles
├── App.tsx                 # Router setup (HashRouter)
├── types.ts                # Shared TypeScript interfaces & enums
├── vite.config.ts          # Vite dev-server & alias config
├── main.py                 # FastAPI backend (all API routes)
├── database.py             # SQLAlchemy engine & session
├── models.py               # ORM models (Member, Event, Achievement, Template)
├── schemas.py              # Pydantic request/response schemas
├── requirement.txt         # Python dependencies
├── package.json            # Node dependencies & scripts
│
├── pages/
│   ├── PublicHome.tsx       # Landing page (hero, greetings, calendar, achievements)
│   ├── AdminPanel.tsx       # Admin dashboard with tabbed management
│   ├── Login.tsx            # Admin login form
│   └── CertificatePage.tsx  # Certificate viewer
│
├── components/
│   ├── Layout.tsx           # Navbar + footer wrapper
│   ├── ProtectedRoute.tsx   # Auth guard for /admin
│   ├── CertificatePreview.tsx
│   ├── public/              # Public-facing components
│   │   ├── HeroSection.tsx        # Parallax image slideshow hero
│   │   ├── GreetingsWidget.tsx    # Sliding birthday & festival cards
│   │   ├── DepartmentCalendar.tsx # Event list with date blocks
│   │   └── AchievementWall.tsx    # Ranked achievement list
│   └── admin/               # Admin dashboard components
│       ├── MemberManager.tsx      # Member table + CSV import
│       ├── MemberModal.tsx        # Add/Edit member form with photo upload
│       ├── CalendarManager.tsx    # Event CRUD
│       ├── AchievementManager.tsx # Achievement CRUD + certificate upload
│       ├── TemplateManager.tsx    # Message templates
│       └── GeneratorTab.tsx       # AI greeting generator
│
├── services/
│   └── api.ts              # All fetch calls to the backend
│
├── utils/
│   └── csvParser.ts         # CSV → Member[] parser
│
├── uploads/
│   ├── certificates/        # Uploaded certificate files
│   └── photos/              # Uploaded member profile photos
│
└── test_main.py             # Pytest API tests
```

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **Python** 3.9+ with **pip**
- A Google Gemini API key (optional — AI features fall back to mock data without it)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yadhu-tj/Automated-MCA.git
   cd Automated-MCA
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Create & activate a Python virtual environment** (recommended):
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS / Linux
   source venv/bin/activate
   ```

4. **Install backend dependencies**:
   ```bash
   pip install -r requirement.txt
   ```

5. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Optionally override the API URL for the frontend with a `.env.local`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

### Running the Application

**Start the backend** (port 8000):
```bash
python main.py
```
or
```bash
uvicorn main:app --reload
```

**Start the frontend** (port 3000):
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Admin Login

- **Email**: `admin@mca.com`
- **Password**: `1234`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `python main.py` | Start FastAPI with auto-reload |
| `pytest test_main.py` | Run backend API tests |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/members` | List all members |
| `POST` | `/api/members` | Create a member |
| `PUT` | `/api/members/:id` | Update a member |
| `DELETE` | `/api/members/:id` | Delete a member |
| `POST` | `/api/members/upload-photo` | Upload a member profile photo |
| `GET` | `/api/events` | List all events |
| `GET` | `/api/events/upcoming` | List upcoming events |
| `POST` | `/api/events` | Create an event |
| `PUT` | `/api/events/:id` | Update an event |
| `DELETE` | `/api/events/:id` | Delete an event |
| `GET` | `/api/achievements` | List all achievements |
| `GET` | `/api/achievements/:id` | Get single achievement |
| `POST` | `/api/achievements` | Create an achievement |
| `PUT` | `/api/achievements/:id` | Update an achievement |
| `DELETE` | `/api/achievements/:id` | Delete an achievement |
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/ai/generate-greeting` | AI greeting generation |

## User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Student** | View announcements, receive greetings |
| **Faculty** | Create and manage events |
| **Alumni** | Receive anniversary greetings and updates |
| **Admin** | Manage users, templates, approvals, and certificates |
| **Director** | Full system access and administrative control |

## Event Categories

- **Birthday** — Personalized birthday greetings
- **Festival** — Festival announcements and wishes
- **Achievement** — Achievement notifications with certificates
- **Farewell** — Farewell messages for departing members
- **Notice** — General announcements and notices

## AI Features

The application uses Google's Gemini API (`gemini-2.5-flash`) to:
- Generate creative greeting messages based on event context
- Provide tone-appropriate content for different roles
- Create personalized templates for each event category

Falls back to mock data when `GEMINI_API_KEY` is not configured.

## Security

- Protected admin routes with token-based authentication
- CORS configured for development ports (3000, 3001, 5173)
- Environment variable management for API keys
- Approval workflows for achievements before public display
- File upload validation (type + size checks)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is private and part of the UCC MCA Department initiative.

---

For questions or support, please reach out to the development team.
