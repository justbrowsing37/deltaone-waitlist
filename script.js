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

const COLS = 28, ROWS = 18;
const nodes = [];
for (let i = 0; i < COLS; i++) {
  for (let j = 0; j < ROWS; j++) {
    nodes.push({
      baseX: i / (COLS - 1), baseY: j / (ROWS - 1),
      ox: (Math.random() - 0.5) * 0.025,
      oy: (Math.random() - 0.5) * 0.025,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.003
    });
  }
}

function drawGrid(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width, h = canvas.height;
  const pts = nodes.map(n => ({
    x: (n.baseX + n.ox * Math.sin(t * n.speed + n.phase)) * w,
    y: (n.baseY + n.oy * Math.cos(t * n.speed + n.phase + 1)) * h
  }));
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const idx = i * ROWS + j, p = pts[idx];
      if (i < COLS - 1) {
        const r = pts[(i+1)*ROWS+j];
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(r.x,r.y);
        ctx.strokeStyle='#22C55E'; ctx.lineWidth=0.5; ctx.stroke();
      }
      if (j < ROWS - 1) {
        const b = pts[i*ROWS+(j+1)];
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle='#22C55E'; ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(p.x,p.y,1.2,0,Math.PI*2);
      ctx.fillStyle='#22C55E'; ctx.fill();
    }
  }
}
let frame = 0;
function animateGrid() { drawGrid(frame++); requestAnimationFrame(animateGrid); }
animateGrid();

// ── TYPING — two lines stack, first stays, second types under ────────
const line1El   = document.getElementById('line-1');
const cursor1El = document.getElementById('cursor-1');
const line2El   = document.getElementById('line-2');
const cursor2El = document.getElementById('cursor-2');

const LINE1 = "Information isn't the edge.";
const LINE2 = "Understanding is.";

function typeString(el, str, speed, cb) {
  let i = 0;
  function tick() {
    el.textContent = str.slice(0, ++i);
    if (i < str.length) setTimeout(tick, speed);
    else if (cb) cb();
  }
  setTimeout(tick, speed);
}

// Sequence: type line 1 → pause → hide cursor 1, show cursor 2 → type line 2 → hold
setTimeout(() => {
  typeString(line1El, LINE1, 65, () => {
    // Line 1 done — pause 900ms then start line 2
    setTimeout(() => {
      cursor1El.classList.add('hidden');  // hide cursor from line 1
      cursor2El.classList.remove('hidden'); // show cursor on line 2
      typeString(line2El, LINE2, 65, null); // type line 2, stop
    }, 900);
  });
}, 800);

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
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// ── FORM SUBMISSION ───────────────────────────────────────────
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email-input').value.trim();
  const btn = document.getElementById('submit-btn');
  const msg = document.getElementById('form-message');
  btn.disabled = true; btn.textContent = 'Joining...';
  msg.className = 'form-message hidden'; msg.textContent = '';
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
      btn.disabled = false; btn.textContent = 'Join Waitlist';
    } else { throw new Error(); }
  } catch {
    msg.textContent = 'Something went wrong. Try again.';
    msg.className = 'form-message error';
    btn.disabled = false; btn.textContent = 'Join Waitlist';
  }
});
