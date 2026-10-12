/**
 * Deutsch Mark Academy — Marketing Super Intelligence (DMA MSI)
 * Pure Vanilla JavaScript Frontend Controller with Firebase Auth
 */

import { 
  onAuthChange, 
  signUpStudent, 
  signInStudent, 
  signInWithGoogle, 
  signOutStudent, 
  getCurrentStudent, 
  getStudentToken 
} from './firebase-auth.js';

// Mode Configurations
const MODES = {
  grader: {
    title: 'Sales Page Grader (100-Point Score)',
    label: 'Paste your web page or sales words here',
    placeholder: 'Paste your headline, top section, or full page here...\n\nExample:\n"Are you tired of losing clients? We help you get 10 new calls this month..."',
    helper: 'Tip: Include your headline and your offer for the best score.',
    btnText: 'Check This Page',
    presets: [
      { text: 'Sample Agency Offer', value: 'Attention Agency Owners: Stop relying on luck. Our client system guarantees 10 qualified sales calls in 30 days or you pay nothing. We build your email system and train your team. $3,500/month. Book a call today.' },
      { text: 'Sample Course Page', value: 'Learn High-Income Copywriting! In this 6-week class, I teach you how to write words that sell and find real clients. Normal price $497, on sale today for $97.' }
    ]
  },
  copywriter: {
    title: 'Sales & Ad Writer',
    label: 'What do you want Osas Ai to write?',
    placeholder: 'Tell me what you need (like: "Write 3 simple emails to sell a fitness program to busy moms")...',
    helper: 'Tip: Tell me who you are selling to and how much it costs.',
    btnText: 'Write My Copy',
    presets: [
      { text: 'Simple Cold Email', value: 'Write a short, friendly cold email to busy business owners offering a free 10-minute check of their website.' },
      { text: 'Attention-Grabbing Video Intro', value: 'Write an exciting video intro (first 30 seconds) for a fitness program made for busy parents who have no time for long workouts.' },
      { text: '3-Part Flash Sale Emails', value: 'Write 3 short emails for a quick 48-hour discount sale on our marketing guide.' }
    ]
  },
  hooks: {
    title: 'The Hook Maker',
    label: 'What is your topic or product?',
    placeholder: 'Type your main idea or product (like: "How to save money on food" or "Fitness for busy dads")...',
    helper: 'Gives you 10+ catchy lines that stop people from scrolling.',
    btnText: 'Make 10+ Catchy Hooks',
    presets: [
      { text: 'Freelance Design', value: 'Getting high-paying design clients without sending awkward cold messages.' },
      { text: 'Social Media Ads', value: 'Running simple Facebook and Instagram ads that bring in real customers on a small budget.' },
      { text: 'Closing Deals', value: 'Talking with interested buyers on phone calls without sounding pushy or dishonest.' }
    ]
  },
  scripts: {
    title: 'Short Video Script Maker',
    label: 'What is your video about?',
    placeholder: 'Describe your video idea, where you will post it (TikTok, Reels, or Shorts), and what you want viewers to do...',
    helper: 'Includes simple directions on what to say and what to show on screen.',
    btnText: 'Make Video Script',
    presets: [
      { text: '60s Short Video', value: 'A 60-second video explaining why charging too little actually makes people doubt your quality, for coaches and freelancers.' },
      { text: 'Simple Student Story', value: 'A quick 45-second story showing how someone went from zero to their first paying client using a simple 2-step checkup.' }
    ]
  },
  general: {
    title: 'Ask Osas Ai',
    label: 'Ask any business or sales question',
    placeholder: 'Ask your question in simple words (like: "Why are people clicking on my page but not buying?" or "How should I price my service?")...',
    helper: 'Get honest, direct advice you can use today.',
    btnText: 'Ask Osas Ai',
    presets: [
      { text: 'Why Nobody Buys', value: 'My page got 500 visits, people clicked my button, but zero people bought. What are the top 3 simple things I should check first?' },
      { text: 'Safe Guarantee Idea', value: 'I sell a $1,000 service. How can I make a strong promise or guarantee so people feel safe buying without getting scammed?' }
    ]
  }
};

let currentMode = 'grader';

// DOM Elements - Studio
const modeTabs = document.getElementById('modeTabs');
const inputLabel = document.getElementById('inputLabel');
const contextInput = document.getElementById('contextInput');
const promptInput = document.getElementById('promptInput');
const helperText = document.getElementById('helperText');
const generateBtn = document.getElementById('generateBtn');
const btnText = generateBtn.querySelector('.btn-text');
const loaderSpinner = generateBtn.querySelector('.loader-spinner');
const presetGroup = document.getElementById('presetGroup');
const outputContent = document.getElementById('outputContent');
const outputTitle = document.getElementById('outputTitle');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const studioGateOverlay = document.getElementById('studioGateOverlay');

