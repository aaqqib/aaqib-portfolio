// ── CUSTOM CURSOR ──────────────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});
function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  if (follower) { follower.style.left = followerX + 'px'; follower.style.top = followerY + 'px'; }
  requestAnimationFrame(animateFollower);
}
animateFollower();

// ── NAV SCROLL ─────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ── REVEAL ON SCROLL ───────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => observer.observe(el));

// ── ACTIVE NAV LINKS ───────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--text)' : 'var(--text-muted)';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));

// ── LIGHTBOX ───────────────────────────────────────────────
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button class="lightbox-close">✕</button>
  <img src="" alt="" />
  <span class="lightbox-caption"></span>
`;
document.body.appendChild(lightbox);

const lbImg = lightbox.querySelector('img');
const lbCaption = lightbox.querySelector('.lightbox-caption');

document.querySelectorAll('.evidence-item').forEach(item => {
  item.addEventListener('click', () => {
    lbImg.src = item.querySelector('img').src;
    lbCaption.textContent = item.querySelector('.evidence-caption').textContent;
    lightbox.classList.add('active');
  });
});
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('active'); });

// ── FORM SUBMIT → THANK YOU PAGE ───────────────────────────
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        btn.textContent = '✓ Sent!';
        btn.style.background = '#2a9d3c';
        form.reset();
        setTimeout(() => { window.location.href = 'thankyou.html'; }, 800);
      } else { throw new Error(); }
    } catch {
      btn.textContent = 'Error — email me directly';
      btn.style.background = '#c0392b';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}