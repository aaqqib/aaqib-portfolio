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
  });
})();
