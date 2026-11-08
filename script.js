/* ==========================================================
   SCRIPT.JS: Aseena B portfolio
   1. Dark / light theme      4. Highlight the current section in the menu
   2. Mobile menu             5. Footer year
   3. Reveal on scroll
   ========================================================== */

/* ---------- 1. DARK / LIGHT THEME ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');

// Use the saved choice, otherwise follow the visitor's system setting.
// localStorage can be blocked in some browsers, so it is wrapped in try/catch.
function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch (e) { return null; }
}
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
root.setAttribute('data-theme', getSavedTheme() || (systemDark ? 'dark' : 'light'));

themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
});

/* ---------- 2. MOBILE MENU ---------- */
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Close the menu after choosing a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- 3. REVEAL ON SCROLL ----------
   IntersectionObserver tells us when an element enters the screen. */
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  // Very old browsers: just show everything
  revealItems.forEach(item => item.classList.add('is-visible'));
}

/* ---------- 4. HIGHLIGHT THE CURRENT SECTION ---------- */
const sections = document.querySelectorAll('main section[id]');
const menuLinks = document.querySelectorAll('.nav-links a');

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        menuLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' }); // a thin band in the middle of the screen
  sections.forEach(section => sectionObserver.observe(section));
}

/* ---------- 5. FOOTER YEAR ---------- */
document.getElementById('year').textContent = new Date().getFullYear();