// DOM Elements - Auth
const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const gateLoginBtn = document.getElementById('gateLoginBtn');
const userProfileBadge = document.getElementById('userProfileBadge');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const signOutBtn = document.getElementById('signOutBtn');

const authModal = document.getElementById('authModal');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const tabSignIn = document.getElementById('tabSignIn');
const tabSignUp = document.getElementById('tabSignUp');
const authModalTitle = document.getElementById('authModalTitle');
const authModalSubtitle = document.getElementById('authModalSubtitle');
const googleAuthBtn = document.getElementById('googleAuthBtn');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authBtnText = authSubmitBtn.querySelector('.auth-btn-text');
const authSpinner = authSubmitBtn.querySelector('.auth-spinner');
const authErrorMsg = document.getElementById('authErrorMsg');

let authMode = 'signin'; // 'signin' or 'signup'

// ================= Auth Modal Handlers =================
function openAuth(mode = 'signin') {
  authMode = mode;
  updateAuthModeUI();
  authErrorMsg.style.display = 'none';
  authErrorMsg.textContent = '';
  authModal.style.display = 'flex';
  authEmail.focus();
}

function closeAuth() {
  authModal.style.display = 'none';
  authErrorMsg.style.display = 'none';
  authForm.reset();
}

function updateAuthModeUI() {
  if (authMode === 'signin') {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    authModalTitle.textContent = 'Student Sign In';
    authModalSubtitle.textContent = 'Sign in to access Deutsch Mark Academy Super Intelligence';
    authBtnText.textContent = 'Sign In';
  } else {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    authModalTitle.textContent = 'Create Academy Account';
    authModalSubtitle.textContent = 'Register your student credentials to unlock the AI';
    authBtnText.textContent = 'Create Student Account';
  }
}

tabSignIn.addEventListener('click', () => {
  authMode = 'signin';
  updateAuthModeUI();
});

tabSignUp.addEventListener('click', () => {
  authMode = 'signup';
  updateAuthModeUI();
});

openAuthModalBtn.addEventListener('click', () => openAuth('signin'));
gateLoginBtn.addEventListener('click', () => openAuth('signin'));
closeAuthModalBtn.addEventListener('click', closeAuth);

// Close modal when clicking on backdrop outside card
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) {
    closeAuth();
  }
});

// Friendly Firebase Error message translator
function getFriendlyError(err) {
  const code = err.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (code.includes('email-already-in-use')) {
    return 'An account already exists with this email. Switch to "Sign In" above.';
  }
  if (code.includes('weak-password')) {
    return 'Password should be at least 6 characters.';
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('popup-closed-by-user')) {
    return 'Google Sign-In was cancelled.';
  }
  return err.message || 'An error occurred during authentication.';
}

// Handle Email / Password Submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) return;

  // Set loading state
  authSubmitBtn.disabled = true;
  authBtnText.style.display = 'none';
  authSpinner.style.display = 'inline-block';
  authErrorMsg.style.display = 'none';

  try {
    if (authMode === 'signup') {
      await signUpStudent(email, password);
      showToast('Account created! Welcome to Osas Ai.');
    } else {
      await signInStudent(email, password);
      showToast('Welcome back!');
    }
    closeAuth();
  } catch (err) {
    console.error('Auth error:', err);
    authErrorMsg.textContent = getFriendlyError(err);
    authErrorMsg.style.display = 'block';
  } finally {
    authSubmitBtn.disabled = false;
    authBtnText.style.display = 'inline-block';
    authSpinner.style.display = 'none';
  }
});

// Handle Google Auth
googleAuthBtn.addEventListener('click', async () => {
  authErrorMsg.style.display = 'none';
  try {
    await signInWithGoogle();
    showToast('Signed in with Google!');
    closeAuth();
  } catch (err) {
    console.error('Google Auth error:', err);
    authErrorMsg.textContent = getFriendlyError(err);
    authErrorMsg.style.display = 'block';
  }
});

// Handle Sign Out
signOutBtn.addEventListener('click', async () => {
  try {
    await signOutStudent();
    showToast('Signed out successfully.');
  } catch (err) {
    console.error('Sign out error:', err);
  }
});

