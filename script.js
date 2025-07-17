(function() {
  // Theme toggle
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    // Initial button label
    if (document.documentElement.classList.contains('dark-theme')) {
      themeToggleBtn.textContent = 'Light Mode';
    } else {
      themeToggleBtn.textContent = 'Dark Mode';
    }
    // Toggle handler
    themeToggleBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.classList.toggle('dark-theme');
      themeToggleBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  // Contact form placeholder handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('Thank you for your message! (This is a static placeholder form.)');
      contactForm.reset();
    });
  }

  // View Transition Navigation
  const navLinks = Array.from(document.querySelectorAll('nav .menu a'));
  // Tag each link with its index
  navLinks.forEach((link, idx) => link.dataset.idx = idx);

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const target = link.getAttribute('href');
      const current = document.querySelector('nav .menu a.active');
      const fromIdx = Number(current?.dataset.idx ?? 0);
      const toIdx   = Number(link.dataset.idx);

      // Determine slide direction
      const forward = toIdx > fromIdx;
      document.documentElement.style.setProperty(
        '--vt-old-animation',
        forward
          ? '0.4s ease-in both slide-out-left'
          : '0.4s ease-in both slide-out-right'
      );
      document.documentElement.style.setProperty(
        '--vt-new-animation',
        forward
          ? '0.4s ease-out both slide-in-right'
          : '0.4s ease-out both slide-in-left'
      );

      // Trigger view transition if supported
      if (document.startViewTransition) {
        e.preventDefault();
        document.startViewTransition(() => {
          window.location.href = target;
        });
      }
      // Otherwise, normal navigation
    });
  });
})();
