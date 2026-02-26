from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import io
import os
import base64
import tempfile
import requests
import google.generativeai as genai
import json
import re
import wave
import struct
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# SECURITY: Restrict CORS to known origins in production
# For development, allow localhost and Chrome extensions
CORS(app, origins=[
    "chrome-extension://*",  # Allow Chrome extensions
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://arxiv.org",
    "https://www.biorxiv.org",
    "https://www.medrxiv.org"
])

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')

print(f"GEMINI_API_KEY loaded: {'Yes' if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here' else 'No'}")
print(f"SARVAM_API_KEY loaded: {'Yes' if SARVAM_API_KEY and SARVAM_API_KEY != 'your_sarvam_api_key_here' else 'No'}")

if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
    genai.configure(api_key=GEMINI_API_KEY)
    # Use the stable API version
    try:
        # Try the latest available model first
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("Using gemini-2.5-flash model")
        test_response = model.generate_content("Hello")
        print("Gemini model test successful")
    except Exception as e:
        print(f"Failed to initialize gemini-2.5-flash: {e}")
        try:
            # Fallback to gemini-2.0-flash
            model = genai.GenerativeModel('gemini-2.0-flash')
            print("Using gemini-2.0-flash model")
            test_response = model.generate_content("Hello")
            print("Gemini model test successful")
        except Exception as e2:
            print(f"Failed to initialize gemini-2.0-flash: {e2}")
            try:
                # Fallback to gemini-flash-latest
                model = genai.GenerativeModel('gemini-flash-latest')
                print("Using gemini-flash-latest model")
                test_response = model.generate_content("Hello")
                print("Gemini model test successful")
            except Exception as e3:
                print(f"Failed to initialize gemini-flash-latest: {e3}")
                try:
                    # Last fallback to gemini-pro-latest
                    model = genai.GenerativeModel('gemini-pro-latest')
                    print("Using gemini-pro-latest model")
                    test_response = model.generate_content("Hello")
                    print("Gemini model test successful")
                except Exception as e4:
                    print(f"Failed to initialize any Gemini model: {e4}")
                    print("Using fallback mode (no AI summarization)")
                    model = None
else:
    print("WARNING: GEMINI_API_KEY not properly configured")
    print("Using fallback mode (no AI summarization)")
    model = None

