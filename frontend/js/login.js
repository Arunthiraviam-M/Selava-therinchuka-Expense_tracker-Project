/**
 * login.js – Login page logic
 * Selava Therinchuka 💰
 */

// Redirect if already logged in
if (isAuthenticated()) {
  window.location.href = 'dashboard.html';
}

// Show success message if just registered
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('registered') === '1') {
    const banner = document.getElementById('error-banner');
    const textEl  = document.getElementById('error-text');
    if (banner && textEl) {
      banner.style.background  = 'rgba(168,255,120,0.1)';
      banner.style.borderColor = 'rgba(168,255,120,0.3)';
      textEl.style.color = '#A8FF78';
      textEl.textContent = 'Account created successfully! Please sign in.';
      banner.classList.remove('hidden');
    }
  }
});

document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  clearErrors();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  let valid = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('email-error', 'Please enter a valid email address.');
    valid = false;
  }
  if (!password || password.length < 6) {
    showFieldError('password-error', 'Password must be at least 6 characters.');
    valid = false;
  }
  if (!valid) return;

  const btn     = document.getElementById('login-btn');
  const btnText = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btnText.classList.add('hidden');
  spinner.classList.remove('hidden');
  btn.disabled = true;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setToken(data.token);
    setUser(data.user);
    window.location.href = 'dashboard.html';

  } catch (err) {
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
    btn.disabled = false;

    const banner = document.getElementById('error-banner');
    const textEl = document.getElementById('error-text');
    if (banner && textEl) {
      banner.style.background  = '';
      banner.style.borderColor = '';
      textEl.style.color = '';
      if (err.statusCode === 404) {
      textEl.innerHTML = `${err.message} <a href="register.html" style="color:#A8FF78;text-decoration:underline;font-weight:600">Create one</a>`;
      } else {
      textEl.textContent = err.message || 'Invalid email or password. Please try again.';
      }
      banner.classList.remove('hidden');
    }
  }
});
