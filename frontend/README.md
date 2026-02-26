# SARAL AI Frontend

React-based web application for the SARAL AI research democratization platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Components](#components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Development](#development)

---

## Overview

The SARAL AI frontend is a modern React application that provides an intuitive interface for:
- Uploading and processing research papers
- Generating educational videos with AI narration
- Creating podcast-style dialogues
- Generating interactive mind maps
- Producing visual storytelling content

Built with React 18, Tailwind CSS, and Framer Motion for smooth animations.

---

## Features

| Feature | Description |
|---------|-------------|
| **Google OAuth** | Secure authentication with Google accounts |
| **Paper Upload** | PDF, LaTeX ZIP, and arXiv URL support |
| **Script Editor** | Edit and customize AI-generated scripts |
| **Multi-language** | English, Hindi, and 9+ regional languages |
| **Complexity Levels** | Easy, Medium, Advanced content adaptation |
| **Real-time Progress** | Live status updates during generation |
| **Dark Mode** | Full dark/light theme support |
| **Responsive Design** | Mobile-friendly interface |

---

## Installation

### Prerequisites

- **Node.js** 16+ ([nodejs.org](https://nodejs.org))
- **npm** 8+ (comes with Node.js)

### Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## Configuration

Create a `.env` file in the `frontend/` directory:

```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Google OAuth Client ID (for authentication)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Optional: Debug mode
REACT_APP_DEBUG=false
```

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized origins: `http://localhost:3000`
6. Copy Client ID to `.env`

---

## Running the Application

### Development Mode

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000) with hot reload.

### Production Build

```bash
npm run build
```

Creates optimized build in `build/` folder.

### Testing

```bash
npm test
```

Launches test runner in interactive watch mode.

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # SEO robots file
├── src/
│   ├── App.js              # Main application component
│   ├── App.css             # Global styles
│   ├── index.js            # React entry point
│   ├── index.css           # Tailwind imports
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared utilities
│   │   ├── forms/          # Form components
│   │   ├── navigation/     # Nav components
│   │   ├── ui/             # UI primitives
│   │   └── workflow/       # Workflow steps
│   ├── contexts/           # React Context providers
│   │   ├── ApiContext.jsx
│   │   ├── AuthContext.jsx
│   │   ├── ComplexityContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── WorkflowContext.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   ├── usePagination.js
│   │   └── useResponsive.js
│   ├── pages/              # Page components
│   ├── services/           # API client
│   │   └── api.js
│   ├── lib/                # Utility libraries
│   │   └── utils.js
│   ├── styles/             # Additional CSS
│   └── images/             # Static images
├── tailwind.config.js      # Tailwind configuration
├── package.json            # Dependencies
└── README.md               # This file
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| `LandingPage` | `/` | Home page with feature showcase |
| `About` | `/about` | About page and team info |
| `ApiSetup` | `/api-setup` | API key configuration (protected) |
| `PaperProcessing` | `/paper-processing` | Paper upload and processing (protected) |
| `ScriptGeneration` | `/script-generation` | Script editing (protected) |
| `SlideCreation` | `/slide-creation` | Slide generation (protected) |
| `MediaGeneration` | `/media-generation` | Audio/video creation (protected) |
| `Results` | `/results` | Final output download (protected) |
| `PodcastGeneration` | `/podcast` | Podcast creation |
| `MindmapGeneration` | `/mindmap` | Mind map generation |
| `VisualStorytellingPage` | `/visual-storytelling` | Visual story creation |
| `VideosPage` | `/sample` | Sample videos showcase |

**Protected routes** require Google OAuth authentication.

---

## Components

### Auth Components (`components/auth/`)
- Google OAuth login button
- Protected route wrapper

### Common Components (`components/common/`)
- `ErrorBoundary` - Error catching wrapper
- `ProtectedRoute` - Auth guard component
- `ComplexityButton` - Complexity level selector
- Loading spinners and indicators

### UI Components (`components/ui/`)
- `GlowCard` - Spotlight effect cards
- `StarBorder` - Animated border effect
- Custom buttons and inputs

### Workflow Components (`components/workflow/`)
- Step indicators
- Progress tracking
- Navigation between workflow stages

---

## State Management

### Contexts

| Context | Purpose |
|---------|---------|
| `AuthContext` | User authentication state |
| `ApiContext` | API configuration and status |
| `WorkflowContext` | Paper processing workflow state |
| `ComplexityContext` | Content complexity level |
| `ThemeContext` | Dark/light theme toggle |

### Using Contexts

```jsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <span>Welcome, {user.name}</span>
      ) : (
        <button onClick={loginWithGoogle}>Login</button>
      )}
    </div>
  );
}
```

---

## API Integration

### API Client (`services/api.js`)

The API client handles:
- Base URL configuration
- JWT token management
- Request/response interceptors
- Error handling with retries
- File upload support

### Usage

```jsx
import api from './services/api';

// GET request
const response = await api.get('/papers/list');

// POST request
const result = await api.post('/scripts/generate', { paper_id: '123' });

// File upload
const formData = new FormData();
formData.append('file', file);
await api.post('/papers/upload-pdf', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Authentication

The API client automatically:
- Attaches JWT token to requests
- Refreshes token when needed
- Redirects to login on 401 errors

---

## Styling

### Tailwind CSS

Primary styling framework with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom colors, fonts, animations
    }
  }
}
```

### Framer Motion

Used for animations:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Animated content
</motion.div>
```

### React Icons

Icon library usage:

```jsx
import { FiVideo, FiMic, FiFileText } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
```

---

## Development

### Code Style

- **ESLint** - Configured via Create React App
- **Prettier** - Optional formatting

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run eject` | Eject from CRA (one-way) |

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.js`
3. Wrap with `ProtectedRoute` if auth required
4. Add navigation link if needed

### Environment Variables

All environment variables must be prefixed with `REACT_APP_`:

```bash
REACT_APP_MY_VAR=value
```

Access in code:

```javascript
const value = process.env.REACT_APP_MY_VAR;
```

---

## Dependencies

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.x | UI framework |
| `react-dom` | 18.x | React DOM renderer |
| `react-router-dom` | 6.x | Client-side routing |
| `axios` | 1.x | HTTP client |

### UI/UX

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 3.x | CSS framework |
| `framer-motion` | 10.x | Animations |
| `react-icons` | 4.x | Icon library |
| `react-hot-toast` | 2.x | Toast notifications |
| `mermaid` | 10.x | Diagram rendering |

### Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-oauth/google` | 0.12.x | Google OAuth |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `clsx` | 1.x | Class name utility |
| `react-dropzone` | 14.x | File upload |
| `react-intersection-observer` | 9.x | Scroll detection |

---

## Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

## Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../backend/README.md) - API documentation
- [Extension README](../arxiv-plugin/saral-extension-readme.md) - Chrome extension
