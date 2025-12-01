// Simple state management
const state = {
  token: localStorage.getItem('token'),
  user: null,
  selectedPlatform: null,
  topicMethod: null,
  topic: null,
  generatedPost: null
};

// DOM elements
const authScreen = document.getElementById('auth-screen');
const verifyScreen = document.getElementById('verify-screen');
const mainScreen = document.getElementById('main-screen');
const authForm = document.getElementById('auth-form');
const authMessage = document.getElementById('auth-message');
const verifyMessage = document.getElementById('verify-message');
const logoutBtn = document.getElementById('logout-btn');
const verificationBanner = document.getElementById('verification-banner');
const resendVerificationBtn = document.getElementById('resend-verification-btn');

// Initialize app
async function init() {
  // Check for verification token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const verifyToken = urlParams.get('token');
  
  if (verifyToken) {
    await handleEmailVerification(verifyToken);
    return;
  }
  
  if (state.token) {
    // Verify token is still valid
    try {
      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        state.user = data.user;
        showMainScreen();
      } else {
        // Token invalid, clear and show auth
        state.token = null;
        localStorage.removeItem('token');
        showAuthScreen();
      }
    } catch (error) {
      showAuthScreen();
    }
  } else {
    showAuthScreen();
  }
}

// Handle email verification from URL
async function handleEmailVerification(token) {
  showVerifyScreen();
  verifyMessage.innerHTML = '<p class="text-yellow-400">Verifying your email...</p>';
  
  try {
    const response = await fetch(`/api/auth/verify-email?token=${token}`);
    const data = await response.json();
    
    if (response.ok) {
      verifyMessage.innerHTML = `
        <p class="text-green-400 mb-2">✓ ${data.message}</p>
        <p class="text-sm">You can now log in to your account.</p>
      `;
    } else {
      verifyMessage.innerHTML = `
        <p class="text-red-400 mb-2">✗ ${data.error}</p>
        <p class="text-sm">The verification link may have expired. Please request a new one.</p>
      `;
    }
  } catch (error) {
    verifyMessage.innerHTML = '<p class="text-red-400">Failed to verify email. Please try again.</p>';
  }
  
  // Clear URL parameters
  window.history.replaceState({}, document.title, window.location.pathname);
}

function showAuthScreen() {
  authScreen.classList.remove('hidden');
  verifyScreen.classList.add('hidden');
  mainScreen.classList.add('hidden');
}

function showVerifyScreen() {
  authScreen.classList.add('hidden');
  verifyScreen.classList.remove('hidden');
  mainScreen.classList.add('hidden');
}

function showMainScreen() {
  authScreen.classList.add('hidden');
  verifyScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  
  // Show verification banner if email not verified
  if (state.user && !state.user.emailVerified) {
    verificationBanner.classList.remove('hidden');
  } else {
    verificationBanner.classList.add('hidden');
  }
  
  showStep('step-platform');
}

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.className = isError ? 'mt-4 text-red-400' : 'mt-4 text-yellow-400';
}

