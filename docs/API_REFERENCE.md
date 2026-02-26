# SARAL AI API Reference

Complete API reference for the SARAL AI backend.

## Base URL

```
http://localhost:8000/api
```

Production: `https://saral.democratiseresearch.in/api`

---

## Authentication

### Overview

SARAL AI uses JWT (JSON Web Token) authentication via Google OAuth. Protected endpoints require a valid JWT token in the Authorization header.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Public Endpoints

These endpoints do not require authentication:
- `GET /` - Root info
- `GET /health` - Health check
- `POST /api/auth/google/login` - Google login
- `GET /api/keys/status` - API keys status
- `POST /api/mindmap/generate-mindmap` - Mind map generation

---

## Endpoints

### Authentication

#### POST `/api/auth/google/login`

Authenticate with Google OAuth token.

**Request:**
```json
{
  "token": "google_oauth_token_from_frontend"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "user_google_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

#### GET `/api/auth/me`

Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "user_google_id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://..."
}
```

#### GET `/api/auth/verify`

Verify if current token is valid.

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "user_google_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

### API Keys

#### POST `/api/keys/setup`

Configure API keys for AI services.

**Request:**
```json
{
  "gemini_key": "AIzaSy...",
  "sarvam_key": "optional_sarvam_key",
  "openai_key": "optional_openai_key"
}
```

**Response (200):**
```json
{
  "message": "API keys configured successfully"
}
```

**Errors:**
- `400`: Invalid API key

#### GET `/api/keys/status`

Get status of configured API keys.

**Response (200):**
```json
{
  "gemini_configured": true,
  "sarvam_configured": true,
  "openai_configured": false,
  "huggingface_configured": false
}
```

---

### Papers

#### POST `/api/papers/upload-zip`

Upload LaTeX source as ZIP file.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `file`: ZIP file containing LaTeX source

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "metadata": {
    "title": "Paper Title",
    "authors": "Author Names",
    "date": "2024",
    "arxiv_id": null
  },
  "image_files": ["fig1.png", "fig2.png"],
  "tex_file_path": "temp/papers/.../main.tex",
  "status": "processed"
}
```

#### POST `/api/papers/scrape-arxiv`

Fetch paper from arXiv URL.

**Request:**
```json
{
  "arxiv_url": "https://arxiv.org/abs/2301.12345"
}
```

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "metadata": {
    "title": "Paper Title",
    "authors": "Author Names",
    "date": "2024-01-15",
    "arxiv_id": "2301.12345"
  },
  "image_files": ["fig1.png"],
  "tex_file_path": "temp/papers/.../main.tex",
  "status": "processed"
}
```

#### POST `/api/papers/upload-pdf`

Upload PDF file directly.

**Request:** `multipart/form-data`
- `file`: PDF file

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "metadata": {
    "title": "Extracted Title",
    "authors": "Unknown",
    "date": "2024"
  },
  "image_files": [],
  "tex_file_path": "temp/papers/.../extracted.txt",
  "status": "processed"
}
```

---

### Scripts

#### POST `/api/scripts/{paper_id}/generate`

Generate presentation script from paper.

**Parameters:**
- `paper_id` (path): Paper UUID

**Request:**
```json
{
  "complexity_level": "medium"
}
```

**Complexity Levels:**
- `easy`: Simple language, analogies, no jargon
- `medium`: Balanced, some technical terms explained
- `advanced`: Full technical terminology, expert level

**Response (200):**
```json
{
  "sections_scripts": {
    "Introduction": "Welcome to this presentation...",
    "Methodology": "The researchers used...",
    "Results": "The key findings show...",
    "Conclusion": "In summary..."
  },
  "paper_id": "uuid-string"
}
```

#### GET `/api/scripts/{paper_id}`

Get generated scripts for a paper.

**Response (200):**
```json
{
  "sections": {
    "Introduction": {
      "script": "...",
      "bullet_points": ["Point 1", "Point 2"],
      "assigned_image": "fig1.png"
    }
  },
  "title_intro_script": "Welcome to..."
}
```

#### PUT `/api/scripts/{paper_id}/update`

Update script content.

**Request:**
```json
{
  "sections": {
    "Introduction": {
      "script": "Updated script content...",
      "bullet_points": ["New point 1"]
    }
  }
}
```

---

### Slides

#### POST `/api/slides/{paper_id}/generate`

Generate Beamer slides from scripts.

**Response (200):**
```json
{
  "pdf_path": "/static/slides/paper_id/slides.pdf",
  "image_paths": [
    "/static/slides/paper_id/slide_1.png",
    "/static/slides/paper_id/slide_2.png"
  ],
  "paper_id": "uuid-string"
}
```

#### GET `/api/slides/{paper_id}/pdf`

Download generated PDF.

**Response:** PDF file stream

---

### Media

#### POST `/api/media/{paper_id}/generate-audio`

Generate TTS audio from scripts.

**Request:**
```json
{
  "selected_language": "Hindi",
  "voice_selection": {
    "Hindi": "vidya",
    "English": "arvind"
  },
  "hinglish_iterations": 3,
  "show_hindi_debug": false
}
```

**Available Languages:**
- English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu

**Available Voices:**
- `arvind`, `vidya`, `anushka`, `abhilash`, and more (varies by language)

**Response (200):**
```json
{
  "audio_files": [
    "title_intro.wav",
    "section_Introduction.wav",
    "section_Methodology.wav"
  ],
  "paper_id": "uuid-string"
}
```

#### POST `/api/media/{paper_id}/generate-video`

Create final video from slides and audio.

**Request:**
```json
{
  "background_music_file": null,
  "selected_language": "English"
}
```

**Response (200):**
```json
{
  "audio_files": [],
  "video_path": "/static/videos/paper_id/presentation.mp4",
  "paper_id": "uuid-string"
}
```

#### GET `/api/media/{paper_id}/stream-audio/{filename}`

Stream audio file with range support.

#### GET `/api/media/{paper_id}/download-video`

Download generated video file.

---

### Podcast

#### POST `/api/podcast/{paper_id}/generate-script`

Generate podcast dialogue script.

**Request:**
```json
{
  "num_exchanges": 8,
  "language": "en",
  "complexity_level": "medium"
}
```

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "dialogue": [
    {"speaker": "Host", "text": "Welcome to today's episode..."},
    {"speaker": "Guest", "text": "Thank you for having me..."}
  ],
  "status": "success",
  "message": "Podcast script generated successfully"
}
```

