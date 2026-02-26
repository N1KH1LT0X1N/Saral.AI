# Podcast Backend for SARALify Extension

Lightweight Flask backend for generating podcast audio from research papers. This is a standalone server that can be used independently of the main SARAL AI backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Supported Sources](#supported-sources)
- [How It Works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## Overview

This backend provides a simple API for the SARALify Chrome extension to generate podcast-style audio discussions from research papers. It:

1. Downloads and extracts text from papers
2. Generates structured summaries using Google Gemini AI
3. Converts summaries into two-voice dialogue
4. Produces audio using Sarvam AI text-to-speech
5. Returns the audio as base64-encoded WAV

---

## Features

| Feature | Description |
|---------|-------------|
| **PDF Extraction** | Direct text extraction from arXiv and other sources |
| **AI Summarization** | Structured summaries with Gemini AI |
| **Dialogue Generation** | Natural conversation between Host and Guest |
| **Multi-Voice TTS** | Different voices for each speaker |
| **Multi-Language** | English and Hindi support |
| **Self-Contained** | No external dependencies beyond API keys |

---

## Installation

```bash
# Navigate to podcast backend directory
cd arxiv-plugin/podcast_backend

# Create virtual environment (recommended)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Configuration

### Environment Variables

Create a `.env` file in the `podcast_backend` directory:

```bash
# Copy template
cp env_example.txt .env

# Edit .env file
```

### Required API Keys

```bash
# Google Gemini AI (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Sarvam AI Text-to-Speech (Required)
SARVAM_API_KEY=your_sarvam_api_key_here

# Server port (Optional, default: 5000)
PORT=5000
```

### Getting API Keys

**Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy to `.env` file

**Sarvam AI API Key:**
1. Go to [Sarvam AI](https://sarvam.ai/)
2. Sign up and get your API subscription key
3. Copy to `.env` file

---

## Running the Server

### Development Mode

```bash
python server.py
```

Server starts at `http://localhost:5000`

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "gemini": "configured",
  "sarvam": "configured"
}
```

---

## API Reference

### POST `/generate-podcast`

Generate a podcast from a research paper.

**Request:**
```json
{
  "paper_url": "https://arxiv.org/abs/2301.12345",
  "language": "english"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paper_url` | string | Yes | URL to the paper (arXiv, bioRxiv, etc.) |
| `language` | string | No | `"english"` (default) or `"hindi"` |

**Response:**
```json
{
  "success": true,
  "audio_base64": "base64_encoded_wav_data",
  "title": "Paper Title",
  "summary": "Generated summary...",
  "dialogue": "Host: Welcome! Today we're discussing..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message description"
}
```

### GET `/health`

Check server status and API configuration.

**Response:**
```json
{
  "status": "healthy",
  "gemini": "configured",
  "sarvam": "configured"
}
```

---

## Supported Sources

| Source | URL Pattern | Status |
|--------|-------------|--------|
| arXiv.org | `arxiv.org/abs/*` | ✅ Supported |
| bioRxiv.org | `biorxiv.org/content/*` | ✅ Supported |
| medRxiv.org | `medrxiv.org/content/*` | ✅ Supported |
| chemRxiv.org | `chemrxiv.org/*` | ✅ Supported |
| EarthArXiv.org | `eartharxiv.org/*` | ✅ Supported |
| SocArXiv (OSF) | `osf.io/preprints/socarxiv/*` | ✅ Supported |
| Preprints.org | `preprints.org/*` | ✅ Supported |

---

## How It Works

### Processing Pipeline

```
1. PDF Extraction
   └── Downloads PDF from arXiv API
   └── Extracts text using direct parsing

2. AI Summarization (Gemini)
   └── Creates structured summary:
       - Introduction
       - Methodology
       - Results
       - Conclusion

3. Dialogue Generation (Gemini)
   └── Converts summary to conversation:
       - Host: Questions and transitions
       - Guest: Expert explanations

4. Text-to-Speech (Sarvam AI)
   └── Host voice: Anushka (Female)
   └── Guest voice: Abhilash (Male)

5. Audio Processing
   └── Combines audio segments
   └── Returns as WAV (base64)
```

### Voice Mapping

| Speaker | English Voice | Hindi Voice |
|---------|--------------|-------------|
| Host | Anushka (Female) | Anushka |
| Guest | Abhilash (Male) | Abhilash |

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "GEMINI_API_KEY not configured" | Missing `.env` file or key | Create `.env` with valid key |
| "SARVAM_API_KEY not configured" | Missing Sarvam key | Add key to `.env` |
| "Failed to download PDF" | Invalid URL or network issue | Check URL format and internet |
| "Error with text-to-speech" | Invalid Sarvam key or no credits | Verify key and check balance |
| "Model not found" | Gemini model unavailable | Server auto-falls back to available model |

### Debug Mode

The server runs with debug logging enabled by default. Check console output for detailed error messages.

### Testing Gemini

```bash
python test_gemini.py
```

---

## Development

### Code Structure

```
podcast_backend/
├── server.py           # Main Flask application
├── test_gemini.py      # Gemini API test script
├── requirements.txt    # Python dependencies
├── env_example.txt     # Environment template
└── README.md           # This file
```

### Dependencies

```
flask
flask-cors
PyPDF2
requests
google-generativeai
python-dotenv
```

### Adding New Paper Sources

1. Add URL pattern extraction in `extract_arxiv_id()`:

```python
patterns = [
    r'arxiv\.org/abs/([^/\?#]+)',
    r'newsite\.org/paper/([^/\?#]+)',  # Add new pattern
]
```

2. Add PDF fetch logic in `fetch_paper_content()` if needed.

### Production Deployment

For production, modify `server.py`:

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False)
```

Or use a production WSGI server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 server:app
```

---

## Related Documentation

- [Main README](../../README.md) - Project overview
- [Extension README](../saral-extension-readme.md) - Chrome extension
- [Backend README](../../backend/README.md) - Main SARAL AI backend