// Listen to Auth State Changes
onAuthChange((user) => {
  if (user) {
    // User is logged in
    openAuthModalBtn.style.display = 'none';
    userProfileBadge.style.display = 'flex';
    userEmailDisplay.textContent = user.email || user.displayName || 'Student';
    studioGateOverlay.style.display = 'none';
  } else {
    // User is logged out
    openAuthModalBtn.style.display = 'inline-block';
    userProfileBadge.style.display = 'none';
    studioGateOverlay.style.display = 'flex';
  }
});

// ================= Studio UI Handlers =================
function updateModeUI(mode) {
  currentMode = mode;
  const config = MODES[mode] || MODES.general;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  inputLabel.textContent = config.label;
  promptInput.placeholder = config.placeholder;
  helperText.textContent = config.helper;
  btnText.textContent = config.btnText;
  outputTitle.textContent = config.title;

  presetGroup.innerHTML = '';
  config.presets.forEach(preset => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'preset-chip';
    chip.textContent = preset.text;
    chip.addEventListener('click', () => {
      promptInput.value = preset.value;
      promptInput.focus();
    });
    presetGroup.appendChild(chip);
  });
}

modeTabs.addEventListener('click', (e) => {
  const target = e.target.closest('.tab-btn');
  if (!target) return;
  const mode = target.dataset.mode;
  if (mode && MODES[mode]) {
    updateModeUI(mode);
  }
});

// Markdown Renderer
function parseMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/gim, '<em>$1</em>');
  html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');

  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<pre')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return html;
}

function showToast(message) {
  const existing = document.querySelector('.toast-notice');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// Generate Response via API
async function handleGenerate() {
  const user = getCurrentStudent();
  if (!user) {
    openAuth('signin');
    showToast('Please sign in first to access the studio.');
    return;
  }

  const message = promptInput.value.trim();
  const context = contextInput.value.trim();

  if (!message) {
    promptInput.focus();
    showToast('Please enter your copy or question first!');
    return;
  }

  // Set Loading State
  generateBtn.disabled = true;
  btnText.style.display = 'none';
  loaderSpinner.style.display = 'inline-block';
  
  outputContent.innerHTML = `
    <div class="empty-state">
      <div class="loader-spinner" style="width: 32px; height: 32px; border-width: 3px; border-top-color: var(--gold-light);"></div>
      <h4 style="margin-top: 16px; color: var(--gold-light);">Osas Ai is thinking...</h4>
      <p>Looking through the best sales books and rules to help you...</p>
    </div>
  `;

  try {
    const token = await getStudentToken();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        mode: currentMode,
        message: message,
        context: context
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || 'Something went wrong while talking to Osas Ai.';
      const errorDetails = data.details ? `<br><small style="color: var(--text-muted);">${data.details}</small>` : '';
      
      outputContent.innerHTML = `
        <div style="padding: 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 8px;">
          <h4 style="color: var(--accent-red); margin-bottom: 8px;">⚠️ Osas Ai Notice</h4>
          <p style="color: #fca5a5; font-size: 0.95rem;">${errorMsg}</p>
          ${errorDetails}
        </div>
      `;
      return;
    }

    outputContent.innerHTML = parseMarkdown(data.text);

  } catch (err) {
    console.error('Fetch error:', err);
    outputContent.innerHTML = `
      <div style="padding: 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 8px;">
        <h4 style="color: var(--accent-red); margin-bottom: 8px;">Connection Error</h4>
        <p style="color: #fca5a5;">Could not reach the Osas Ai server (/api/chat). Make sure your local server is running or check your connection.</p>
      </div>
    `;
  } finally {
    generateBtn.disabled = false;
    btnText.style.display = 'inline-block';
    loaderSpinner.style.display = 'none';
  }
}

copyBtn.addEventListener('click', () => {
  const text = outputContent.innerText;
  if (!text || text.includes('Osas Ai is Ready')) {
    showToast('Nothing to copy yet!');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard! 📋');
  }).catch(() => {
    showToast('Failed to copy to clipboard.');
  });
});

clearBtn.addEventListener('click', () => {
  promptInput.value = '';
  contextInput.value = '';
  outputContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">💎</div>
      <h4>Osas Ai is Ready</h4>
      <p>Pick a tool above, paste your words, and click <strong>Let Osas Ai Write</strong>.</p>
    </div>
  `;
  showToast('Cleared!');
});

generateBtn.addEventListener('click', handleGenerate);

// Initialize default mode
updateModeUI('grader');
