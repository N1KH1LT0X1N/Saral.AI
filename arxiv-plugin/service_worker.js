// service_worker.js
// Handles create / getVideo / download. Tries JSON -> form for create.
// Fixed: Return binary data to content script instead of using URL.createObjectURL in service worker
// Uses chrome.downloads.download so files are saved directly to user's downloads.

const API_BASE = 'https://canvas.iiit.ac.in/saralbe/api/papertovideo'; // create endpoint under /api/papertovideo

// convert ArrayBuffer to base64 (kept for stream case)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// parse filename from Content-Disposition header, fallback to defaultFilename
function filenameFromContentDisposition(cdHeader, defaultFilename) {
  if (!cdHeader) return defaultFilename;
  // try filename*=UTF-8''encoded
  let m = /filename\*=UTF-8''([^;]+)/i.exec(cdHeader);
  if (m && m[1]) {
    try { return decodeURIComponent(m[1].replace(/['"]/g, '')); } catch (e) { return m[1].replace(/['"]/g, ''); }
  }
  m = /filename="?([^";]+)"?/i.exec(cdHeader);
  if (m && m[1]) return m[1];
  return defaultFilename;
}

async function tryPostJson(url, payload) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    mode: 'cors',
    body: JSON.stringify(payload)
  });
  const text = await resp.text();
  return { resp, text };
}

