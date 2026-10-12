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
    title: 'Sales Page & Copy Grader (100-Point Audit)',
    label: 'Paste Sales Page Copy or Lead Section',
    placeholder: 'Paste your headline, opening hook, or full sales letter copy here...\n\nExample:\n"Are you tired of losing clients? Join our 4-week program and learn the secrets of scaling..."',
    helper: 'Tip: Include the headline, lead, and call-to-action for the most accurate letter grade.',
    btnText: 'Audit & Grade This Copy',
    presets: [
      { text: 'Sample Agency Sales Pitch', value: 'Attention Agency Owners: Stop relying on referrals. Our Client Engine guarantees 10 qualified sales calls in 30 days or you pay nothing. We build your outbound pipeline, write your cold emails, and train your SDRs. Investment is $3,500/mo. Book a call today.' },
      { text: 'Sample Course Landing Page', value: 'Learn High-Income Copywriting in 2026! In this 6-module masterclass, I teach you everything about grammar, sales letters, and how to find clients on Upwork. Normal price $497, on sale now for $97.' }
    ]
  },
  copywriter: {
    title: 'Direct-Response Copy Chief',
    label: 'What copy do you need written?',
    placeholder: 'Specify what you need (e.g., "Write a 3-part welcome email sequence for a $2,000 real estate coaching program targeting burnt-out agents")...',
    helper: 'Tip: Mention your price, target audience, and main objection.',
    btnText: 'Generate Direct-Response Copy',
    presets: [
      { text: 'High-Converting Cold Email', value: 'Write a high-converting cold email to B2B SaaS CEOs offering an audit of their onboarding sequence. Emphasize reducing day-1 churn.' },
      { text: 'VSL Opening Lead (Eugene Schwartz)', value: 'Write a compelling VSL opening lead (first 2 minutes) for a fitness program designed for 40+ busy executives who don\'t have time for 2-hour gym sessions.' },
      { text: '3-Part Flash Sale Sequence', value: 'Write a 3-part urgency-driven email sequence for a 48-hour flash sale on our flagship marketing blueprint.' }
    ]
  },
  hooks: {
    title: '5-Vector Hook Matrix',
    label: 'What is your topic or offer?',
    placeholder: 'Enter your core topic, product, or audience (e.g. "Selling high-ticket fitness coaching to busy fathers" or "E-commerce email marketing")...',
    helper: 'Produces 10+ hooks: Contrarian, Curiosity Gap, Bleeding Neck, Case Study & Secret Mechanism.',
    btnText: 'Generate 10+ Viral Hooks',
    presets: [
      { text: 'Freelance Lead Gen', value: 'Organic client acquisition for freelance designers without sending spam DMs.' },
      { text: 'Paid Meta Ads in 2026', value: 'Running profitable Facebook & Instagram ads in 2026 despite rising CPMs and strict tracking.' },
      { text: 'High-Ticket Sales', value: 'Closing high-ticket clients on Zoom calls without being pushy or using sleazy objection tactics.' }
    ]
  },
  scripts: {
    title: 'High-Retention Video Script Lab',
    label: 'What is your video topic and goal?',
    placeholder: 'Describe the video concept, platform (TikTok/Reel/YouTube Short), and desired call-to-action (e.g. "A 60-second Reel explaining why price is never the real objection, ending with CTA to comment \'BLUEPRINT\'")...',
    helper: 'Includes on-screen text overlays, visual pattern interrupts, and timed retention cues.',
    btnText: 'Generate Concept Script',
    presets: [
      { text: 'Contrarian 60s Reel', value: 'A 60-second TikTok/Reel explaining why lower pricing actually destroys client trust, directed at coaches and consultants.' },
      { text: 'Story-Driven Case Study', value: 'A 45-second high-energy video sharing how a student went from zero to their first $5k client using a simple 2-step audit strategy.' }
    ]
  },
  general: {
    title: 'DMA Mastermind — Ask The Brain',
    label: 'Ask the DMA Founder anything marketing or business related',
    placeholder: 'Ask strategic questions (e.g. "How should I structure my backend offer to increase customer lifetime value?" or "How do I diagnose why my funnel has a 1.2% checkout conversion?")...',
    helper: 'Direct bridge to the founder\'s direct-response marketing philosophies.',
    btnText: 'Consult The Brain',
    presets: [
      { text: 'Diagnose Low Conversions', value: 'My sales page has 800 visits, 4% clickthrough to checkout, but 0 sales. What are the top 3 friction points I must audit first?' },
      { text: 'Pricing & Guarantee Strategy', value: 'I sell a $1,500 done-with-you program. How do I construct a bold, risk-reversing guarantee that doesn\'t leave me exposed to refund scammers?' }
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
      showToast('Account created! Welcome to DMA MSI.');
    } else {
      await signInStudent(email, password);
      showToast('Welcome back, Student!');
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
      <h4 style="margin-top: 16px; color: var(--gold-light);">DMA MSI Processing...</h4>
      <p>Filtering through direct-response doctrine and academy frameworks...</p>
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
      const errorMsg = data.error || 'Failed to communicate with intelligence engine.';
      const errorDetails = data.details ? `<br><small style="color: var(--text-muted);">${data.details}</small>` : '';
      
      outputContent.innerHTML = `
        <div style="padding: 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 8px;">
          <h4 style="color: var(--accent-red); margin-bottom: 8px;">⚠️ Intelligence Engine Notice</h4>
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
        <p style="color: #fca5a5;">Could not reach the server endpoint (/api/chat). Make sure your local server is running or check your network connection.</p>
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
  if (!text || text.includes('DMA MSI Ready for Input')) {
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
      <h4>DMA MSI Ready for Input</h4>
      <p>Choose an operational mode on the top, paste your copy or question, and click <strong>Run Intelligence Analysis</strong>.</p>
    </div>
  `;
  showToast('Cleared!');
});

generateBtn.addEventListener('click', handleGenerate);

// Initialize default mode
updateModeUI('grader');
