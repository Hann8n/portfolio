// Accessibility menu logic
(function() {
  const root = document.documentElement;
  const accessibilityBtn = document.getElementById('accessibility-btn');
  const menu = document.getElementById('accessibility-menu');
  let menuOpen = false;

  // Theme radio buttons
  const themeRadios = menu ? menu.querySelectorAll('input[name="theme-mode"]') : [];
  const themeRadioLabels = menu ? menu.querySelectorAll('.access-radio') : [];
  // Add system theme radio if not present
  if (menu && !menu.querySelector('input[value="system"]')) {
    const systemLabel = document.createElement('label');
    systemLabel.className = 'access-radio';
    const systemRadio = document.createElement('input');
    systemRadio.type = 'radio';
    systemRadio.name = 'theme-mode';
    systemRadio.value = 'system';
    systemLabel.appendChild(systemRadio);
    systemLabel.appendChild(document.createTextNode(' System'));
    // Insert as first option
    const section = menu.querySelector('.access-section');
    if (section) section.insertBefore(systemLabel, section.children[1]);
  }
  // Re-query radios after possible insertion
  const allThemeRadios = menu ? menu.querySelectorAll('input[name="theme-mode"]') : [];

  // High contrast toggle
  const highContrastToggle = menu ? menu.querySelector('#high-contrast-toggle') : null;
  // Text size buttons
  const textIncreaseBtn = menu ? menu.querySelector('#text-increase') : null;
  const textDecreaseBtn = menu ? menu.querySelector('#text-decrease') : null;
  const textResetBtn = menu ? menu.querySelector('#text-reset') : null;

  function setTheme(mode) {
    root.classList.remove('dark-theme', 'light-theme');
    if (mode === 'dark') {
      root.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else if (mode === 'light') {
      root.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      // System: remove explicit theme, use OS preference
      localStorage.setItem('theme', 'system');
    }
    // Update selected state for mobile button UI
    themeRadioLabels.forEach(label => {
      const input = label.querySelector('input[type="radio"]');
      if (input) {
        if (input.value === mode) {
          label.classList.add('selected');
        } else {
          label.classList.remove('selected');
        }
      }
    });
  }

  // Utility to announce status to screen readers
  function announceA11yStatus(message) {
    const status = document.getElementById('a11y-status');
    if (status) {
      status.textContent = '';
      setTimeout(() => { status.textContent = message; }, 10);
    }
  }

  function setHighContrast(enabled) {
    if (enabled) {
      root.classList.add('high-contrast');
      root.classList.add('dark-theme'); // Always dark in high contrast
      // Disable theme radios
      allThemeRadios.forEach(radio => {
        radio.disabled = true;
      });
      themeRadioLabels.forEach(label => {
        label.classList.add('disabled');
      });
      announceA11yStatus('High contrast mode enabled.');
    } else {
      root.classList.remove('high-contrast');
      // Enable theme radios
      allThemeRadios.forEach(radio => {
        radio.disabled = false;
      });
      themeRadioLabels.forEach(label => {
        label.classList.remove('disabled');
      });
      // Restore selected theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      // Set radio
      allThemeRadios.forEach(radio => { radio.checked = (radio.value === savedTheme); });
      announceA11yStatus('High contrast mode disabled.');
    }
    localStorage.setItem('highContrast', enabled ? '1' : '0');
  }

  function setFontSize(size) {
    root.style.setProperty('--base-font-size', size + 'px');
    localStorage.setItem('fontSize', size);
  }

  function getFontSize() {
    const val = parseInt(localStorage.getItem('fontSize'), 10);
    return isNaN(val) ? 16 : val;
  }

  function openMenu() {
    if (!menu) return;
    menu.style.display = 'flex';
    accessibilityBtn.setAttribute('aria-expanded', 'true');
    menuOpen = true;
    // Focus first input for accessibility
    setTimeout(() => {
      const firstInput = menu.querySelector('input, button');
      if (firstInput) firstInput.focus();
    }, 0);
  }
  function closeMenu() {
    if (!menu) return;
    menu.style.display = 'none';
    accessibilityBtn.setAttribute('aria-expanded', 'false');
    menuOpen = false;
  }
  function toggleMenu() {
    menuOpen ? closeMenu() : openMenu();
  }

  // Event listeners
  if (accessibilityBtn) {
    accessibilityBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });
    accessibilityBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });
  }

  // Theme selection logic
  function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 650px)').matches;
  }

  if (isMobile()) {
    // On mobile, treat .access-radio as buttons
    themeRadioLabels.forEach(label => {
      label.addEventListener('click', function(e) {
        e.preventDefault();
        const input = label.querySelector('input[type="radio"]');
        if (input && !input.disabled) {
          setTheme(input.value);
        }
      });
      label.setAttribute('tabindex', '0');
      label.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const input = label.querySelector('input[type="radio"]');
          if (input && !input.disabled) {
            setTheme(input.value);
          }
        }
      });
    });
  } else {
    // Desktop: radio logic
    allThemeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.checked) setTheme(this.value);
      });
    });
  }

  // High contrast toggle logic
  highContrastToggle && highContrastToggle.addEventListener('change', function() {
    setHighContrast(this.checked);
  });

  // Text size logic
  textIncreaseBtn && textIncreaseBtn.addEventListener('click', function() {
    let size = getFontSize();
    size = Math.min(size + 2, 28);
    setFontSize(size);
  });
  textDecreaseBtn && textDecreaseBtn.addEventListener('click', function() {
    let size = getFontSize();
    size = Math.max(size - 2, 12);
    setFontSize(size);
  });
  textResetBtn && textResetBtn.addEventListener('click', function() {
    setFontSize(16);
  });
  textResetBtn && textResetBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFontSize(16);
    }
  });

  // Close menu on outside click or Escape
  document.addEventListener('click', function(e) {
    if (menuOpen && menu && !menu.contains(e.target) && e.target !== accessibilityBtn) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', function(e) {
    if (menuOpen && e.key === 'Escape') {
      closeMenu();
      accessibilityBtn && accessibilityBtn.focus();
    }
    // Keyboard navigation: arrow keys
    if (menuOpen && menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const focusables = Array.from(menu.querySelectorAll('input, button, [role="button"], .access-radio'));
      const idx = focusables.indexOf(document.activeElement);
      let nextIdx = idx;
      if (e.key === 'ArrowDown') nextIdx = (idx + 1) % focusables.length;
      if (e.key === 'ArrowUp') nextIdx = (idx - 1 + focusables.length) % focusables.length;
      focusables[nextIdx].focus();
      e.preventDefault();
    }
  });

  // On load: apply saved theme, high contrast, and font size
  window.addEventListener('DOMContentLoaded', function() {
    // Theme
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    allThemeRadios.forEach(radio => { radio.checked = (radio.value === savedTheme); });
    // High contrast
    const highContrast = localStorage.getItem('highContrast') === '1';
    if (highContrast) setHighContrast(true);
    if (highContrastToggle) highContrastToggle.checked = highContrast;
    // Font size
    setFontSize(getFontSize());
  });
})();

// Dynamically load header.html into #header-include
function loadHeader() {
  const headerDiv = document.getElementById('header-include');
  if (headerDiv) {
    fetch('header.html')
      .then(response => response.text())
      .then(html => {
        headerDiv.insertAdjacentHTML('beforeend', html);
        // Set active tab in header navigation
        const navLinks = headerDiv.querySelectorAll('.menu a');
        const page = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
          // Normalize both for comparison
          const linkHref = link.getAttribute('href');
          if (
            (page === '' && linkHref === 'index.html') ||
            (page === linkHref) ||
            (page === 'index.html' && linkHref === 'index.html')
          ) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        // Run scripts that depend on the loaded header
        initializeAccessibility();
        initializeMobileNav();
      });
  }
}
document.addEventListener('DOMContentLoaded', loadHeader);

// Mobile navigation toggle
function initializeMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navContent = document.getElementById('header-controls');

  if (toggleBtn && navContent) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navContent.classList.toggle('mobile-nav-open');
    });
  }
} 