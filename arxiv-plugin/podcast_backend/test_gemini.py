#!/usr/bin/env python3

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
    print("ERROR: GEMINI_API_KEY not configured")
    exit(1)

print(f"API Key loaded: {GEMINI_API_KEY[:10]}...")

# Test using REST API directly (stable v1)
url = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

headers = {
    'Content-Type': 'application/json',
}

data = {
    "contents": [{
        "parts": [{
            "text": "Hello, how are you?"
        }]
    }]
}

try:
    print("\nTesting REST API directly...")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        if 'candidates' in result and len(result['candidates']) > 0:
            text = result['candidates'][0]['content']['parts'][0]['text']
            print(f"✅ REST API works! Response: {text[:50]}...")
        else:
            print(f"❌ No candidates in response: {result}")
    else:
        print(f"❌ API Error: {response.text}")
        
except Exception as e:
    print(f"❌ Request failed: {str(e)}")

print("\nTest completed.")