// Auth form handler
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const action = e.submitter.dataset.action;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Basic validation
  if (!email || !password) {
    showMessage('Please enter email and password', true);
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', true);
    return;
  }

  showMessage('Processing...');

  try {
    const response = await fetch(`/api/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      
      if (action === 'signup') {
        showMessage('Account created! Please check your email to verify your account.');
      } else {
        showMessage('Login successful!');
      }
      
      setTimeout(showMainScreen, 1500);
    } else {
      showMessage(data.error || 'Authentication failed', true);
    }
  } catch (error) {
    showMessage('Connection error. Please try again.', true);
  }
});

// Resend verification email handler
resendVerificationBtn.addEventListener('click', async () => {
  if (!state.user || !state.user.email) return;
  
  resendVerificationBtn.disabled = true;
  resendVerificationBtn.textContent = 'SENDING...';
  
  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.user.email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('✓ Verification email sent! Please check your inbox.');
    } else {
      alert('✗ ' + (data.error || 'Failed to send email'));
    }
  } catch (error) {
    alert('✗ Connection error. Please try again.');
  } finally {
    resendVerificationBtn.disabled = false;
    resendVerificationBtn.textContent = 'RESEND VERIFICATION EMAIL';
  }
});

// Back to auth button
document.getElementById('back-to-auth').addEventListener('click', () => {
  showAuthScreen();
});

// Logout handler
logoutBtn.addEventListener('click', () => {
  state.token = null;
  localStorage.removeItem('token');
  showAuthScreen();
  authForm.reset();
  showMessage('');
  resetFlow();
});

// Flow management
function showStep(stepId) {
  ['step-platform', 'step-topic', 'step-input', 'step-result'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(stepId).classList.remove('hidden');
}

function resetFlow() {
  state.selectedPlatform = null;
  state.topicMethod = null;
  state.topic = null;
  state.generatedPost = null;
  showStep('step-platform');
}

// Platform selection
document.querySelectorAll('.platform-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.selectedPlatform = btn.dataset.platform;
    document.getElementById('selected-platform').textContent = btn.textContent;
    document.getElementById('selected-platform-2').textContent = btn.textContent;
    document.getElementById('selected-platform-3').textContent = btn.textContent;
    showStep('step-topic');
  });
});

// Topic method selection
document.getElementById('topic-manual-btn').addEventListener('click', () => {
  state.topicMethod = 'manual';
  document.getElementById('input-title').textContent = 'ENTER TOPIC';
  document.getElementById('manual-input').classList.remove('hidden');
  document.getElementById('suggestions-input').classList.add('hidden');
  document.getElementById('quotes-input').classList.add('hidden');
  showStep('step-input');
});

document.getElementById('topic-suggestions-btn').addEventListener('click', async () => {
  state.topicMethod = 'suggestions';
  document.getElementById('input-title').textContent = 'SELECT SUGGESTION';
  document.getElementById('manual-input').classList.add('hidden');
  document.getElementById('suggestions-input').classList.remove('hidden');
  document.getElementById('quotes-input').classList.add('hidden');
  showStep('step-input');
  await loadSuggestions();
});

document.getElementById('topic-quotes-btn').addEventListener('click', async () => {
  state.topicMethod = 'quotes';
  document.getElementById('input-title').textContent = 'SELECT QUOTE';
  document.getElementById('manual-input').classList.add('hidden');
  document.getElementById('suggestions-input').classList.add('hidden');
  document.getElementById('quotes-input').classList.remove('hidden');
  showStep('step-input');
  await loadQuotes();
});

// Load suggestions
async function loadSuggestions() {
  const list = document.getElementById('suggestions-list');
  list.innerHTML = '<p class="text-yellow-400">Loading...</p>';
  
  try {
    const response = await fetch(`/api/suggestions?platform=${state.selectedPlatform}`);
    const data = await response.json();
    
    list.innerHTML = data.suggestions.map(s => 
      `<button class="suggestion-item w-full border border-green-400 p-3 text-left hover:bg-green-400 hover:text-black" data-topic="${s}">${s}</button>`
    ).join('');
    
    document.querySelectorAll('.suggestion-item').forEach(btn => {
      btn.addEventListener('click', () => {
        state.topic = btn.dataset.topic;
        document.getElementById('topic-text').value = state.topic;
      });
    });
  } catch (error) {
    list.innerHTML = '<p class="text-red-400">Error loading suggestions</p>';
  }
}

// Load quotes
async function loadQuotes() {
  const list = document.getElementById('quotes-list');
  list.innerHTML = '<p class="text-yellow-400">Loading...</p>';
  
  try {
    const response = await fetch('/api/quotes');
    const data = await response.json();
    
    list.innerHTML = data.quotes.map(q => 
      `<button class="quote-item w-full border border-green-400 p-3 text-left hover:bg-green-400 hover:text-black" data-topic="${q.text}">
        <div class="font-bold">"${q.text}"</div>
        <div class="text-sm">- ${q.author}</div>
      </button>`
    ).join('');
    
    document.querySelectorAll('.quote-item').forEach(btn => {
      btn.addEventListener('click', () => {
        state.topic = btn.dataset.topic;
        document.getElementById('topic-text').value = state.topic;
      });
    });
  } catch (error) {
    list.innerHTML = '<p class="text-red-400">Error loading quotes</p>';
  }
}

// Generate post
document.getElementById('generate-btn').addEventListener('click', async () => {
  const topicText = document.getElementById('topic-text').value.trim();
  
  if (!topicText) {
    alert('Please enter or select a topic');
    return;
  }
  
  state.topic = topicText;
  
  // Show loading
  showStep('step-result');
  document.getElementById('generated-text').textContent = 'GENERATING...';
  document.getElementById('generated-image').querySelector('pre').textContent = 'GENERATING...';
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        platform: state.selectedPlatform,
        topic: state.topic
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 403) {
        // Email verification required
        document.getElementById('generated-text').textContent = '⚠ Email Verification Required';
        document.getElementById('generated-image').querySelector('pre').textContent = 
          'Please verify your email address to generate posts.\n\nCheck your inbox for the verification email.';
        return;
      }
      throw new Error(data.error || 'Failed to generate post');
    }
    
    state.generatedPost = data;
    
    document.getElementById('generated-text').textContent = data.text;
    document.getElementById('generated-image').querySelector('pre').textContent = data.asciiArt;
  } catch (error) {
    document.getElementById('generated-text').textContent = 'Error generating post. Please try again.';
    document.getElementById('generated-image').querySelector('pre').textContent = error.message || 'An error occurred';
  }
});

// Copy text
document.getElementById('copy-btn').addEventListener('click', () => {
  const text = document.getElementById('generated-text').textContent;
  navigator.clipboard.writeText(text);
  document.getElementById('result-message').textContent = 'Text copied to clipboard!';
  setTimeout(() => {
    document.getElementById('result-message').textContent = '';
  }, 2000);
});

// Download image
document.getElementById('download-btn').addEventListener('click', () => {
  const ascii = document.getElementById('generated-image').querySelector('pre').textContent;
  const blob = new Blob([ascii], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ascii-art.txt';
  a.click();
  URL.revokeObjectURL(url);
  document.getElementById('result-message').textContent = 'ASCII art downloaded!';
  setTimeout(() => {
    document.getElementById('result-message').textContent = '';
  }, 2000);
});

// New post
document.getElementById('new-post-btn').addEventListener('click', resetFlow);

// Back buttons
document.getElementById('back-to-platform').addEventListener('click', () => showStep('step-platform'));
document.getElementById('back-to-topic').addEventListener('click', () => showStep('step-topic'));

// Start app
init();