def extract_arxiv_id(url):
    """Extract arXiv ID from various URL formats"""
    import re
    
    # arXiv patterns
    patterns = [
        r'arxiv\.org/abs/([^/\?#]+)',
        r'arxiv\.org/pdf/([^/\?#]+)\.pdf',
        r'doi\.org/10\.48550/arXiv\.([^/\?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1).replace('.pdf', '')
    
    return None

def fetch_paper_content(paper_url):
    """Fetch and extract text from arXiv paper"""
    try:
        arxiv_id = extract_arxiv_id(paper_url)
        if not arxiv_id:
            return None, "Could not extract arXiv ID from URL"
        
        # Get paper metadata from arXiv API
        api_url = f"http://export.arxiv.org/api/query?id_list={arxiv_id}"
        api_response = requests.get(api_url)
        
        if api_response.status_code != 200:
            return None, f"Failed to fetch paper metadata: {api_response.status_code}"
        
        # Parse XML response to get title, authors, abstract
        import xml.etree.ElementTree as ET
        root = ET.fromstring(api_response.content)
        
        # Extract metadata
        entry = root.find('{http://www.w3.org/2005/Atom}entry')
        if entry is None:
            return None, "Paper not found in arXiv"
        
        title = entry.find('{http://www.w3.org/2005/Atom}title').text.strip()
        summary = entry.find('{http://www.w3.org/2005/Atom}summary').text.strip()
        
        authors = []
        for author in entry.findall('{http://www.w3.org/2005/Atom}author'):
            name = author.find('{http://www.w3.org/2005/Atom}name').text
            authors.append(name)
        
        # Download PDF
        pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
        pdf_response = requests.get(pdf_url)
        
        if pdf_response.status_code != 200:
            return None, f"Failed to download PDF: {pdf_response.status_code}"
        
        # Extract text from PDF
        pdf_file = io.BytesIO(pdf_response.content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return {
            'title': title,
            'authors': authors,
            'abstract': summary,
            'full_text': text
        }, None
        
    except Exception as e:
        return None, f"Error fetching paper: {str(e)}"

def generate_summary_with_gemini(paper_data, language='english'):
    """Generate structured summary using Gemini (with fallback)"""
    try:
        if not model:
            # Fallback: Create a simple summary from the abstract
            print("[DEBUG] Using fallback summary generation (no Gemini model)")
            abstract = paper_data['abstract']
            title = paper_data['title']
            
            # Simple fallback summary
            summary = f"""
Introduction: This research paper titled "{title}" explores important findings in the field. The study addresses a significant problem and provides valuable insights.

Methodology: The researchers conducted a comprehensive study using established research methods. They analyzed data and applied appropriate statistical techniques to draw meaningful conclusions.

Results: The study revealed important findings that contribute to our understanding of the topic. The results show significant patterns and relationships that advance the field.

Conclusion: This research provides valuable contributions to the field and suggests directions for future work. The findings have important implications for both theory and practice.
            """.strip()
            
            return summary, None
        
        prompt = f"""
        Please analyze this research paper and create a structured summary in {language} with the following sections:
        
        Paper Title: {paper_data['title']}
        Authors: {', '.join(paper_data['authors'])}
        Abstract: {paper_data['abstract']}
        
        Please provide a comprehensive summary with these sections:
        1. Introduction - What is the research about and why is it important?
        2. Methodology - How did the researchers conduct their study?
        3. Results - What were the main findings?
        4. Conclusion - What are the implications and future work?
        
        Keep each section concise but informative (2-3 sentences each).
        """
        
        response = model.generate_content(prompt)
        return response.text, None
        
    except Exception as e:
        return None, f"Error generating summary: {str(e)}"

def generate_dialogue_script(summary, title, language='english'):
    """Convert summary into conversational dialogue (with fallback)"""
    try:
        if not model:
            # Fallback: Create a simple dialogue
            print("[DEBUG] Using fallback dialogue generation (no Gemini model)")
            dialogue = f"""Host: Welcome to our research discussion! Today we're talking about "{title}".

Guest: Thank you for having me. This is a fascinating paper that explores important findings in the field.

Host: Can you tell us about the methodology used in this study?

Guest: The researchers conducted a comprehensive study using established research methods and statistical analysis.

Host: What were the main results they found?

Guest: The study revealed significant findings that contribute to our understanding of the topic and advance the field.

Host: What are the implications of this research?

Guest: This work provides valuable contributions and suggests important directions for future research in the area.

Host: Thank you for sharing these insights with us today.

Guest: You're welcome! It's always exciting to discuss cutting-edge research."""
            
            return dialogue, None
        
        # Set speaker names based on language
        if language.lower() == 'hindi':
            host_name = "**होस्ट:**"
            guest_name = "**अतिथि:**"
        else:
            host_name = "Host:"
            guest_name = "Guest:"
        
        prompt = f"""
        Convert this research paper summary into a natural conversation between two people in {language}:
        
        Paper Title: {title}
        Summary: {summary}
        
        Create a dialogue between:
        - {host_name} A curious person asking questions
        - {guest_name} An expert explaining the research
        
        Format the dialogue like this:
        {host_name} [question or introduction]
        {guest_name} [response]
        {host_name} [follow-up question]
        {guest_name} [response]
        
        IMPORTANT: Keep each {host_name} and {guest_name} response SHORT (maximum 2 sentences each). Make it sound natural and engaging but concise. Include:
        1. Introduction to the paper
        2. Discussion of methodology
        3. Key findings
        4. Implications and conclusion
        
        Keep each speaker's lines concise (1-2 sentences max).
        """
        
        response = model.generate_content(prompt)
        return response.text, None
        
    except Exception as e:
        return None, f"Error generating dialogue: {str(e)}"

def text_to_speech_sarvam(text, speaker='Anushka', language='en-IN'):
    """Convert text to speech using Sarvam AI with proper API integration"""
    try:
        print(f"[DEBUG] TTS request - Speaker: {speaker}, Language: {language}, Text: {text[:50]}...")
        
        # Map language to Sarvam format
        lang_map = {
            'english': 'en-IN',
            'hindi': 'hi-IN'
        }
        
        # Map speakers to lowercase (matching API spec)
        speaker_map = {
            'Anushka': 'anushka',
            'Abhilash': 'abhilash'
        }
        speaker_id = speaker_map.get(speaker, 'anushka')
        
        # Build request payload according to official API spec
        payload = {
            "text": text,
            "target_language_code": lang_map.get(language, 'en-IN'),
            "speaker": speaker_id,
            "model": "bulbul:v2",
            "output_audio_codec": "wav",
            "speech_sample_rate": "22050",
            "pitch": 0.0,
            "pace": 1.0,
            "loudness": 1.0,
            "enable_preprocessing": True
        }
        
        headers = {
            'api-subscription-key': SARVAM_API_KEY,
            'Content-Type': 'application/json'
        }
        
        print(f"[DEBUG] Making TTS request to Sarvam API with payload: {payload}")
        response = requests.post('https://api.sarvam.ai/text-to-speech', 
                               json=payload, headers=headers, timeout=60)
        
        print(f"[DEBUG] TTS response status: {response.status_code}")
        print(f"[DEBUG] TTS response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                # Parse JSON response according to API spec
                response_data = response.json()
                print(f"[DEBUG] TTS response data keys: {list(response_data.keys())}")
                
                if 'audios' in response_data and response_data['audios']:
                    # Get the first audio from the audios array
                    audio_base64 = response_data['audios'][0]
                    print(f"[DEBUG] TTS success - Audio base64 length: {len(audio_base64)} characters")
                    return audio_base64, None
                else:
                    error_msg = "No audio data in response"
                    print(f"[DEBUG] TTS error: {error_msg}")
                    return None, error_msg
                    
            except json.JSONDecodeError:
                # If response is not JSON, treat as raw audio data
                audio_data = response.content
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                print(f"[DEBUG] TTS success (raw audio) - Audio size: {len(audio_data)} bytes")
                return audio_base64, None
        else:
            error_msg = f"Sarvam TTS failed: {response.status_code} - {response.text}"
            print(f"[DEBUG] TTS error: {error_msg}")
            return None, error_msg
            
    except requests.exceptions.Timeout:
        error_msg = "TTS request timed out"
        print(f"[DEBUG] TTS timeout: {error_msg}")
        return None, error_msg
    except Exception as e:
        error_msg = f"TTS request failed: {str(e)}"
        print(f"[DEBUG] TTS exception: {error_msg}")
        import traceback
        traceback.print_exc()
        return None, error_msg

def create_silence(duration_ms, sample_rate=22050):
    """Create silence audio data"""
    samples = int(sample_rate * duration_ms / 1000)
    silence = b'\x00' * (samples * 2)  # 16-bit audio
    return silence

def concatenate_wav_files(wav_data_list):
    """Concatenate multiple WAV files into one"""
    if not wav_data_list:
        return None
    
    # Use the first WAV file as reference for format
    first_wav = io.BytesIO(base64.b64decode(wav_data_list[0]))
    with wave.open(first_wav, 'rb') as wav_ref:
        sample_rate = wav_ref.getframerate()
        channels = wav_ref.getnchannels()
        sample_width = wav_ref.getsampwidth()
    
    # Create output buffer
    output_buffer = io.BytesIO()
    
    with wave.open(output_buffer, 'wb') as output_wav:
        output_wav.setnchannels(channels)
        output_wav.setsampwidth(sample_width)
        output_wav.setframerate(sample_rate)
        
        for i, wav_data in enumerate(wav_data_list):
            # Write audio data
            wav_bytes = io.BytesIO(base64.b64decode(wav_data))
            with wave.open(wav_bytes, 'rb') as wav_file:
                audio_frames = wav_file.readframes(wav_file.getnframes())
                output_wav.writeframes(audio_frames)
            
            # Add silence between segments (except after the last one)
            if i < len(wav_data_list) - 1:
                silence = create_silence(500, sample_rate)  # 0.5 second pause
                output_wav.writeframes(silence)
    
    output_buffer.seek(0)
    return output_buffer.getvalue()

def create_podcast_audio(dialogue_text, language='english'):
    """Create podcast audio from dialogue"""
    try:
        print(f"[DEBUG] Starting audio generation for language: {language}")
        print(f"[DEBUG] Dialogue text length: {len(dialogue_text)}")
        
        # Split dialogue by speaker
        lines = dialogue_text.split('\n')
        audio_segments = []
        processed_lines = 0
        
        print(f"[DEBUG] Processing {len(lines)} lines")
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            print(f"[DEBUG] Processing line {i+1}: {line[:50]}...")
            
            # Handle both English and Hindi speaker patterns
            if line.startswith('Host:') or line.startswith('**होस्ट:**'):
                text = line.replace('Host:', '').replace('**होस्ट:**', '').strip()
                speaker = 'Anushka'  # Female voice
            elif line.startswith('Guest:') or line.startswith('**अतिथि:**'):
                text = line.replace('Guest:', '').replace('**अतिथि:**', '').strip()
                speaker = 'Abhilash'  # Male voice
            else:
                print(f"[DEBUG] Skipping line (no speaker): {line[:30]}...")
                continue
            
            if text and len(text) > 0:
                print(f"[DEBUG] Generating TTS for {speaker}: {text[:30]}...")
                # Generate audio for this line
                audio_base64, error = text_to_speech_sarvam(text, speaker, language)
                if error:
                    print(f"[ERROR] TTS error for '{text[:50]}...': {error}")
                    continue
                
                if audio_base64:
                    audio_segments.append(audio_base64)
                    processed_lines += 1
                    print(f"[DEBUG] Successfully generated audio segment {processed_lines}")
                else:
                    print(f"[ERROR] No audio data returned for: {text[:30]}...")
            else:
                print(f"[DEBUG] Skipping empty text for {speaker}")
        
        print(f"[DEBUG] Generated {len(audio_segments)} audio segments from {processed_lines} processed lines")
        
        if not audio_segments:
            return None, "No audio segments generated"
        
        print(f"[DEBUG] Starting audio concatenation...")
        # Concatenate all audio segments
        combined_audio = concatenate_wav_files(audio_segments)
        if not combined_audio:
            return None, "Failed to concatenate audio"
        
        print(f"[DEBUG] Audio concatenation successful, size: {len(combined_audio)} bytes")
        
        # Convert to base64
        audio_base64 = base64.b64encode(combined_audio).decode('utf-8')
        print(f"[DEBUG] Audio generation complete, base64 length: {len(audio_base64)}")
        
        return audio_base64, None
        
    except Exception as e:
        print(f"[ERROR] Exception in create_podcast_audio: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, f"Error creating podcast audio: {str(e)}"

@app.route('/generate-podcast', methods=['POST'])
def generate_podcast():
    try:
        print(f"[DEBUG] Received podcast generation request")
        data = request.get_json()
        paper_url = data.get('paper_url')
        language = data.get('language', 'english')
        
        print(f"[DEBUG] Paper URL: {paper_url}, Language: {language}")
        
        if not paper_url:
            return jsonify({'error': 'paper_url is required'}), 400
        
        if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
            return jsonify({'error': 'GEMINI_API_KEY not configured properly'}), 500
            
        if not SARVAM_API_KEY or SARVAM_API_KEY == 'your_sarvam_api_key_here':
            return jsonify({'error': 'SARVAM_API_KEY not configured properly'}), 500
            
        # Note: model can be None in fallback mode, that's okay
        
        # Step 1: Fetch paper content
        print(f"[DEBUG] Step 1: Fetching paper content")
        paper_data, error = fetch_paper_content(paper_url)
        if error:
            print(f"[ERROR] Paper fetch failed: {error}")
            return jsonify({'error': f'Failed to fetch paper: {error}'}), 400
        
        print(f"[DEBUG] Step 1 completed - Paper title: {paper_data['title']}")
        
        # Step 2: Generate summary
        print(f"[DEBUG] Step 2: Generating summary")
        summary, error = generate_summary_with_gemini(paper_data, language)
        if error:
            print(f"[ERROR] Summary generation failed: {error}")
            return jsonify({'error': f'Failed to generate summary: {error}'}), 500
        
        print(f"[DEBUG] Step 2 completed - Summary length: {len(summary)}")
        
        # Step 3: Generate dialogue
        print(f"[DEBUG] Step 3: Generating dialogue")
        dialogue, error = generate_dialogue_script(summary, paper_data['title'], language)
        if error:
            print(f"[ERROR] Dialogue generation failed: {error}")
            return jsonify({'error': f'Failed to generate dialogue: {error}'}), 500
        
        print(f"[DEBUG] Step 3 completed - Dialogue length: {len(dialogue)}")
        
        # Step 4: Create podcast audio (with timeout)
        print(f"[DEBUG] Step 4: Creating podcast audio")
        
        audio_base64, error = create_podcast_audio(dialogue, language)
        if error:
            print(f"[ERROR] Audio generation failed: {error}")
            return jsonify({'error': f'Failed to generate audio: {error}'}), 500
        
        print(f"[DEBUG] Step 4 completed - Audio generated successfully")
        
        return jsonify({
            'success': True,
            'audio_base64': audio_base64,
            'title': paper_data['title'],
            'summary': summary,
            'dialogue': dialogue,
            'podcast_id': f"podcast_{int(time.time())}"
        })
        
    except Exception as e:
        print(f"[ERROR] Server exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Podcast backend is running'})

@app.route('/test-tts', methods=['POST'])
def test_tts():
    """Test endpoint for TTS functionality"""
    try:
        data = request.get_json()
        text = data.get('text', 'Hello, this is a test.')
        speaker = data.get('speaker', 'Anushka')
        language = data.get('language', 'en-IN')
        
        print(f"[DEBUG] Test TTS request - Text: {text}, Speaker: {speaker}, Language: {language}")
        
        audio_base64, error = text_to_speech_sarvam(text, speaker, language)
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'audio_base64': audio_base64,
            'text': text,
            'speaker': speaker,
            'language': language
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
