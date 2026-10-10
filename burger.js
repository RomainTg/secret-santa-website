document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const burgerBtn = document.getElementById('burger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (burgerBtn && header) {
    header.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');

    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = header.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (header.classList.contains('open') && !header.contains(e.target)) {
        header.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    if (mobileNav) {
      mobileNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          header.classList.remove('open');
          burgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }
});