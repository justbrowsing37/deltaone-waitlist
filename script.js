const SUPABASE_URL = 'https://mrfzhmolmktqlwsuvtdy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZnpobW9sbWt0cWx3c3V2dGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTc0ODUsImV4cCI6MjA5Nzk5MzQ4NX0.yrVXhvhAAwBlDQPxGunayHonZArWYJgjm4outL0JTOQ';

// ── BACKGROUND CANVAS ──────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLS = 28;
const ROWS = 18;
let gridW, gridH;

const nodes = [];
for (let i = 0; i < COLS; i++) {
  for (let j = 0; j < ROWS; j++) {
    nodes.push({
      baseX: (i / (COLS - 1)),
      baseY: (j / (ROWS - 1)),
      ox: (Math.random() - 0.5) * 0.025,
      oy: (Math.random() - 0.5) * 0.025,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.003
    });
  }
}

function drawGrid(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width;
  const h = canvas.height;

  const pts = nodes.map(n => ({
    x: (n.baseX + n.ox * Math.sin(t * n.speed + n.phase)) * w,
    y: (n.baseY + n.oy * Math.cos(t * n.speed + n.phase + 1)) * h
  }));

  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const idx = i * ROWS + j;
      const p = pts[idx];

      if (i < COLS - 1) {
        const r = pts[(i + 1) * ROWS + j];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(r.x, r.y);
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      if (j < ROWS - 1) {
        const b = pts[i * ROWS + (j + 1)];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#22C55E';
      ctx.fill();
    }
  }
}

let frame = 0;
function animateGrid() {
  drawGrid(frame++);
  requestAnimationFrame(animateGrid);
}
animateGrid();

// ── TYPING ANIMATION ───────────────────────────────────────────
const lines = [
  'Learn markets.',
  'Trade with conviction.'
];

const typedEl = document.getElementById('typed-text');
let lineIndex = 0;
let charIndex = 0;
let deleting = false;
let typingStarted = false;

function type() {
  const current = lines[lineIndex];

  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      if (lineIndex < lines.length - 1) {
        setTimeout(() => { deleting = true; type(); }, 1000);
      } else {
        // All lines typed — pause then restart loop
        setTimeout(() => {
          lineIndex = 0;
          charIndex = 0;
          deleting = false;
          type();
        }, 4000);
      }
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      lineIndex++;
      setTimeout(type, 300);
      return;
    }
  }

  const speed = deleting ? 35 : 65;
  setTimeout(type, speed);
}

// Start typing 0.8s after page load — after grid is visible
setTimeout(type, 800);

// ── COUNTDOWN ─────────────────────────────────────────────────
function updateCountdown() {
  const launch = new Date('2027-01-01T00:00:00');
  const now = new Date();
  const diff = Math.ceil((launch - now) / (1000 * 60 * 60 * 24));
  document.getElementById('days-count').textContent = diff > 0 ? diff : '0';
}
updateCountdown();

// ── SCROLL REVEAL ─────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

// ── FORM SUBMISSION ───────────────────────────────────────────
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
      throw new Error();
    }
  } catch {
    msg.textContent = 'Something went wrong. Try again.';
    msg.className = 'form-message error';
    btn.disabled = false;
    btn.textContent = 'Join Waitlist';
  }
});
