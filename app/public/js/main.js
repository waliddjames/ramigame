// main.js — animated logo dropdown ("You are welcome To RamiGame")
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('logoToggle');
    const dropdown = document.getElementById('logoDropdown');
    if (!toggleBtn || !dropdown) return;

    const textEl = dropdown.querySelector('p');

    function replayTypewriter() {
      if (!textEl) return;
      textEl.style.animation = 'none';
      // Force reflow so the animation can restart from scratch each time.
      void textEl.offsetWidth;
      textEl.style.animation = '';
    }

    function open() {
      dropdown.classList.add('open');
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      replayTypewriter();
    }

    function close() {
      dropdown.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('open')) close();
      else open();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== toggleBtn) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  });
})();
