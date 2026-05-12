(function() {
  function getTheme() {
    return localStorage.getItem('theme') || 'auto';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      // auto mode
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }

  // Apply immediately to prevent FOUC (Flash of Unstyled Content)
  applyTheme(getTheme());

  // Listen to OS theme changes if 'auto' is selected
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'auto') {
      applyTheme('auto');
    }
  });

  // Setup buttons when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    function updateActiveButton(theme) {
      themeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim().toLowerCase() === theme) {
          btn.classList.add('active');
        }
      });
    }

    const currentTheme = getTheme();
    updateActiveButton(currentTheme);

    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.textContent.trim().toLowerCase();
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
        updateActiveButton(selectedTheme);
      });
    });

    // Keyboard shortcuts for navigation
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }
      
      const navItems = document.querySelectorAll('.nav-item');
      for (const item of navItems) {
        const shortcutEl = item.querySelector('.nav-shortcut');
        if (shortcutEl && shortcutEl.textContent.trim() === e.key) {
          const href = item.getAttribute('href');
          if (href && href !== '#') {
            window.location.href = href;
          }
          break;
        }
      }
    });

    // === GLOBAL BACKGROUND MUSIC PLAYER ===
    const style = document.createElement('style');
    style.innerHTML = `
      .global-music-btn {
        position: fixed; bottom: 2rem; right: 2rem;
        background: var(--bg-card); border: 1px solid var(--border);
        border-radius: 50%; width: 50px; height: 50px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        color: var(--text-main);
        transition: transform 0.15s ease, background 0.2s;
      }
      .global-music-btn:hover { background: var(--hover-bg); transform: scale(1.05); }
      .global-music-btn:active { transform: scale(0.95); }
      @media (max-width: 900px) {
        .global-music-btn { bottom: 6rem; right: 1.5rem; width: 44px; height: 44px; }
      }
    `;
    document.head.appendChild(style);

    const audio = document.createElement('audio');
    audio.loop = true;
    audio.innerHTML = '<source src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" type="audio/mpeg">';
    document.body.appendChild(audio);

    const btn = document.createElement('button');
    btn.className = 'global-music-btn';
    btn.title = "Play/Pause Ambient Music";
    document.body.appendChild(btn);

    let isPlaying = sessionStorage.getItem('globalMusicPlaying') === 'true';
    const savedTime = sessionStorage.getItem('globalMusicTime');
    if (savedTime) audio.currentTime = parseFloat(savedTime);

    function updateBtnIcon() {
      btn.innerHTML = isPlaying ? '<i data-feather="pause"></i>' : '<i data-feather="play"></i>';
      if (typeof feather !== 'undefined') feather.replace();
    }

    function attemptPlay() {
      audio.play().then(() => {
        isPlaying = true;
        sessionStorage.setItem('globalMusicPlaying', 'true');
        updateBtnIcon();
      }).catch((e) => {
        console.log("Autoplay blocked by browser. Waiting for interaction.");
        isPlaying = false;
        sessionStorage.setItem('globalMusicPlaying', 'false');
        updateBtnIcon();
      });
    }

    // Initialize Autoplay or Restore State
    if (sessionStorage.getItem('globalMusicPlaying') === null) {
      // First visit: attempt autoplay
      attemptPlay();
      // If blocked, play on very first interaction with the site
      const startOnInteraction = () => {
        if (!isPlaying && sessionStorage.getItem('globalMusicPlaying') !== 'false') {
          attemptPlay();
        }
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
      };
      document.addEventListener('click', startOnInteraction);
      document.addEventListener('keydown', startOnInteraction);
    } else if (isPlaying) {
      // Navigated from another page while playing
      attemptPlay();
    } else {
      // Navigated from another page while paused
      updateBtnIcon();
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        sessionStorage.setItem('globalMusicPlaying', 'false');
      } else {
        attemptPlay();
      }
      updateBtnIcon();
    });

    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('globalMusicTime', audio.currentTime);
    });

  });
})();
