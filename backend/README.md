# SARAL AI Backend

FastAPI backend for converting academic research papers into educational videos, podcasts, mind maps, and visual stories.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Services](#services)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## Overview

The SARAL AI backend provides a comprehensive REST API for:
- **Paper Processing** - Upload PDFs, LaTeX ZIP files, or fetch from arXiv
- **Script Generation** - AI-powered presentation script creation
- **Slide Generation** - Beamer/LaTeX slide compilation
- **Audio Generation** - Multi-language text-to-speech
- **Video Generation** - Final video assembly with slides and audio
- **Podcast Generation** - Two-voice dialogue creation
- **Mind Map Generation** - Hierarchical concept extraction
- **Visual Storytelling** - Cinematic scene-based narratives

---

## Prerequisites

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|-------------|
| **Python** | 3.11+ | Runtime | [python.org](https://python.org) |
| **LaTeX** | MiKTeX/TeX Live | Slide compilation | [miktex.org](https://miktex.org) |
| **Poppler** | Latest | PDF to image | [GitHub](https://github.com/oschwartz10612/poppler-windows/releases/) |
| **FFmpeg** | Latest | Media processing | [ffmpeg.org](https://ffmpeg.org) |

### Required API Keys

| API | Required | Free Tier | Get Key |
|-----|----------|-----------|---------|
| **Google Gemini** | ✅ Yes | 200 req/day | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Sarvam AI** | Optional | Limited | [sarvam.ai](https://www.sarvam.ai/) |
| **Hugging Face** | Optional | Free | [huggingface.co](https://huggingface.co/settings/tokens) |

---

## Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows CMD:
.venv\Scripts\activate.bat
# macOS/Linux:
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

---

## Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Required - Google Gemini API (supports key rotation)
GEMINI_API_KEY_1=AIzaSy...           # Primary key
GEMINI_API_KEY_2=AIzaSy...           # Rotation key (optional)
GEMINI_API_KEY_3=AIzaSy...           # Additional keys (optional)

# Optional - Text-to-Speech (for Hindi and regional languages)
SARVAM_API_KEY=your_sarvam_api_key

# Optional - AI Image Generation
HUGGINGFACE_API_KEY=hf_your_token

# Optional - Google OAuth Authentication
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret_key

# Optional - Windows-specific paths (if not in system PATH)
POPPLER_PATH=C:/path/to/poppler/bin
```

### API Key Rotation

The backend automatically rotates through multiple Gemini API keys when quota limits are hit:
- Add keys as `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.
- System automatically switches to next key on 429 errors
- Status logged to console

---

## Running the Server

### Development Mode

```bash
# Activate virtual environment first
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Start with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Access Points

| Endpoint | URL | Description |
|----------|-----|-------------|
| **API Root** | http://localhost:8000 | Server info |
| **Health Check** | http://localhost:8000/health | Server status |
| **Swagger UI** | http://localhost:8000/docs | Interactive API docs |
| **ReDoc** | http://localhost:8000/redoc | Alternative docs |
| **Static Files** | http://localhost:8000/static | Generated content |

---

## API Reference

### Authentication

Most endpoints require JWT authentication via Google OAuth.

```http
Authorization: Bearer <jwt_token>
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google/login` | Authenticate with Google token |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Logout (client discards token) |
| GET | `/api/auth/verify` | Verify token validity |

---

### API Keys Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/keys/setup` | Configure API keys |
| GET | `/api/keys/status` | Check configured keys status |

**Request Body (POST /api/keys/setup):**
```json
{
  "gemini_key": "AIzaSy...",
  "sarvam_key": "your_sarvam_key",
  "openai_key": "sk-..." 
}
```

---

### Paper Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/papers/upload-zip` | Upload LaTeX source ZIP |
| POST | `/api/papers/scrape-arxiv` | Fetch from arXiv URL |
| POST | `/api/papers/upload-pdf` | Upload PDF file |
| GET | `/api/papers/{paper_id}` | Get paper metadata |
| GET | `/api/papers/{paper_id}/download` | Download original file |

**Request Body (POST /api/papers/scrape-arxiv):**
```json
{
  "arxiv_url": "https://arxiv.org/abs/2301.12345"
}
```

**Response:**
```json
{
  "paper_id": "uuid-string",
  "metadata": {
    "title": "Paper Title",
    "authors": "Author Names",
    "date": "2024",
    "arxiv_id": "2301.12345"
  },
  "image_files": ["fig1.png", "fig2.png"],
  "tex_file_path": "temp/papers/.../main.tex",
  "status": "processed"
}
```

---

### Script Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scripts/{paper_id}/generate` | Generate presentation script |
| GET | `/api/scripts/{paper_id}` | Get generated scripts |
| PUT | `/api/scripts/{paper_id}/update` | Update script content |
| POST | `/api/scripts/{paper_id}/assign-images` | Assign images to sections |

**Request Body (POST /api/scripts/{paper_id}/generate):**
```json
{
  "complexity_level": "medium"  // "easy", "medium", "advanced"
}
```

---

### Slide Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/slides/{paper_id}/generate` | Generate Beamer slides |
| GET | `/api/slides/{paper_id}/pdf` | Download PDF |
| GET | `/api/slides/{paper_id}/images` | Get slide images |

---

### Media Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/media/{paper_id}/generate-audio` | Generate TTS audio |
| POST | `/api/media/{paper_id}/generate-video` | Create final video |
| GET | `/api/media/{paper_id}/stream-audio/{filename}` | Stream audio file |
| GET | `/api/media/{paper_id}/download-video` | Download video |

**Request Body (POST /api/media/{paper_id}/generate-audio):**
```json
{
  "selected_language": "Hindi",
  "voice_selection": {
    "Hindi": "vidya",
    "English": "arvind"
  },
  "hinglish_iterations": 3
}
```

**Supported Languages:**
- English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu

---

### Podcast Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/podcast/{paper_id}/generate-script` | Generate dialogue |
| POST | `/api/podcast/{paper_id}/generate-audio` | Create podcast audio |
| GET | `/api/podcast/{paper_id}/download` | Download podcast |

**Request Body (POST /api/podcast/{paper_id}/generate-script):**
```json
{
  "num_exchanges": 8,
  "language": "en",
  "complexity_level": "medium"
}
```

---

### Mind Map Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mindmap/generate-mindmap` | Generate from arXiv URL |
| POST | `/api/mindmap/generate-mindmap-pdf` | Generate from PDF upload |
| POST | `/api/mindmap/validate-url` | Validate arXiv URL |
| GET | `/api/mindmap/health` | Service health check |

**Request Body (POST /api/mindmap/generate-mindmap):**
```json
{
  "arxiv_url": "https://arxiv.org/abs/2301.12345",
  "complexity_level": "medium"
}
```

**Response:**
```json
{
  "status": "success",
  "title": "Paper Title",
  "mermaid_diagram": "mindmap\n  root((Main Topic))...",
  "metadata": {
    "arxiv_id": "2301.12345",
    "authors": ["Author 1", "Author 2"],
    "published": "2024-01-15",
    "categories": ["cs.AI", "cs.LG"],
    "processing_time_seconds": 5.2,
    "node_count": 24
  },
  "analysis_summary": "This paper presents..."
}
```

---

### Visual Storytelling

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/visual-storytelling/{paper_id}/generate-storytelling-script` | Generate scene script |
| POST | `/api/visual-storytelling/{paper_id}/generate-images` | Create AI images |
| POST | `/api/visual-storytelling/{paper_id}/generate-video` | Produce final video |
| GET | `/api/visual-storytelling/{paper_id}/download` | Download video |

**Request Body (POST /api/visual-storytelling/{paper_id}/generate-storytelling-script):**
```json
{
  "complexity_level": "medium",
  "video_duration": 180,
  "style": "educational",
  "image_provider": "placeholder",
  "voice_selection": {"English": "arvind"}
}
```

---

## Services

### Core Services

| Service | File | Description |
|---------|------|-------------|
| `script_generator` | `script_generator.py` | AI script generation with Gemini |
| `beamer_generator` | `beamer_generator.py` | LaTeX/Beamer slide creation |
| `tts_service` | `tts_service.py` | Text-to-speech with Sarvam AI |
| `video_service` | `video_service.py` | Video assembly with MoviePy |
| `podcast_generator` | `podcast_generator.py` | Dialogue script generation |

### Paper Processing

| Service | File | Description |
|---------|------|-------------|
| `arxiv_scraper` | `arxiv_scraper.py` | arXiv source download |
| `arxiv_fetcher` | `arxiv_fetcher.py` | arXiv metadata fetch |
| `pdf_processor` | `pdf_processor.py` | PDF text extraction |
| `latex_processor` | `latex_processor.py` | LaTeX file parsing |

### Specialized Services

| Service | File | Description |
|---------|------|-------------|
| `gemini_mindmap_processor` | `gemini_mindmap_processor.py` | Mind map concept extraction |
| `mermaid_generator` | `mermaid_generator.py` | Mermaid diagram generation |
| `visual_storytelling_service` | `visual_storytelling_service.py` | Scene narrative generation |
| `ai_image_generator` | `ai_image_generator.py` | Hugging Face image generation |
| `cinematic_video_service` | `cinematic_video_service.py` | Visual story video assembly |

### Language Services

| Service | File | Description |
|---------|------|-------------|
| `sarvam_sdk` | `sarvam_sdk.py` | Sarvam TTS SDK wrapper |
| `hindi_service` | `hindi_service.py` | Hindi translation |
| `language_service` | `language_service.py` | Multi-language translation |
| `bhashini_service` | `bhashini_service.py` | Bhashini API integration |

### Utilities

| Service | File | Description |
|---------|------|-------------|
| `storage_manager` | `storage_manager.py` | Persistent file storage |
| `session_manager` | `session_manager.py` | User session handling |
| `auth_service` | `auth_service.py` | JWT/OAuth authentication |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry
│   ├── auth/
│   │   ├── dependencies.py     # Auth dependency injection
│   │   ├── decorators.py       # Auth decorators
│   │   └── google_auth.py      # Google OAuth handling
│   ├── dependencies/
│   │   └── session.py          # Session dependencies
│   ├── models/
│   │   └── request_models.py   # Pydantic models
│   ├── routes/
│   │   ├── api_keys.py         # API key management
│   │   ├── auth.py             # Authentication
│   │   ├── images.py           # Image generation
│   │   ├── media.py            # Audio/video generation
│   │   ├── mindmap.py          # Mind map generation
│   │   ├── papers.py           # Paper processing
│   │   ├── podcast.py          # Podcast generation
│   │   ├── scripts.py          # Script generation
│   │   ├── slides.py           # Slide generation
│   │   └── visual_storytelling.py
│   ├── services/               # Business logic (see Services section)
│   └── utils/
│       └── latex_to_images.py  # LaTeX utilities
├── latex_template/             # Beamer theme files
├── temp/                       # Generated content (auto-created)
├── .env                        # Environment configuration
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

---

## Development

### Code Style

- **Python:** PEP 8 with type hints
- **Pydantic:** v2 syntax (`model_dump()` instead of `dict()`)
- **Async:** Use `async def` for I/O operations

### Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app
```

### Adding New Endpoints

1. Create route file in `app/routes/`
2. Add Pydantic models to `app/models/request_models.py`
3. Implement service in `app/services/`
4. Register router in `app/main.py`

### Logging

```python
import logging
logger = logging.getLogger(__name__)
logger.info("Processing paper...")
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `ImportError: No module...` | Missing dependency | `pip install -r requirements.txt` |
| `pdflatex not found` | LaTeX not installed/PATH | Install MiKTeX, add to PATH |
| `Poppler not found` | Poppler not installed | Install Poppler, set `POPPLER_PATH` in .env |
| `FFmpeg not found` | FFmpeg not in PATH | Install FFmpeg, add to PATH |
| `429 Too Many Requests` | Gemini quota exceeded | Add more API keys |
| `Audio validation failed` | Corrupted audio file | FFmpeg repairs automatically |
| `CORS error` | Frontend URL not whitelisted | Add URL to CORS origins in `main.py` |

### Debug Mode

```bash
uvicorn app.main:app --reload --log-level debug
```

### Clean Slate

To reset all generated content:

```bash
rm -rf temp/
# Restart server - directories auto-recreate
```

---

## Notes

- **Pydantic v2:** This codebase uses Pydantic v2. Use `model_dump()` instead of `dict()`.
- **Python 3.13:** Includes compatibility fix for removed `cgi` module.
- **Storage:** Generated files stored in `temp/`. Safe to delete for clean slate.
- **Graceful Degradation:** Slide/image endpoints fail gracefully if LaTeX/Poppler unavailable.

---

## Related Documentation

- [Main README](../README.md) - Project overview
- [Frontend README](../frontend/README.md) - React frontend
- [Extension README](../arxiv-plugin/saral-extension-readme.md) - Chrome extension
- [Podcast Backend README](../arxiv-plugin/podcast_backend/README.md) - Standalone podcast server
