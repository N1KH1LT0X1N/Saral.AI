# Common Import Fixes & Troubleshooting

This document tracks import errors and their fixes encountered during development.

## 📋 Table of Contents

- [Fixed Issues](#fixed-issues)
- [Common Import Errors](#common-import-errors)
- [Python Version Compatibility](#python-version-compatibility)

---

## Fixed Issues

### SarvamTTS Import Error

**Issue:**
```
ImportError: cannot import name 'SarvamTTSClient' from 'app.services.sarvam_sdk'
```

**Cause:**
Wrong class name used in import. The actual class in `sarvam_sdk.py` is `SarvamTTS`, not `SarvamTTSClient`.

**Fix Applied:**
Changed import in `visual_storytelling.py`:

```python
# Before (incorrect)
from app.services.sarvam_sdk import SarvamTTSClient
tts_client = SarvamTTSClient(api_key=api_keys["sarvam_key"])

# After (correct)
from app.services.sarvam_sdk import SarvamTTS
tts_client = SarvamTTS(api_key=api_keys["sarvam_key"])
```

**Status:** ✅ Fixed

---

## Common Import Errors

### Missing Dependencies

**Error:**
```
ModuleNotFoundError: No module named 'xyz'
```

**Solution:**
```bash
# Activate virtual environment first
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt
```

### Circular Imports

**Error:**
```
ImportError: cannot import name 'X' from partially initialized module 'Y'
```

**Solution:**
Move imports inside functions or restructure module dependencies.

### Relative Import Issues

**Error:**
```
ImportError: attempted relative import with no known parent package
```

**Solution:**
Run from project root or use absolute imports.

---

## Python Version Compatibility

### Python 3.13 - CGI Module Removed

**Issue:**
The `cgi` module was removed in Python 3.13, causing import errors.

**Fix Applied:**
Added compatibility shim in `main.py`:

```python
import sys
if sys.version_info >= (3, 13):
    from app.services import cgi_compat
    sys.modules['cgi'] = cgi_compat.cgi
```

The `cgi_compat.py` provides minimal `cgi` functionality needed by the application.

**Status:** ✅ Fixed

---

## Related Documentation

- [Backend README](backend/README.md) - Backend setup and troubleshooting
- [Main README](README.md) - Project overview
