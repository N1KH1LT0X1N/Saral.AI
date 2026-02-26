# 🎓 SARAL AI - Research Democratization Platform

**Simplified And Automated Research Amplification and Learning**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)

Transform research papers into educational videos, podcasts, mind maps, and visual stories using AI.

**Quick Links:** [Live Demo](https://saral.democratiseresearch.in) | [Chrome Extension](#-chrome-extension-saralify) | [WhatsApp Bot](#-whatsapp-bot) | [API Reference](docs/API_REFERENCE.md) | [Contributing](CONTRIBUTING.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file - Project overview and setup |
| [Backend README](backend/README.md) | Backend API documentation and setup |
| [Frontend README](frontend/README.md) | React frontend documentation |
| [Extension README](arxiv-plugin/saral-extension-readme.md) | Chrome extension installation |
| [Podcast Backend](arxiv-plugin/podcast_backend/README.md) | Standalone podcast server |
| [API Reference](docs/API_REFERENCE.md) | Complete API endpoint documentation |
| [Contributing Guide](CONTRIBUTING.md) | How to contribute to the project |
| [Security Policy](SECURITY.md) | Security practices and guidelines |
| [Import Fixes](IMPORT_FIX.md) | Common import error solutions |

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Use Cases](#-use-cases)
- [System Requirements](#-system-requirements)
- [Project Structure](#-project-structure)
- [Installation](#️-installation)
- [Configuration](#-configuration)
- [Running the Application](#️-running-the-application)
- [Features Workflow](#-features-workflow)
- [Chrome Extension (SARALify)](#-chrome-extension-saralify)
- [WhatsApp Bot](#-whatsapp-bot)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Development](#️-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)
- [Contact](#-contact)

---

## ✨ Overview

```
Research Paper → AI Processing → 📹 Video | 🎙️ Podcast | 🗺️ Mindmap | 📖 Visual Story
🔌 Chrome Extension: Process papers from any research website!
💬 WhatsApp Bot: 24/7 AI research assistant
```

SARAL AI democratizes research by transforming complex academic papers into accessible multimedia formats. Whether you're a student trying to understand a paper, an educator creating content, or a researcher sharing findings, SARAL AI makes it simple.

**Key Capabilities:**
- 🎥 **Educational Videos** - Auto-generated scripts, professional slides, multi-language narration
- 🎙️ **Podcasts** - Natural two-voice conversations explaining research
- 🗺️ **Mind Maps** - Visual concept hierarchies with Mermaid diagrams
- 📖 **Visual Stories** - Cinematic scene-by-scene narratives with AI imagery
- 🔌 **Browser Extension** - One-click processing from arXiv, bioRxiv, and more
- 💬 **WhatsApp Bot** - Chat-based research Q&A, anywhere, anytime
- 🌐 **Multi-language** - English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, and more

---

## 🚀 Key Features

| Feature | Description | Docs |
|---------|-------------|------|
| **Video Generation** | AI-powered scripts, LaTeX/Beamer slides, multi-language TTS narration | [Backend API](backend/README.md) |
| **Podcast Creation** | Student-teacher dialogue generation with customizable voices | [Backend API](backend/README.md) |
| **Mind Mapping** | Hierarchical concept extraction with Mermaid SVG export | [Backend API](backend/README.md) |
| **Visual Storytelling** | Scene-based narratives with AI-generated imagery | [Backend API](backend/README.md) |
| **Chrome Extension** | One-click video/podcast from arXiv, bioRxiv, medRxiv, chemRxiv | [Extension Docs](arxiv-plugin/saral-extension-readme.md) |
| **WhatsApp Bot** | 24/7 semantic search, Q&A, and paper summaries | [Bot Repo](https://github.com/N1KH1LT0X1N/Research-Paper-Chatbot) |
| **Google OAuth** | Secure authentication with Google accounts | [Backend API](backend/README.md) |
| **Complexity Levels** | Easy/Medium/Advanced content adaptation | Built-in |

---

## 🎯 Use Cases

| User | Use Case |
|------|----------|
| **Students** | Exam prep, quick paper understanding, visual learning aids |
| **Educators** | Lecture content creation, teaching materials, multi-format resources |
| **Researchers** | Conference presentations, research outreach, accessible findings |
| **Institutions** | Content libraries, online courses, research accessibility programs |
| **Mobile Users** | WhatsApp bot for on-the-go research assistance |
| **Browser Users** | Chrome extension for instant paper processing |

---

## 📦 System Requirements

### Backend
- **Python 3.11+** (see [.python-version](backend/.python-version))
- **LaTeX** - pdflatex via MiKTeX (Windows) or TeX Live (Linux/macOS)
- **Poppler** - PDF to image conversion
- **FFmpeg** - Audio/video processing
- **4GB+ RAM** recommended

### Frontend
- **Node.js 16+**
- **npm 8+**
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### API Keys (Required/Optional)

| API | Required | Free Tier | Get Key |
|-----|----------|-----------|---------|
| **Google Gemini** | ✅ Required | 200 req/day | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Sarvam AI** | Optional | Limited | [sarvam.ai](https://www.sarvam.ai/) |
| **Hugging Face** | Optional | Free | [huggingface.co](https://huggingface.co/settings/tokens) |
| **Google OAuth** | Optional | Free | [console.cloud.google.com](https://console.cloud.google.com/) |

---

## 🏗️ Project Structure

```
GGW_Megathon_Saral/
├── README.md                    # This file - Main documentation
├── LICENSE                      # MIT License
├── IMPORT_FIX.md               # Import error fixes reference
│
├── backend/                     # FastAPI backend server
│   ├── README.md               # Backend-specific documentation
│   ├── requirements.txt        # Python dependencies
│   └── app/
│       ├── main.py            # FastAPI application entry
│       ├── auth/              # Authentication (Google OAuth, JWT)
│       │   ├── dependencies.py
│       │   ├── decorators.py
│       │   └── google_auth.py
│       ├── models/            # Pydantic request/response models
│       │   └── request_models.py
│       ├── routes/            # API endpoints
│       │   ├── api_keys.py    # API key management
│       │   ├── auth.py        # Authentication routes
│       │   ├── images.py      # AI image generation
│       │   ├── media.py       # Audio/video generation
│       │   ├── mindmap.py     # Mind map generation
│       │   ├── papers.py      # Paper upload/processing
│       │   ├── podcast.py     # Podcast generation
│       │   ├── scripts.py     # Script generation
│       │   ├── slides.py      # Slide generation
│       │   └── visual_storytelling.py
│       ├── services/          # Business logic
│       │   ├── ai_image_generator.py
│       │   ├── arxiv_fetcher.py
│       │   ├── arxiv_scraper.py
│       │   ├── auth_service.py
│       │   ├── beamer_generator.py
│       │   ├── bhashini_service.py
│       │   ├── cinematic_video_service.py
│       │   ├── gemini_mindmap_processor.py
│       │   ├── hindi_service.py
│       │   ├── language_service.py
│       │   ├── latex_processor.py
│       │   ├── mermaid_generator.py
│       │   ├── pdf_processor.py
│       │   ├── podcast_generator.py
│       │   ├── sarvam_sdk.py
│       │   ├── script_generator.py
│       │   ├── storage_manager.py
│       │   ├── tts_service.py
│       │   ├── video_service.py
│       │   └── visual_storytelling_service.py
│       └── utils/
│           └── latex_to_images.py
│
├── frontend/                    # React frontend application
│   ├── README.md               # Frontend documentation (Create React App)
│   ├── package.json            # Node.js dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── public/                 # Static assets
│   └── src/
│       ├── App.js             # Main React component
│       ├── index.js           # Entry point
│       ├── components/        # Reusable UI components
│       │   ├── auth/          # Authentication components
│       │   ├── common/        # Shared components
│       │   ├── forms/         # Form components
│       │   ├── navigation/    # Navigation components
│       │   ├── ui/            # UI primitives
│       │   └── workflow/      # Workflow step components
│       ├── contexts/          # React context providers
│       │   ├── ApiContext.jsx
│       │   ├── AuthContext.jsx
│       │   ├── ComplexityContext.jsx
│       │   ├── ThemeContext.jsx
│       │   └── WorkflowContext.jsx
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Page components
│       │   ├── LandingPage.jsx
│       │   ├── ApiSetup.jsx
│       │   ├── PaperProcessing.jsx
│       │   ├── ScriptGeneration.jsx
│       │   ├── SlideCreation.jsx
│       │   ├── MediaGeneration.jsx
│       │   ├── PodcastGeneration.jsx
│       │   ├── MindmapGeneration.jsx
│       │   ├── VisualStorytellingPage.jsx
│       │   └── Results.jsx
│       ├── services/          # API client
│       │   └── api.js
│       └── styles/            # CSS styles
│
├── arxiv-plugin/               # Chrome Extension (SARALify)
│   ├── manifest.json          # Extension manifest (MV3)
│   ├── content_script.js      # Page injection scripts
│   ├── service_worker.js      # Background service worker
│   ├── styles.css             # Extension styles
│   ├── saral-extension-readme.md  # Extension documentation
│   └── podcast_backend/       # Standalone podcast server
│       ├── README.md          # Podcast backend docs
│       ├── server.py          # Flask podcast server
│       ├── requirements.txt   # Python dependencies
│       └── env_example.txt    # Environment template
│
└── poppler_temp/              # Poppler binaries (Windows)
```

**Related Repository:**
- [Research-Paper-Chatbot](https://github.com/N1KH1LT0X1N/Research-Paper-Chatbot) - WhatsApp bot companion

---

## ⚙️ Installation

### Prerequisites

**Windows:**
1. [Python 3.11+](https://python.org) - Add to PATH during install
2. [Node.js 16+](https://nodejs.org) - LTS version recommended
3. [MiKTeX](https://miktex.org) - LaTeX distribution with pdflatex
4. [Poppler](https://github.com/oschwartz10612/poppler-windows/releases/) - Add `bin` folder to PATH
5. [FFmpeg](https://ffmpeg.org/download.html) - Add to PATH

**macOS:**
```bash
brew install python@3.11 node poppler ffmpeg
brew install --cask mactex
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv nodejs npm poppler-utils ffmpeg texlive-full
```

### Setup

```bash
# 1. Clone repository
git clone https://github.com/N1KH1LT0X1N/GGW_Megathon_Saral.git
cd GGW_Megathon_Saral

# 2. Backend setup
cd backend
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows CMD:
.venv\Scripts\activate.bat
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3. Frontend setup
cd ../frontend
npm install
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Required - Google Gemini AI
GEMINI_API_KEY_1=AIzaSy...        # Primary key
GEMINI_API_KEY_2=AIzaSy...        # Optional: rotation key
GEMINI_API_KEY_3=AIzaSy...        # Optional: additional keys

# Optional - Text-to-Speech (Hindi and regional languages)
SARVAM_API_KEY=your_sarvam_key    # Get from https://www.sarvam.ai/

# Optional - AI Image Generation
HUGGINGFACE_API_KEY=hf_...        # Get from https://huggingface.co/settings/tokens

# Optional - Google OAuth (for user authentication)
GOOGLE_CLIENT_ID=your_client_id   # Get from Google Cloud Console

# Optional - Windows-specific paths
POPPLER_PATH=C:/path/to/poppler/bin  # If not in PATH
```

### Frontend Environment Variables

Create `.env` file in `frontend/` directory:

```bash
# Backend API URL (for production deployment)
REACT_APP_API_URL=http://localhost:8000

# Google OAuth Client ID (must match backend)
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

### API Key Rotation

Add multiple Gemini keys (`GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.) for automatic rotation when quota limits are hit. The system will cycle through available keys automatically.

### Web UI Setup

Alternatively, configure API keys through the web interface at `/api-setup` after launching the application.

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Access Points:**
| Service | URL |
|---------|-----|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| Swagger Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| ReDoc | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

### Production Deployment

See [Backend README](backend/README.md) for production deployment instructions.

---

## 📚 Features Workflow

### 1. Video Generation
```
Upload Paper → Generate Script → Edit Content → Assign Images → Generate Audio → Create Video
```
- Supports PDF and arXiv URL input
- AI-powered script generation with complexity levels (Easy/Medium/Advanced)
- Multi-language narration (English, Hindi, and 9+ regional languages)
- Professional Beamer/LaTeX slides

### 2. Podcast Creation
```
Upload Paper → Generate Dialogue → Customize Voices → Create Audio
```
- Natural student-teacher conversation format
- Complexity-adapted explanations
- Multiple voice options per language

### 3. Mind Mapping
```
Enter arXiv URL → AI Extracts Concepts → Generate Mermaid Diagram → Download SVG
```
- Hierarchical concept visualization
- Interactive Mermaid.js diagrams
- SVG export for presentations

### 4. Visual Storytelling
```
Upload Paper → Generate Scenes → Create AI Images → Add Narration → Produce Video
```
- Cinematic scene-by-scene narratives
- AI-generated imagery (Hugging Face/Placeholder)
- Text overlays and transitions

---

## 🔌 Chrome Extension (SARALify)

The SARALify browser extension enables one-click processing of research papers directly from supported websites.

### Supported Sites
- **arXiv.org** - Physics, Math, CS, and more
- **bioRxiv.org** - Biology preprints
- **medRxiv.org** - Medical preprints
- **chemRxiv.org** - Chemistry preprints
- **eartharXiv.org** - Earth sciences
- **OSF Preprints** - Social sciences
- **Preprints.org** - Multidisciplinary

### Installation

**From Source (Developer Mode):**
1. Open `chrome://extensions/` in Chrome/Edge
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `arxiv-plugin` folder

See [Extension README](arxiv-plugin/saral-extension-readme.md) for detailed instructions.

### Usage
1. Navigate to any supported paper page (e.g., `arxiv.org/abs/2301.12345`)
2. Click the **SARALify** button that appears on the page
3. Choose format: **Video** or **Podcast**
4. Select language: **English** or **Hindi**
5. Wait for processing, then download your content

### Extension Backend

The extension can use either:
- **Main Backend** - Full SARAL AI backend at `localhost:8000`
- **Podcast Backend** - Lightweight Flask server in `arxiv-plugin/podcast_backend/`

See [Podcast Backend README](arxiv-plugin/podcast_backend/README.md) for standalone podcast generation.

---

## 💬 WhatsApp Bot

Your 24/7 AI research assistant for semantic search, Q&A, and summarization.

### Quick Start

**Join the Bot:** [WhatsApp Link](https://wa.me/14155238886?text=join%20pocket-afternoon)  
**Repository:** [Research-Paper-Chatbot](https://github.com/N1KH1LT0X1N/Research-Paper-Chatbot)  
**Live Demo:** [https://research-paper-chatbot-2.onrender.com](https://research-paper-chatbot-2.onrender.com/)

### Features

| Command | Description |
|---------|-------------|
| `transformer attention` | Semantic search for papers |
| `select 1` | Select a paper from results |
| `ready for Q&A` | Start Q&A session |
| `Explain transformers` | Get topic explanations |
| `Activities machine learning` | Generate educational activities |

### Integration with SARAL AI

| Platform | Best For |
|----------|----------|
| **Web App** | Comprehensive content generation (videos, podcasts, mindmaps) |
| **WhatsApp Bot** | Quick research queries, paper discovery, mobile access |
| **Chrome Extension** | Instant processing while browsing research sites |

### Self-Hosting

```bash
# Clone bot repository
git clone https://github.com/N1KH1LT0X1N/Research-Paper-Chatbot.git
cd Research-Paper-Chatbot

# Install dependencies
pip install -r requirements.txt

# Configure environment (.env)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
GEMINI_API_KEY=your_key

# Run the bot
python research_bot.py

# Expose webhook (use ngrok or similar)
ngrok http 5000
```

Configure Twilio WhatsApp sandbox webhook: `https://your-ngrok-url.ngrok.io/whatsapp`

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
Most endpoints require JWT authentication via Google OAuth. Include token in header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/google/login` | POST | Authenticate with Google |
| `/keys/setup` | POST | Configure API keys |
| `/keys/status` | GET | Check API key status |
| `/papers/upload-zip` | POST | Upload LaTeX ZIP |
| `/papers/scrape-arxiv` | POST | Fetch from arXiv URL |
| `/papers/upload-pdf` | POST | Upload PDF file |
| `/scripts/{paper_id}/generate` | POST | Generate presentation script |
| `/slides/{paper_id}/generate` | POST | Generate Beamer slides |
| `/media/{paper_id}/generate-audio` | POST | Generate TTS audio |
| `/media/{paper_id}/generate-video` | POST | Create final video |
| `/podcast/{paper_id}/generate-script` | POST | Generate podcast dialogue |
| `/podcast/{paper_id}/generate-audio` | POST | Create podcast audio |
| `/mindmap/generate-mindmap` | POST | Generate mind map from arXiv |
| `/visual-storytelling/{paper_id}/generate-storytelling-script` | POST | Generate visual story script |
| `/visual-storytelling/{paper_id}/generate-video` | POST | Create visual story video |

### Interactive Documentation
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

For detailed API documentation, see [Backend README](backend/README.md).

---

## 🔍 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **ImportError** | Activate venv, run `pip install -r requirements.txt` |
| **PDF/LaTeX errors** | Install poppler and MiKTeX/TeX Live, add to PATH |
| **FFmpeg not found** | Install FFmpeg, add to PATH |
| **API key invalid** | Check `.env` format: `KEY=value` (no quotes) |
| **Gemini quota exceeded** | Add multiple keys: `GEMINI_API_KEY_1`, `_2`, etc. |
| **Port in use** | Kill process or change port |
| **npm install fails** | Delete `node_modules` and `package-lock.json`, reinstall |
| **No audio in video** | Verify Sarvam API key is valid |
| **Extension not working** | Reload from `chrome://extensions/` |
| **WhatsApp bot not responding** | Check Twilio webhook and API keys |
| **CORS errors** | Ensure frontend URL is in backend CORS origins |

### Debug Mode

**Backend:**
```bash
uvicorn app.main:app --reload --log-level debug
```

**Frontend:**
```bash
REACT_APP_DEBUG=true npm start
```

### Getting Help
- **GitHub Issues:** [Report Bugs](https://github.com/N1KH1LT0X1N/GGW_Megathon_Saral/issues)
- **Email:** democratise.research@gmail.com
- **WhatsApp Bot:** [Join](https://wa.me/14155238886?text=join%20pocket-afternoon)

---

## 🛠️ Development

### Tech Stack

**Backend:**
- FastAPI 0.115+ - Modern async Python web framework
- Google Gemini API - AI content generation
- Sarvam AI SDK - Indian language TTS
- MoviePy + FFmpeg - Video processing
- PyMuPDF - PDF processing
- Pydantic v2 - Data validation

**Frontend:**
- React 18.x - UI framework
- Tailwind CSS - Styling
- Framer Motion - Animations
- React Router - Navigation
- Axios - HTTP client
- Mermaid.js - Diagram rendering

**Extension:**
- Chrome Extension Manifest V3
- Service Worker architecture
- Content Scripts for page integration

### Code Style
- **Python:** PEP 8, type hints
- **JavaScript:** ESLint, Prettier
- **Commits:** Conventional Commits format

### Testing
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines
- **Bug Reports:** Include description, steps to reproduce, error logs
- **Feature Requests:** Describe use case and benefits
- **Code Changes:** Follow existing code style, add tests
- **Documentation:** Keep docs updated with changes

---

## 📄 License

MIT License © 2025 SARAL AI Team

See [LICENSE](LICENSE) for full text.

---

## 🙏 Acknowledgements

**AI & APIs:**
- [Google Gemini](https://ai.google.dev/) - AI content generation
- [Sarvam AI](https://sarvam.ai/) - Indian language TTS
- [Hugging Face](https://huggingface.co/) - AI image generation

**Frameworks & Libraries:**
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [MoviePy](https://zulko.github.io/moviepy/) - Video editing
- [Mermaid.js](https://mermaid.js.org/) - Diagram generation

**Tools:**
- [arXiv](https://arxiv.org/) - Research paper repository
- [LaTeX](https://www.latex-project.org/) - Document preparation
- [FFmpeg](https://ffmpeg.org/) - Media processing
- [Poppler](https://poppler.freedesktop.org/) - PDF utilities

---

## 📞 Contact

| Channel | Link |
|---------|------|
| **Email** | democratise.research@gmail.com |
| **WhatsApp Bot** | [Join Bot](https://wa.me/14155238886?text=join%20pocket-afternoon) |
| **GitHub Issues** | [Report Bugs](https://github.com/N1KH1LT0X1N/GGW_Megathon_Saral/issues) |
| **Bot Repository** | [Research-Paper-Chatbot](https://github.com/N1KH1LT0X1N/Research-Paper-Chatbot) |

---

<div align="center">

⭐ **Star this repository if you found it helpful!**

Made with ❤️ by the **GitGoneWild Team**

**Making Research Accessible to Everyone**

</div>
