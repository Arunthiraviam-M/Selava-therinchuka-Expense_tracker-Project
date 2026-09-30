/**
 * register.js – Registration page logic
 * Selava Therinchuka 💰
 */

// Redirect if already logged in
if (isAuthenticated()) {
  window.location.href = 'dashboard.html';
}

document.getElementById('register-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  clearErrors();

  const name    = document.getElementById('name').value.trim();
  const age     = parseInt(document.getElementById('age').value);
  const email   = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm-password').value;
  let valid = true;

  if (!name || name.length < 2) {
    showFieldError('name-error', 'Enter your full name (min 2 characters).');
    valid = false;
  }
  if (!age || age < 13 || age > 120) {
    showFieldError('age-error', 'Enter a valid age (13–120).');
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('email-error', 'Enter a valid email address.');
    valid = false;
  }
  if (!password || password.length < 6) {
    showFieldError('password-error', 'Password must be at least 6 characters.');
    valid = false;
  }
  if (password !== confirm) {
    showFieldError('confirm-password-error', 'Passwords do not match.');
    valid = false;
  }
  if (!valid) return;

  const btn     = document.getElementById('register-btn');
  const btnText = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btnText.classList.add('hidden');
  spinner.classList.remove('hidden');
  btn.disabled = true;

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, age, email, password })
    });

    window.location.href = 'index.html?registered=1';

  } catch (err) {
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
    btn.disabled = false;

    const banner = document.getElementById('error-banner');
    const textEl = document.getElementById('error-text');
    if (banner && textEl) {
      textEl.textContent = err.message || 'Registration failed. Please try again.';
      banner.classList.remove('hidden');
    }
  }
});