async function tryPostForm(url, payload) {
  const form = new FormData();
  for (const k of Object.keys(payload)) {
    if (payload[k] !== undefined && payload[k] !== null) form.append(k, payload[k]);
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json' }, // don't set content-type
    mode: 'cors',
    body: form
  });
  const text = await resp.text();
  return { resp, text };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      console.log('[service_worker] message:', message);

      // CREATE -> POST to /upload_arxiv_to_video with { arxiv_url }
      if (message.action === 'create') {
        const arxivUrl = message.arxivUrl || message.arxiv_url || null;
        const arxivId = message.arxivId || message.arxiv_id || null;
        const payload = arxivUrl ? { arxiv_url: arxivUrl } : (arxivId ? { arxiv_url: `https://doi.org/10.48550/arXiv.${arxivId}` } : null);

        if (!payload) {
          sendResponse({ ok: false, error: 'No arxivUrl or arxivId provided' });
          return;
        }

        const endpoint = `${API_BASE}/upload_arxiv_to_video`;

        // try JSON first
        try {
          const { resp, text } = await tryPostJson(endpoint, payload);
          console.log('[service_worker] create JSON attempt status:', resp.status);
          if (resp.ok) {
            try {
              const j = JSON.parse(text);
              sendResponse({ ok: true, body: j });
              return;
            } catch (e) {
              sendResponse({ ok: true, body: { raw: text } });
              return;
            }
          } else {
            console.warn('[service_worker] JSON create failed — will try form. status:', resp.status);
          }
        } catch (err) {
          console.warn('[service_worker] JSON create error:', err);
        }

        // fallback to multipart/form-data
        try {
          const { resp: resp2, text: text2 } = await tryPostForm(endpoint, payload);
          console.log('[service_worker] create FORM attempt status:', resp2.status);
          if (resp2.ok) {
            try {
              const j2 = JSON.parse(text2);
              sendResponse({ ok: true, body: j2, note: 'sent-as-form' });
              return;
            } catch (e) {
              sendResponse({ ok: true, body: { raw: text2 }, note: 'sent-as-form' });
              return;
            }
          } else {
            sendResponse({ ok: false, error: `Create failed (form): ${resp2.status} ${text2}`, status: resp2.status });
            return;
          }
        } catch (err2) {
          console.error('[service_worker] create form error:', err2);
          sendResponse({ ok: false, error: 'Both create attempts failed: ' + err2.message });
          return;
        }
      }

      // GET VIDEO (stream-video)
      if (message.action === 'getVideo') {
        const generatedId = message.generatedId;
        if (!generatedId) { sendResponse({ ok: false, error: 'No generatedId provided' }); return; }
        const url = `${API_BASE}/${encodeURIComponent(generatedId)}/stream-video`;
        console.log('[service_worker] fetching stream video url:', url);
        const resp = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!resp.ok) {
          const text = await resp.text();
          sendResponse({ ok: false, error: `Stream API failed: ${resp.status} ${text}` });
          return;
        }
        const contentType = resp.headers.get('Content-Type') || '';
        console.log('[service_worker] stream content-type:', contentType);

        if (contentType.includes('application/json')) {
          const j = await resp.json();
          sendResponse({ ok: true, body: j });
          return;
        } else if (contentType.startsWith('video/') || contentType === 'application/octet-stream') {
          // return base64 to content script
          const ab = await resp.arrayBuffer();
          const base64 = arrayBufferToBase64(ab);
          sendResponse({ ok: true, body: { video_base64: base64, contentType }});
          return;
        } else {
          // attempt parse json or return text
          try {
            const j = await resp.json();
            sendResponse({ ok: true, body: j });
            return;
          } catch (e) {
            const txt = await resp.text();
            sendResponse({ ok: true, body: { text: txt, contentType }});
            return;
          }
        }
      }

      // DOWNLOAD -> return binary data to content script for processing
      if (message.action === 'download') {
        const generatedId = message.generatedId;
        if (!generatedId) { sendResponse({ ok: false, error: 'No generatedId provided' }); return; }
        const url = `${API_BASE}/${encodeURIComponent(generatedId)}/download-video`;
        console.log('[service_worker] download url:', url);

        const resp = await fetch(url, { method: 'GET', redirect: 'follow', mode: 'cors' });
        if (!resp.ok) {
          const text = await resp.text();
          sendResponse({ ok: false, error: `Download API failed: ${resp.status} ${text}` });
          return;
        }

        const ct = resp.headers.get('Content-Type') || '';
        const cd = resp.headers.get('Content-Disposition') || '';
        console.log('[service_worker] download content-type:', ct, 'content-disposition:', cd, 'resp.url:', resp.url);

        // try JSON with download_url/video_url (direct URLs that can be downloaded)
        if (ct.includes('application/json')) {
          const j = await resp.json();
          if (j.download_url || j.video_url) {
            sendResponse({ 
              ok: true, 
              body: { 
                directUrl: j.download_url || j.video_url,
                filename: `${generatedId}.mp4`
              }
            });
            return;
          } else {
            sendResponse({ ok: false, error: 'No download_url/video_url found in JSON response' });
            return;
          }
        }

        // If binary video returned, send ArrayBuffer to content script
        if (ct.startsWith('video/') || ct === 'application/octet-stream') {
          const ab = await resp.arrayBuffer();
          const filename = filenameFromContentDisposition(cd, `${generatedId}.mp4`);
          
          // Convert ArrayBuffer to transferable format
          sendResponse({ 
            ok: true, 
            body: { 
              arrayBuffer: Array.from(new Uint8Array(ab)), // Convert to regular array for transfer
              contentType: ct || 'video/mp4',
              filename: filename,
              generatedId: generatedId
            }
          });
          return;
        }

        // fallback: if server redirected to a public file url
        const finalUrl = resp.url;
        sendResponse({ 
          ok: true, 
          body: { 
            directUrl: finalUrl,
            filename: `${generatedId}.mp4`
          }
        });
        return;
      }

      // CREATE PODCAST -> POST to local backend
      if (message.action === 'createPodcast') {
        const paperUrl = message.paperUrl || message.paper_url || null;
        const language = message.language || 'english';
        
        if (!paperUrl) {
          sendResponse({ ok: false, error: 'No paperUrl provided' });
          return;
        }

        const backendUrl = 'http://localhost:5001/generate-podcast';
        const payload = { paper_url: paperUrl, language };

        try {
          const resp = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          const text = await resp.text();
          console.log('[service_worker] podcast create response status:', resp.status);
          
          if (resp.ok) {
            try {
              const j = JSON.parse(text);
              
              // Store podcast data in Chrome storage for later retrieval
              if (j.podcast_id && j.audio_base64) {
                const podcastData = {
                  podcast_id: j.podcast_id,
                  audio_base64: j.audio_base64,
                  dialogue: j.dialogue,
                  summary: j.summary,
                  title: j.title,
                  language: payload.language,
                  created_at: Date.now()
                };
                
                await chrome.storage.local.set({
                  [`podcast_${j.podcast_id}`]: podcastData
                });
                
                console.log('[service_worker] podcast stored with ID:', j.podcast_id);
              }
              
              sendResponse({ ok: true, body: j });
              return;
            } catch (e) {
              sendResponse({ ok: true, body: { raw: text } });
              return;
            }
          } else {
            sendResponse({ ok: false, error: `Podcast creation failed: ${resp.status} ${text}` });
            return;
          }
        } catch (err) {
          console.error('[service_worker] podcast create error:', err);
          sendResponse({ ok: false, error: 'Podcast creation failed: ' + err.message });
          return;
        }
      }

      // GET PODCAST -> retrieve stored podcast data
      if (message.action === 'getPodcast') {
        const podcastId = message.podcastId;
        if (!podcastId) { 
          sendResponse({ ok: false, error: 'No podcastId provided' }); 
          return; 
        }
        
        try {
          // Retrieve podcast data from Chrome storage
          const result = await chrome.storage.local.get([`podcast_${podcastId}`]);
          const podcastData = result[`podcast_${podcastId}`];
          
          if (!podcastData) {
            sendResponse({ ok: false, error: 'Podcast not found in storage' });
            return;
          }
          
          sendResponse({ ok: true, body: podcastData });
          return;
        } catch (err) {
          console.error('[service_worker] podcast retrieval error:', err);
          sendResponse({ ok: false, error: 'Failed to retrieve podcast: ' + err.message });
          return;
        }
      }

      sendResponse({ ok: false, error: 'Unknown action' });
    } catch (err) {
      console.error('[service_worker] caught error:', err);
      sendResponse({ ok: false, error: err.message || String(err) });
    }
  })();

  // keep channel open for async response
  return true;
});