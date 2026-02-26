// content_script.js
// Multi-site support for arXiv, bioRxiv, medRxiv, chemRxiv, EarthArXiv, SocArXiv, Preprints.org

function ce(tag, props={}, ...children) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c instanceof Node) e.appendChild(c);
  }
  return e;
}

function getPaperIdFromUrl() {
  const host = location.hostname;
  const path = location.pathname;
  let match;

  // arXiv: /abs/2301.12345 or /abs/2301.12345v1
  if (host.includes('arxiv.org')) {
    match = path.match(/\/abs\/([^\/\?#]+)/);
    return match ? { id: match[1], site: 'arxiv' } : null;
  }

  // bioRxiv & medRxiv: /content/10.1101/2024.10.08.617232v1
  if (host.includes('biorxiv.org') || host.includes('medrxiv.org')) {
    match = path.match(/\/content\/(10\.1101\/[\d.]+v?\d*)/);
    const site = host.includes('biorxiv') ? 'biorxiv' : 'medrxiv';
    return match ? { id: match[1], site } : null;
  }

  // chemRxiv: /engage/chemrxiv/article-details/123abc456def
  if (host.includes('chemrxiv.org')) {
    match = path.match(/\/article-details\/([^\/\?#]+)/);
    return match ? { id: match[1], site: 'chemrxiv' } : null;
  }

  // EarthArXiv: /repository/view/5221/ or /repository/object/12345/
  if (host.includes('eartharxiv.org')) {
    match = path.match(/\/repository\/(?:view|object)\/(\d+)/);
    return match ? { id: match[1], site: 'eartharxiv' } : null;
  }

  // SocArXiv (OSF): /preprints/socarxiv/abc12/
  if (host.includes('osf.io') && path.includes('socarxiv')) {
    match = path.match(/\/socarxiv\/([^\/\?#]+)/);
    return match ? { id: match[1], site: 'socarxiv' } : null;
  }

  // Preprints.org: /manuscript/202401.1234/v1
  if (host.includes('preprints.org')) {
    match = path.match(/\/manuscript\/([^\/\?#]+(?:\/v\d+)?)/);
    return match ? { id: match[1].replace(/\//g, '_'), site: 'preprints' } : null;
  }

  return null;
}

function createModalElements() {
  const overlay = ce('div', { className: 'mv-modal-overlay' });
  const box = ce('div', { className: 'mv-modal-box' });
  const closeBtn = ce('button', { className: 'mv-modal-close' }, '✕');
  const videoContainer = ce('div', { className: 'mv-video-container' });
  const footer = ce('div', { className: 'mv-modal-footer' });
  const downloadBtn = ce('button', { className: 'mv-download-btn' }, '⬇ Download');

  box.appendChild(closeBtn);
  box.appendChild(videoContainer);
  footer.appendChild(downloadBtn);
  box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.style.display = 'none';

  return { overlay, closeBtn, videoContainer, downloadBtn };
}

function createOptionsModal() {
  const overlay = ce('div', { className: 'mv-options-modal' });
  const box = ce('div', { className: 'mv-options-box' });
  const title = ce('h3', { className: 'mv-options-title' }, 'Choose Format');
  const videoBtn = ce('button', { className: 'mv-option-btn mv-video-option' }, '🎥 Video');
  const podcastBtn = ce('button', { className: 'mv-option-btn mv-podcast-option' }, '🎧 Podcast');
  const closeBtn = ce('button', { className: 'mv-modal-close' }, '✕');

  box.appendChild(closeBtn);
  box.appendChild(title);
  box.appendChild(videoBtn);
  box.appendChild(podcastBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.style.display = 'none';

  return { overlay, closeBtn, videoBtn, podcastBtn };
}

function createLanguageModal() {
  const overlay = ce('div', { className: 'mv-language-modal' });
  const box = ce('div', { className: 'mv-language-box' });
  const title = ce('h3', { className: 'mv-language-title' }, 'Choose Language');
  const englishBtn = ce('button', { className: 'mv-lang-btn mv-english-option' }, '🇺🇸 English');
  const hindiBtn = ce('button', { className: 'mv-lang-btn mv-hindi-option' }, '🇮🇳 Hindi');
  const closeBtn = ce('button', { className: 'mv-modal-close' }, '✕');

  box.appendChild(closeBtn);
  box.appendChild(title);
  box.appendChild(englishBtn);
  box.appendChild(hindiBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.style.display = 'none';

  return { overlay, closeBtn, englishBtn, hindiBtn };
}

function base64ToBlobUrl(base64, contentType='video/mp4') {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: contentType });
  return URL.createObjectURL(blob);
}

function sendToWorker(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (resp) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(resp);
      }
    });
  });
}

function setButtonInitial(btn) {
  // cleanup previous processing state if present
if (btn._mv_processing_handles) {
  const { interval, timeouts, progressFill } = btn._mv_processing_handles;
  if (interval) clearInterval(interval);
  if (Array.isArray(timeouts)) timeouts.forEach(t => clearTimeout(t));
  if (progressFill) progressFill.style.width = '100%'; // finalize visually
  delete btn._mv_processing_handles;
  btn.style.pointerEvents = '';
  btn.removeAttribute('aria-busy');
  btn.classList.remove('processing');
}

  btn.innerHTML = `<div class="mv-btn-main">SARALify</div>`;
  btn.classList.remove('generated');
}

const TIMELINE_STEPS = [
  { duration: 12000, message: 'Analyzing research paper' },
  { duration: 12000, message: 'Creating presentation slides' },
  { duration: 18000, message: 'Generating voiceover narration' },
  { duration: 0, message: 'Producing final video'}
];

function setButtonGenerating(btn) {
  // --- cleanup any previous processing handles (same as before) ---
  if (btn._mv_processing_handles) {
    const { interval, timeouts, progressFill } = btn._mv_processing_handles;
    if (interval) clearInterval(interval);
    if (Array.isArray(timeouts)) timeouts.forEach(t => clearTimeout(t));
    if (progressFill) progressFill.style.width = '0%';
    delete btn._mv_processing_handles;
    btn.style.pointerEvents = '';
    btn.removeAttribute('aria-busy');
    btn.classList.remove('processing');
  }

  // Basic button state (same as before)
  btn.classList.remove('generated');
  btn.classList.add('processing');
  btn.setAttribute('aria-busy', 'true');
  btn.style.pointerEvents = 'none';
  btn.innerHTML = '';

  // Layout: spinner + texts + progress (same markup as before)
  const wrap = ce('div', { className: 'mv-processing' });
  const spinner = ce('div', { className: 'mv-spinner', title: 'Processing' });
  wrap.appendChild(spinner);
  const texts = ce('div', { style: 'display:flex;flex-direction:column;align-items:flex-start;' });
  const main = ce('div', { className: 'mv-btn-main' }, 'Processing');
  const sub  = ce('div', { className: 'mv-btn-sub' }, '');
  texts.appendChild(main);
  texts.appendChild(sub);
  wrap.appendChild(texts);
  const progWrap = ce('div', { style: 'display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-left:8px;' });
  const progressBar = ce('div', { className: 'mv-progress-wrap' });
  const progressFill = ce('div', { className: 'mv-progress-fill' });
  progressBar.appendChild(progressFill);
  progWrap.appendChild(progressBar);
  btn.appendChild(wrap);
  btn.appendChild(progWrap);

  // TIMELINE_STEPS in scope
  const steps = Array.isArray(TIMELINE_STEPS) ? TIMELINE_STEPS.slice() : [];
  const durations = steps.map(s => Math.max(0, s.duration || 0));
  const totalPositive = durations.reduce((a,b)=>a+b, 0);

  // show first step
  let currentStep = 0;
  function showStep(idx) {
    if (idx < 0 || idx >= steps.length) return;
    const step = steps[idx];
    main.textContent = step.message || 'Processing...';
    sub.textContent = `Step ${idx + 1} of ${steps.length}`;
  }
  if (steps.length > 0) showStep(0);
  else { main.textContent = 'Processing...'; sub.textContent = ''; }

  // compute offsets
  const startTs = Date.now();
  let stepStartOffsets = [];
  (function computeOffsets() {
    stepStartOffsets = [];
    let acc = 0;
    for (let i=0;i<steps.length;i++){
      stepStartOffsets.push(acc);
      acc += Math.max(0, steps[i].duration || 0);
    }
  })();

  // UPDATED progress updater (caps when final step is zero-duration)
  function updateProgressSmooth() {
    const now = Date.now();

    // If there are no positive durations, ramp gently to 65% (unchanged)
    if (totalPositive <= 0) {
      const t = Math.min(1, (now - startTs) / 18000);
      const pct = Math.round(65 * t);
      progressFill.style.width = pct + '%';
      return;
    }

    // Compute completed positive-duration time by wall-clock
    let completed = 0;
    for (let i=0;i<steps.length;i++){
      const stepDur = Math.max(0, steps[i].duration || 0);
      const stepStart = startTs + stepStartOffsets[i];
      if (now >= stepStart + stepDur) {
        completed += stepDur;
      } else if (now > stepStart) {
        completed += Math.max(0, now - stepStart);
      }
    }

    // Base percentage (may reach 100 if completed == totalPositive)
    let basePct = Math.min(100, Math.round((completed / totalPositive) * 100));

    // If we're currently on the final step AND that final step has duration === 0,
    // we must NOT let the bar reach 100% while processing. Cap it at MAX_BEFORE_FINISH.
    const lastIdx = steps.length - 1;
    const finalStepZero = steps.length > 0 && (steps[lastIdx].duration || 0) === 0;
    const onFinalStep = currentStep === lastIdx;

    if (finalStepZero && onFinalStep) {
      const MAX_BEFORE_FINISH = 90; // safe cap, adjust if you want slightly higher/lower
      // Also ensure we don't drop the bar if basePct is lower.
      basePct = Math.min(basePct, MAX_BEFORE_FINISH);
    } else {
      // keep one-percent cushion: don't set 100% until cleanup runs
      basePct = Math.min(basePct, 99);
    }

    progressFill.style.width = basePct + '%';
  }

  // schedule step transitions (same as before) but do not alter progress to 100% here
  const timeouts = [];
  if (steps.length > 0 && totalPositive > 0) {
    for (let i=0;i<steps.length;i++){
      const dur = Math.max(0, steps[i].duration || 0);
      const offset = stepStartOffsets[i] + dur;
      const t = setTimeout(() => {
        if (i + 1 < steps.length) {
          currentStep = i + 1;
          showStep(currentStep);
        } else {
          // last step: keep showing its message; progress remains capped if zero-duration
          currentStep = i;
          showStep(currentStep);
        }
      }, offset);
      timeouts.push(t);
    }
  } else if (steps.length > 0 && totalPositive === 0) {
    steps.forEach((s, idx) => {
      const t = setTimeout(() => { currentStep = idx; showStep(idx); }, idx * 150);
      timeouts.push(t);
    });
  }

  // run smooth interval
  const interval = setInterval(updateProgressSmooth, 180);
  updateProgressSmooth();

  // store handles for cleanup
  btn._mv_processing_handles = { interval, timeouts, progressFill };
}
  


function setButtonGenerated(btn) {
  // cleanup previous processing state if present
if (btn._mv_processing_handles) {
  const { interval, timeouts, progressFill } = btn._mv_processing_handles;
  if (interval) clearInterval(interval);
  if (Array.isArray(timeouts)) timeouts.forEach(t => clearTimeout(t));
  if (progressFill) progressFill.style.width = '100%'; // finalize visually
  delete btn._mv_processing_handles;
  btn.style.pointerEvents = '';
  btn.removeAttribute('aria-busy');
  btn.classList.remove('processing');
}

  btn.innerHTML = `<div class="mv-btn-main">Generated</div><div class="mv-btn-sub mv-sub-bottom">click to view</div>`;
  btn.classList.add('generated');
}

function setButtonFetching(btn) {
  btn.innerHTML = `<div class="mv-btn-main">Loading your video...</div>`;
}

function setButtonPodcastGenerating(btn) {
  // cleanup any previous processing handles
  if (btn._mv_processing_handles) {
    const { interval, timeouts, progressFill } = btn._mv_processing_handles;
    if (interval) clearInterval(interval);
    if (Array.isArray(timeouts)) timeouts.forEach(t => clearTimeout(t));
    if (progressFill) progressFill.style.width = '0%';
    delete btn._mv_processing_handles;
    btn.style.pointerEvents = '';
    btn.removeAttribute('aria-busy');
    btn.classList.remove('processing');
  }

  btn.classList.remove('generated');
  btn.classList.add('processing');
  btn.setAttribute('aria-busy', 'true');
  btn.style.pointerEvents = 'none';
  btn.innerHTML = '';

  const wrap = ce('div', { className: 'mv-processing' });
  const spinner = ce('div', { className: 'mv-spinner', title: 'Processing' });
  wrap.appendChild(spinner);
  const texts = ce('div', { style: 'display:flex;flex-direction:column;align-items:flex-start;' });
  const main = ce('div', { className: 'mv-btn-main' }, 'Creating Podcast');
  const sub = ce('div', { className: 'mv-btn-sub' }, 'Analyzing paper...');
  texts.appendChild(main);
  texts.appendChild(sub);
  wrap.appendChild(texts);
  const progWrap = ce('div', { style: 'display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-left:8px;' });
  const progressBar = ce('div', { className: 'mv-progress-wrap' });
  const progressFill = ce('div', { className: 'mv-progress-fill' });
  progressBar.appendChild(progressFill);
  progWrap.appendChild(progressBar);
  btn.appendChild(wrap);
  btn.appendChild(progWrap);

  // Podcast-specific timeline
  const PODCAST_STEPS = [
    { duration: 8000, message: 'Analyzing research paper' },
    { duration: 10000, message: 'Generating summary' },
    { duration: 12000, message: 'Creating dialogue script' },
    { duration: 15000, message: 'Generating voice narration' },
    { duration: 0, message: 'Finalizing podcast' }
  ];

  const steps = PODCAST_STEPS.slice();
  const durations = steps.map(s => Math.max(0, s.duration || 0));
  const totalPositive = durations.reduce((a,b)=>a+b, 0);

  let currentStep = 0;
  function showStep(idx) {
    if (idx < 0 || idx >= steps.length) return;
    const step = steps[idx];
    main.textContent = step.message || 'Creating Podcast...';
    sub.textContent = `Step ${idx + 1} of ${steps.length}`;
  }
  if (steps.length > 0) showStep(0);

  const startTs = Date.now();
  let stepStartOffsets = [];
  (function computeOffsets() {
    stepStartOffsets = [];
    let acc = 0;
    for (let i=0;i<steps.length;i++){
      stepStartOffsets.push(acc);
      acc += Math.max(0, steps[i].duration || 0);
    }
  })();

  function updateProgressSmooth() {
    const now = Date.now();

    if (totalPositive <= 0) {
      const t = Math.min(1, (now - startTs) / 20000);
      const pct = Math.round(65 * t);
      progressFill.style.width = pct + '%';
      return;
    }

    let completed = 0;
    for (let i=0;i<steps.length;i++){
      const stepDur = Math.max(0, steps[i].duration || 0);
      const stepStart = startTs + stepStartOffsets[i];
      if (now >= stepStart + stepDur) {
        completed += stepDur;
      } else if (now > stepStart) {
        completed += Math.max(0, now - stepStart);
      }
    }

    let basePct = Math.min(100, Math.round((completed / totalPositive) * 100));
    const lastIdx = steps.length - 1;
    const finalStepZero = steps.length > 0 && (steps[lastIdx].duration || 0) === 0;
    const onFinalStep = currentStep === lastIdx;

    if (finalStepZero && onFinalStep) {
      const MAX_BEFORE_FINISH = 90;
      basePct = Math.min(basePct, MAX_BEFORE_FINISH);
    } else {
      basePct = Math.min(basePct, 99);
    }

    progressFill.style.width = basePct + '%';
  }

  const timeouts = [];
  if (steps.length > 0 && totalPositive > 0) {
    for (let i=0;i<steps.length;i++){
      const dur = Math.max(0, steps[i].duration || 0);
      const offset = stepStartOffsets[i] + dur;
      const t = setTimeout(() => {
        if (i + 1 < steps.length) {
          currentStep = i + 1;
          showStep(currentStep);
        } else {
          currentStep = i;
          showStep(currentStep);
        }
      }, offset);
      timeouts.push(t);
    }
  }

  const interval = setInterval(updateProgressSmooth, 180);
  updateProgressSmooth();

  btn._mv_processing_handles = { interval, timeouts, progressFill };
}

function setButtonPodcastGenerated(btn) {
  // cleanup previous processing state
  if (btn._mv_processing_handles) {
    const { interval, timeouts, progressFill } = btn._mv_processing_handles;
    if (interval) clearInterval(interval);
    if (Array.isArray(timeouts)) timeouts.forEach(t => clearTimeout(t));
    if (progressFill) progressFill.style.width = '100%';
    delete btn._mv_processing_handles;
    btn.style.pointerEvents = '';
    btn.removeAttribute('aria-busy');
    btn.classList.remove('processing');
  }

  btn.innerHTML = `<div class="mv-btn-main">Podcast Ready</div><div class="mv-btn-sub mv-sub-bottom">click to listen</div>`;
  btn.classList.add('generated');
}

function setButtonPodcastFetching(btn) {
  btn.innerHTML = `<div class="mv-btn-main">Loading your podcast...</div>`;
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function handlePodcastGeneration(btn, language, storageKey, podcastStorageKey, paperId) {
  btn.disabled = true;
  setButtonPodcastGenerating(btn);

  const pageUrl = window.location.href;
  console.log('[preprint plugin] create podcast -> sending URL:', pageUrl, 'language:', language);

  const resp = await sendToWorker({ action: 'createPodcast', paperUrl: pageUrl, language });
  console.log('[preprint plugin] create podcast response:', resp);

  if (!resp || !resp.ok) {
    alert('Podcast creation failed: ' + (resp && resp.error ? resp.error : 'unknown'));
    btn.disabled = false;
    setButtonInitial(btn);
    return;
  }

  const body = resp.body || {};
  const podcastId = body.podcast_id || body.id || `podcast_${Date.now()}`;
  console.log('[preprint plugin] parsed podcast_id:', podcastId, body);
  
  if (!body.audio_base64) {
    // For testing - show success message even without audio
    if (body.note && body.note.includes('testing')) {
      alert('Podcast generation completed successfully! (Audio generation temporarily disabled for testing)');
      btn.disabled = false;
      setButtonInitial(btn);
      return;
    }
    alert('Podcast creation succeeded but no audio returned. See console.');
    btn.disabled = false;
    setButtonInitial(btn);
    return;
  }

  chrome.storage.local.set({ [podcastStorageKey]: podcastId }, () => {
    btn.dataset.podcastId = podcastId;
    btn.dataset.type = 'podcast';
    setButtonPodcastGenerated(btn);
    btn.disabled = false;
    console.log('[preprint plugin] stored podcast_id for', paperId, podcastId);
  });
}

async function main() {
  const paperInfo = getPaperIdFromUrl();
  if (!paperInfo) {
    console.log('[preprint plugin] No paper ID found on this page');
    return;
  }

  const { id: paperId, site } = paperInfo;
  console.log(`[preprint plugin] Detected ${site} paper:`, paperId);

  const btn = ce('button', { className: 'mv-generate-fixed', title: 'SARALify' });
  setButtonInitial(btn);
  document.body.appendChild(btn);

  const modal = createModalElements();
  const optionsModal = createOptionsModal();
  const languageModal = createLanguageModal();

  const storageKey = `mv_generated_${site}_${paperId}`;
  const podcastStorageKey = `mv_podcast_${site}_${paperId}`;
  
  chrome.storage.local.get([storageKey, podcastStorageKey], (items) => {
    const pid = items[storageKey];
    const podcastId = items[podcastStorageKey];
    if (pid) {
      btn.dataset.generatedId = pid;
      btn.dataset.type = 'video';
      setButtonGenerated(btn);
      console.log('[preprint plugin] loaded stored paper_id:', pid);
    } else if (podcastId) {
      btn.dataset.podcastId = podcastId;
      btn.dataset.type = 'podcast';
      setButtonPodcastGenerated(btn);
      console.log('[preprint plugin] loaded stored podcast_id:', podcastId);
    }
  });

  btn.addEventListener('click', async () => {
    if (!btn.dataset.generatedId && !btn.dataset.podcastId) {
      // Show options modal for new generation
      optionsModal.overlay.style.display = 'flex';
      optionsModal.closeBtn.onclick = () => { optionsModal.overlay.style.display = 'none'; };
      optionsModal.overlay.onclick = (e) => { if (e.target === optionsModal.overlay) optionsModal.overlay.style.display = 'none'; };

      // Video option
      optionsModal.videoBtn.onclick = async () => {
        optionsModal.overlay.style.display = 'none';
        btn.disabled = true;
        setButtonGenerating(btn);

        const pageUrl = window.location.href;
        console.log('[preprint plugin] create video -> sending URL:', pageUrl);

        const resp = await sendToWorker({ action: 'create', arxivUrl: pageUrl });
        console.log('[preprint plugin] create response:', resp);

        if (!resp || !resp.ok) {
          alert('Create failed: ' + (resp && resp.error ? resp.error : 'unknown'));
          btn.disabled = false;
          setButtonInitial(btn);
          return;
        }

        const body = resp.body || {};
        const generatedPaperId = body.paper_id || body.paperId || body.generated_paper_id || body.id;
        console.log('[preprint plugin] parsed paper_id:', generatedPaperId, body);
        
        if (!generatedPaperId) {
          alert('Create succeeded but did not return paper_id. See console.');
          btn.disabled = false;
          setButtonInitial(btn);
          return;
        }

        chrome.storage.local.set({ [storageKey]: generatedPaperId }, () => {
          btn.dataset.generatedId = generatedPaperId;
          btn.dataset.type = 'video';
          setButtonGenerated(btn);
          btn.disabled = false;
          console.log('[preprint plugin] stored paper_id for', paperId, generatedPaperId);
        });
      };

      // Podcast option
      optionsModal.podcastBtn.onclick = () => {
        optionsModal.overlay.style.display = 'none';
        languageModal.overlay.style.display = 'flex';
        languageModal.closeBtn.onclick = () => { languageModal.overlay.style.display = 'none'; };
        languageModal.overlay.onclick = (e) => { if (e.target === languageModal.overlay) languageModal.overlay.style.display = 'none'; };

        // English option
        languageModal.englishBtn.onclick = async () => {
          languageModal.overlay.style.display = 'none';
          await handlePodcastGeneration(btn, 'english', storageKey, podcastStorageKey, paperId);
        };

        // Hindi option
        languageModal.hindiBtn.onclick = async () => {
          languageModal.overlay.style.display = 'none';
          await handlePodcastGeneration(btn, 'hindi', storageKey, podcastStorageKey, paperId);
        };
      };

    } else if (btn.dataset.generatedId && btn.dataset.type === 'video') {
      // GENERATED VIDEO -> fetch video
      const generatedId = btn.dataset.generatedId;
      btn.disabled = true;
      setButtonFetching(btn);
      console.log('[preprint plugin] getVideo ->', generatedId);
      
      const resp = await sendToWorker({ action: 'getVideo', generatedId });
      console.log('[preprint plugin] getVideo response:', resp);

      if (!resp || !resp.ok) {
        alert('Failed to get video: ' + (resp && resp.error ? resp.error : 'unknown'));
        btn.disabled = false;
        setButtonGenerated(btn);
        return;
      }

      const body = resp.body || {};
      let videoSrc = null;

      if (body.video_url) {
        videoSrc = body.video_url;
      } else if (body.video_base64) {
        try {
          videoSrc = base64ToBlobUrl(body.video_base64, body.contentType || 'video/mp4');
        } catch (e) {
          console.error('[preprint plugin] base64->blob failed:', e);
          alert('Failed to prepare video from binary. See console.');
          btn.disabled = false;
          setButtonGenerated(btn);
          return;
        }
      } else if (body.video_path && body.video_path.endsWith('.mp4') && body.video_domain) {
        videoSrc = `${body.video_domain}/${body.video_path}`;
      } else if (body.video_path && body.video_path.endsWith('.mp4')) {
        videoSrc = `${location.origin}/${body.video_path}`;
      } else {
        console.warn('[preprint plugin] unexpected getVideo body:', body);
      }

      if (!videoSrc) {
        alert('No usable video returned by server. See console for full response.');
        btn.disabled = false;
        setButtonGenerated(btn);
        return;
      }

      modal.videoContainer.innerHTML = '';
      const videoEl = ce('video', { controls: true, src: videoSrc, style: 'max-height:70vh;width:100%' });
      modal.videoContainer.appendChild(videoEl);

      modal.overlay.style.display = 'flex';
      modal.closeBtn.onclick = () => { modal.overlay.style.display = 'none'; };
      modal.overlay.onclick = (e) => { if (e.target === modal.overlay) modal.overlay.style.display = 'none'; };

      modal.downloadBtn.onclick = async () => {
        modal.downloadBtn.disabled = true;
        modal.downloadBtn.textContent = 'Downloading...';
        console.log('[preprint plugin] download requested for', btn.dataset.generatedId);

        const dresp = await sendToWorker({ action: 'download', generatedId: btn.dataset.generatedId });
        console.log('[preprint plugin] download response:', dresp);

        if (!dresp || !dresp.ok) {
          alert('Download failed: ' + (dresp && dresp.error ? dresp.error : 'unknown'));
        } else {
          const dbody = dresp.body || {};
          
          if (dbody.json && (dbody.json.download_url || dbody.json.video_url)) {
            const url = dbody.json.download_url || dbody.json.video_url;
            const filename = dbody.json.filename || `${btn.dataset.generatedId}.mp4`;
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            alert('Download started (via remote URL).');
          } else if (dbody.arrayBuffer) {
            try {
              const ab = dbody.arrayBuffer;
              const ct = dbody.contentType || 'video/mp4';
              const cd = dbody.contentDisposition || '';
              let filename = `${btn.dataset.generatedId}.mp4`;
              if (cd) {
                const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(cd);
                if (m) filename = decodeURIComponent((m[1] || m[2] || filename).replace(/['"]/g, ''));
              }
              const blob = new Blob([new Uint8Array(ab)], { type: ct });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => URL.revokeObjectURL(url), 60000);
            } catch (e) {
              console.error('[preprint plugin] blob download failed:', e);
              alert('Download failed: ' + e.message);
            }
          } else if (dbody.finalUrl) {
            const a = document.createElement('a');
            a.href = dbody.finalUrl;
            a.download = `${btn.dataset.generatedId}.mp4`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            alert('Download started (fallback).');
          } else {
            alert('Download response did not include usable data.');
          }
        }

        modal.downloadBtn.disabled = false;
        modal.downloadBtn.textContent = '⬇ Download';
      };

      btn.disabled = false;
      setButtonGenerated(btn);

    } else if (btn.dataset.podcastId && btn.dataset.type === 'podcast') {
      // GENERATED PODCAST -> fetch podcast
      const podcastId = btn.dataset.podcastId;
      btn.disabled = true;
      setButtonPodcastFetching(btn);
      console.log('[preprint plugin] getPodcast ->', podcastId);
      
      const resp = await sendToWorker({ action: 'getPodcast', podcastId });
      console.log('[preprint plugin] getPodcast response:', resp);

      if (!resp || !resp.ok) {
        alert('Failed to get podcast: ' + (resp && resp.error ? resp.error : 'unknown'));
        btn.disabled = false;
        setButtonPodcastGenerated(btn);
        return;
      }

      const body = resp.body || {};
      let audioSrc = null;

      if (body.audio_base64) {
        try {
          audioSrc = base64ToBlobUrl(body.audio_base64, 'audio/wav');
        } catch (e) {
          console.error('[preprint plugin] base64->blob failed:', e);
          alert('Failed to prepare audio from binary. See console.');
          btn.disabled = false;
          setButtonPodcastGenerated(btn);
          return;
        }
      } else {
        console.warn('[preprint plugin] unexpected getPodcast body:', body);
      }

      if (!audioSrc) {
        alert('No usable audio returned by server. See console for full response.');
        btn.disabled = false;
        setButtonPodcastGenerated(btn);
        return;
      }

      modal.videoContainer.innerHTML = '';
      const audioEl = ce('audio', { controls: true, src: audioSrc, style: 'max-height:70vh;width:100%' });
      modal.videoContainer.appendChild(audioEl);

      modal.overlay.style.display = 'flex';
      modal.closeBtn.onclick = () => { modal.overlay.style.display = 'none'; };
      modal.overlay.onclick = (e) => { if (e.target === modal.overlay) modal.overlay.style.display = 'none'; };

      modal.downloadBtn.onclick = async () => {
        modal.downloadBtn.disabled = true;
        modal.downloadBtn.textContent = 'Downloading...';
        
        try {
          const blob = new Blob([new Uint8Array(base64ToUint8Array(body.audio_base64))], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${podcastId}.wav`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (e) {
          console.error('[preprint plugin] podcast download failed:', e);
          alert('Download failed: ' + e.message);
        }

        modal.downloadBtn.disabled = false;
        modal.downloadBtn.textContent = '⬇ Download';
      };

      btn.disabled = false;
      setButtonPodcastGenerated(btn);
    }
  });
}

// Wait longer for dynamic sites like EarthArXiv
if (window.addEventListener) {
  window.addEventListener('load', () => {
    const host = location.hostname;
    // EarthArXiv and some sites need more time to render
    const delay = host.includes('eartharxiv') || host.includes('osf.io') ? 2000 : 500;
    setTimeout(main, delay);
  });
}