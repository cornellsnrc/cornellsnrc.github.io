const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menu.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });
}

const header = document.querySelector('[data-header]');
if (header) {
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('revealed'));
}

const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
if (lightbox && lightboxImage) {
  document.querySelectorAll('[data-gallery-item]').forEach((item) => {
    item.addEventListener('click', () => {
      lightboxImage.src = item.dataset.src;
      lightboxImage.alt = item.dataset.alt;
      lightbox.showModal();
    });
  });

  document.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}

const archiveGrid = document.querySelector('[data-archive-grid]');
const archiveMore = document.querySelector('[data-archive-more]');
const archiveStatus = document.querySelector('[data-archive-status]');
const archiveMoreLabel = document.querySelector('[data-archive-more-label]');

if (archiveGrid && archiveMore) {
  const archiveCards = Array.from(archiveGrid.querySelectorAll('[data-archive-card]'));
  const pageSize = Number.parseInt(archiveGrid.dataset.pageSize, 10) || 6;
  let visibleCount = Math.min(pageSize, archiveCards.length);

  const updateArchive = () => {
    archiveCards.forEach((card, index) => {
      card.hidden = index >= visibleCount;
    });

    const remaining = archiveCards.length - visibleCount;
    archiveMore.hidden = remaining <= 0;
    if (remaining > 0 && archiveMoreLabel) {
      archiveMoreLabel.textContent = `Show ${Math.min(pageSize, remaining)} more records`;
    }
    if (archiveStatus) {
      archiveStatus.textContent = `Showing ${visibleCount} of ${archiveCards.length} archive records`;
    }
  };

  archiveMore.addEventListener('click', () => {
    const firstNewCard = archiveCards[visibleCount];
    visibleCount = Math.min(visibleCount + pageSize, archiveCards.length);
    updateArchive();
    firstNewCard?.focus({ preventScroll: true });
    firstNewCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  archiveCards.forEach((card) => card.setAttribute('tabindex', '-1'));
  updateArchive();
}