#### POST `/api/podcast/{paper_id}/generate-audio`

Generate podcast audio from dialogue.

**Request:**
```json
{
  "voice_host": "anushka",
  "voice_guest": "abhilash"
}
```

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "audio_files": [
    {"speaker": "Host", "file": "host_1.wav"},
    {"speaker": "Guest", "file": "guest_1.wav"}
  ],
  "status": "success"
}
```

---

### Mind Map

#### POST `/api/mindmap/generate-mindmap`

Generate mind map from arXiv paper.

**Request:**
```json
{
  "arxiv_url": "https://arxiv.org/abs/2301.12345",
  "complexity_level": "medium"
}
```

**Response (200):**
```json
{
  "status": "success",
  "title": "Paper Title",
  "mermaid_diagram": "mindmap\n  root((Main Topic))\n    Branch 1\n      Leaf 1.1\n      Leaf 1.2\n    Branch 2\n      Leaf 2.1",
  "metadata": {
    "arxiv_id": "2301.12345",
    "authors": ["Author 1", "Author 2"],
    "published": "2024-01-15",
    "categories": ["cs.AI", "cs.LG"],
    "processing_time_seconds": 5.2,
    "node_count": 24
  },
  "analysis_summary": "This paper presents a novel approach..."
}
```

#### POST `/api/mindmap/generate-mindmap-pdf`

Generate mind map from uploaded PDF.

**Request:** `multipart/form-data`
- `file`: PDF file
- `complexity_level`: Optional, default "medium"

#### POST `/api/mindmap/validate-url`

Validate arXiv URL format.

**Request:**
```json
{
  "arxiv_url": "https://arxiv.org/abs/2301.12345"
}
```

**Response (200):**
```json
{
  "status": "valid",
  "arxiv_id": "2301.12345",
  "message": "Valid arXiv URL"
}
```

---

### Visual Storytelling

#### POST `/api/visual-storytelling/{paper_id}/generate-storytelling-script`

Generate visual story script with scene descriptions.

**Request:**
```json
{
  "complexity_level": "medium",
  "video_duration": 180,
  "style": "educational",
  "image_provider": "placeholder",
  "voice_selection": {"English": "arvind"}
}
```

**Styles:**
- `educational`: Clear explanations with diagrams
- `dramatic`: Engaging narrative style
- `documentary`: Factual presentation
- `minimalist`: Simple and clean

**Image Providers:**
- `placeholder`: Use placeholder images
- `huggingface`: Generate with Hugging Face models

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "status": "success",
  "message": "Script generated successfully",
  "script_data": {
    "title": "Paper Title",
    "scenes": [
      {
        "scene_number": 1,
        "narration": "In this scene...",
        "image_prompt": "A diagram showing...",
        "duration": 15
      }
    ]
  },
  "image_count": 12
}
```

#### POST `/api/visual-storytelling/{paper_id}/generate-images`

Generate AI images for scenes.

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "status": "success",
  "images": [
    {"scene": 1, "path": "/static/images/scene_1.png"}
  ]
}
```

#### POST `/api/visual-storytelling/{paper_id}/generate-video`

Create final visual storytelling video.

**Response (200):**
```json
{
  "paper_id": "uuid-string",
  "status": "success",
  "video_path": "/static/visual_storytelling/paper_id/video.mp4"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message description",
  "status_code": 400,
  "path": "/api/endpoint"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid request body |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

---

## Rate Limiting

API rate limits depend on the underlying AI services:
- **Gemini API**: 200 requests/day (free tier)
- **Sarvam AI**: Based on subscription plan

The backend implements automatic key rotation when quota is exceeded.

---

## WebSocket Events (Future)

Coming soon for real-time progress updates.

---

## SDKs & Libraries

### JavaScript/TypeScript

```javascript
import api from './services/api';

// Example: Generate script
const result = await api.post(`/scripts/${paperId}/generate`, {
  complexity_level: 'medium'
});
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:8000/api/scripts/{paper_id}/generate',
    json={'complexity_level': 'medium'},
    headers={'Authorization': f'Bearer {token}'}
)
```

---

## Related Documentation

- [Main README](../README.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
