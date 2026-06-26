const SUPABASE_URL = 'https://mrfzhmolmktqlwsuvtdy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZnpobW9sbWt0cWx3c3V2dGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTc0ODUsImV4cCI6MjA5Nzk5MzQ4NX0.yrVXhvhAAwBlDQPxGunayHonZArWYJgjm4outL0JTOQ';

// Countdown to January 1, 2027
function updateCountdown() {
  const launch = new Date('2027-01-01T00:00:00');
  const now = new Date();
  const diff = Math.ceil((launch - now) / (1000 * 60 * 60 * 24));
  document.getElementById('days-count').textContent = diff > 0 ? diff : '0';
}
updateCountdown();

// Waitlist form submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email-input').value.trim();
  const btn = document.getElementById('submit-btn');
  const msg = document.getElementById('form-message');

  btn.disabled = true;
  btn.textContent = 'Joining...';
  msg.className = 'form-message hidden';
  msg.textContent = '';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email })
    });

    if (res.status === 201) {
      msg.textContent = "You're in. We'll be in touch before launch.";
      msg.className = 'form-message success';
      document.getElementById('email-input').value = '';
      btn.textContent = 'Joined ✓';
    } else if (res.status === 409) {
      msg.textContent = "You're already on the list.";
      msg.className = 'form-message success';
      btn.disabled = false;
      btn.textContent = 'Join Waitlist';
    } else {
      throw new Error('Unexpected response');
    }
  } catch {
    msg.textContent = 'Something went wrong. Try again.';
    msg.className = 'form-message error';
    btn.disabled = false;
    btn.textContent = 'Join Waitlist';
  }
});