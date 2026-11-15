/* =========================================================
   Aseena B – Portfolio script
   1. Images   2. Cover animation   3. Click sound   4. Lamp switch
   ========================================================= */

/* ---------- 1. Images ---------- */
const PHOTO = "profile.jpg";   // small round photos + hero photo (the banner uses cover.jpg)

document.querySelectorAll("img.me").forEach(i => i.src = PHOTO);


/* ---------- 2. Cover animation ---------- */
const cover = document.getElementById("cover");
const typed = document.getElementById("typed");
const DESC = "M.Sc. Computer Science graduate and Software Trainer at G-Tec Computer Education, also a basic-level Robotics trainer. I turn curious beginners into confident coders.";
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

function typeText(s, el, i = 0) {
  if (i <= s.length) {
    el.textContent = s.slice(0, i);
    setTimeout(() => typeText(s, el, i + 1), 28);
  }
}

if (reduce) {
  typed.textContent = DESC;
} else {
  requestAnimationFrame(() => cover.classList.add("in"));
  setTimeout(() => typeText(DESC, typed), 2100);
}

addEventListener("scroll", () => {
  document.body.classList.toggle("scrolled", scrollY > 420);   // hides the light cone further down the page
}, { passive: true });

const stage = document.getElementById("stage");
const tilt  = document.getElementById("tilt");
stage.addEventListener("pointermove", e => {
  const r = stage.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5;
  const y = (e.clientY - r.top) / r.height - .5;
  tilt.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
});
stage.addEventListener("pointerleave", () => { tilt.style.transform = ""; });

/* ---------- 3. Click sound ---------- */
const CLICK_START  = 0.6;    // seconds into click.mp3 where the sound starts
const CLICK_LENGTH = 2000;   // how long to play, in milliseconds

const clickSound = new Audio("Click.mp3");
clickSound.preload = "auto";
let stopTimer, audioCtx;

// Backup sound made in code, used if click.mp3 is missing or can't play
function synthClick() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.05);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  } catch (e) { /* silent if audio is not supported */ }
}

function playClick() {
  clearTimeout(stopTimer);
  try { clickSound.currentTime = CLICK_START; } catch (e) {}
  clickSound.volume = 1;
  const p = clickSound.play();
  if (p) p.catch(synthClick);
  stopTimer = setTimeout(() => clickSound.pause(), CLICK_LENGTH);
}

/* ---------- 4. Lamp switch (drag the cord, tap it, or use the keyboard) ---------- */
const pullSwitch = document.getElementById("pullSwitch");
const cord = pullSwitch.querySelector(".cord");

const BASE = 70;        // cord resting length (must match .cord height in CSS)
const MAX_PULL = 50;    // the most the cord can stretch
const THRESHOLD = 25;   // pull at least this far to switch the light

function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function load(k)    { try { return localStorage.getItem(k); } catch (e) { return null; } }

// "dark" = lamp OFF, no class = lamp ON
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
}

function toggleLight() {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  save("theme", isDark ? "dark" : "light");
  playClick();
  const hint = document.querySelector(".pull-hint");
  if (hint) hint.remove();
}

// short animated pull, used for a tap or the keyboard
function quickPull() {
  pullSwitch.classList.add("pulled");
  setTimeout(toggleLight, 150);
  setTimeout(() => pullSwitch.classList.remove("pulled"), 500);
}

let dragging = false, startY = 0, dragDistance = 0;

pullSwitch.addEventListener("pointerdown", e => {
  dragging = true;
  startY = e.clientY;
  dragDistance = 0;
  cord.style.transition = "none";
  pullSwitch.setPointerCapture(e.pointerId);
});

pullSwitch.addEventListener("pointermove", e => {
  if (!dragging) return;
  dragDistance = Math.max(0, Math.min(MAX_PULL, e.clientY - startY));
  cord.style.height = (BASE + dragDistance) + "px";
});

function release(allowToggle) {
  if (!dragging) return;
  dragging = false;
  cord.style.transition = "height .4s cubic-bezier(.3,1.8,.5,1)";   // springy bounce back
  cord.style.height = BASE + "px";
  if (!allowToggle) return;
  if (dragDistance >= THRESHOLD) toggleLight();   // a real pull
  else if (dragDistance < 5) quickPull();         // a tap
}

pullSwitch.addEventListener("pointerup", () => release(true));
pullSwitch.addEventListener("pointercancel", () => release(false));

pullSwitch.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    quickPull();
  }
});

// On page load: restore the saved choice (first visit = light on)
applyTheme(load("theme") === "dark");
