# Security Policy

This document outlines security practices, known considerations, and guidelines for the SARAL AI project.

## 🔒 Security Best Practices

### Environment Variables

**NEVER commit real API keys or secrets to the repository.**

All secrets should be stored in `.env` files which are gitignored. Use the provided `.env.example` files as templates:

- `backend/.env.example` → Copy to `backend/.env`
- `arxiv-plugin/.env.example` → Copy to `arxiv-plugin/.env`
- `arxiv-plugin/podcast_backend/.env.example` → Copy to `arxiv-plugin/podcast_backend/.env`

### Required Secrets

| Variable | Purpose | How to Get |
|----------|---------|------------|
| `JWT_SECRET` | JWT token signing | Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GEMINI_API_KEY` | Google Gemini AI | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `SARVAM_API_KEY` | Sarvam TTS | [Sarvam AI](https://sarvam.ai/) |

### JWT Secret Requirements

The `JWT_SECRET` must be:
- At least 32 characters long
- Randomly generated (use the command above)
- Unique per environment (dev/staging/prod)
- Rotated periodically

If `JWT_SECRET` is not set, the application will:
1. Log a security warning
2. Generate a temporary random secret (not persisted)
3. **All tokens will be invalidated on restart**

## 🛡️ Security Features

### Authentication
- Google OAuth 2.0 for user authentication
- JWT tokens with 24-hour expiry
- Token type verification to prevent token confusion attacks

### CORS Configuration
- **Backend**: Restricts origins to known frontend URLs
- **Podcast Backend**: Restricts to Chrome extensions and localhost

### Input Validation
- Pydantic models validate all API inputs
- File type validation for uploads (PDF, LaTeX only)
- URL pattern validation for arXiv/bioRxiv links

### Subprocess Security
- All subprocess calls use list arguments (no shell injection)
- No `shell=True` in subprocess calls
- File paths are validated before use

## ⚠️ Known Security Considerations

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| JWT Secret | Auto-generated (insecure) | Must be set via env var |
| CORS | Allows localhost | Restrict to production URLs |
| Debug Logging | Enabled | Should be disabled |
| HTTPS | Not required | Required |

### Rate Limiting

The current implementation does **not** include rate limiting. For production deployment, add:

```python
# Example: Using slowapi for FastAPI
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/endpoint")
@limiter.limit("10/minute")
async def endpoint():
    ...
```

### File Upload Security

Current safeguards:
- File type validation by extension and MIME type
- Maximum file size limits (configured per endpoint)

Recommended additions for production:
- Virus scanning
- Content-based file type detection (magic bytes)
- Sandboxed file processing

## 🔐 Reporting Vulnerabilities

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email the maintainers directly
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 48 hours and provide a fix within 7 days for critical issues.

## 📋 Security Checklist for Production

Before deploying to production, ensure:

- [ ] `JWT_SECRET` is set to a strong random value
- [ ] `GOOGLE_CLIENT_ID` is configured for your domain
- [ ] All API keys are production keys (not development)
- [ ] CORS origins are restricted to your production URLs
- [ ] Debug logging is disabled
- [ ] HTTPS is enforced
- [ ] Rate limiting is implemented
- [ ] File upload size limits are appropriate
- [ ] Error messages don't leak sensitive info
- [ ] `.env` files are NOT in version control

## 🔄 Secret Rotation

Rotate secrets periodically:

| Secret | Rotation Frequency |
|--------|-------------------|
| JWT_SECRET | Every 90 days or after team changes |
| API Keys | Every 90 days or if compromised |
| OAuth Credentials | Annually or if compromised |

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Google OAuth Best Practices](https://developers.google.com/identity/protocols/oauth2)
