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
  const pageSize = Number.parseInt(archiveGrid.dataset.pageSize, 10) || 12;
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

const calendarRoot = document.querySelector('[data-event-calendar]');
if (calendarRoot) {
  const dataNode = calendarRoot.querySelector('[data-calendar-data]');
  const calendarData = JSON.parse(dataNode?.textContent || '{"categories":{},"events":[]}');
  const categories = calendarData.categories || {};
  const events = (calendarData.events || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parseDate = (value) => {
    const [year, month, day] = String(value).split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const safeColor = (value) => /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#286247';
  const formatDate = (date, options = {}) => new Intl.DateTimeFormat('en-US', options).format(date);
  const eventColor = (event) => safeColor(categories[event.category]?.color);
  const categoryLabel = (event) => categories[event.category]?.label || event.category || 'Event';

  const nextEvent = events.find((event) => parseDate(event.date) >= today);
  const nextPanel = calendarRoot.querySelector('[data-next-event]');
  if (nextEvent) {
    const nextLink = nextPanel.querySelector('[data-next-link]');
    nextPanel.style.setProperty('--event-color', eventColor(nextEvent));
    nextPanel.querySelector('[data-next-date]').textContent = formatDate(parseDate(nextEvent.date), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    nextPanel.querySelector('[data-next-title]').textContent = nextEvent.title;
    nextPanel.querySelector('[data-next-meta]').textContent = [nextEvent.time, nextEvent.location].filter(Boolean).join(' · ');
    nextPanel.querySelector('[data-next-description]').textContent = nextEvent.description || '';
    nextPanel.querySelector('[data-next-category]').textContent = categoryLabel(nextEvent);
    nextLink.hidden = !nextEvent.link;
    if (nextEvent.link) nextLink.href = nextEvent.link;
  } else {
    nextPanel.classList.add('is-empty');
    nextPanel.querySelector('[data-next-date]').textContent = 'New dates coming soon';
    nextPanel.querySelector('[data-next-title]').textContent = 'The next event is being planned.';
    nextPanel.querySelector('[data-next-meta]').textContent = '';
    nextPanel.querySelector('[data-next-description]').textContent = 'Join CampusGroups or GroupMe to hear about it first.';
    nextPanel.querySelector('[data-next-category]').hidden = true;
    nextPanel.querySelector('[data-next-link]').hidden = true;
  }

  const yearNode = calendarRoot.querySelector('[data-calendar-year]');
  const monthsNode = calendarRoot.querySelector('[data-calendar-months]');
  const legendNode = calendarRoot.querySelector('[data-calendar-legend]');
  const previousButton = calendarRoot.querySelector('[data-calendar-previous]');
  const nextButton = calendarRoot.querySelector('[data-calendar-next]');
  const eventYears = events.map((event) => parseDate(event.date).getFullYear());
  const years = [...new Set([today.getFullYear(), ...eventYears])].sort((a, b) => a - b);
  let yearIndex = Math.max(0, years.indexOf(today.getFullYear()));
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = Array.from({ length: 12 }, (_, month) => formatDate(new Date(2024, month, 1), { month: 'long' }));

  Object.entries(categories).forEach(([key, category]) => {
    const item = document.createElement('span');
    item.className = 'calendar-legend-item';
    const dot = document.createElement('i');
    dot.style.backgroundColor = safeColor(category.color);
    item.append(dot, document.createTextNode(category.label || key));
    legendNode.append(item);
  });

  const dialog = document.querySelector('[data-calendar-dialog]');
  const showEvents = (date, dayEvents) => {
    dialog.querySelector('[data-dialog-date]').textContent = formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const list = dialog.querySelector('[data-dialog-events]');
    list.replaceChildren();
    dayEvents.forEach((event) => {
      const card = document.createElement('article');
      card.className = 'calendar-dialog-event';
      card.style.setProperty('--event-color', eventColor(event));
      const pill = document.createElement('span'); pill.className = 'event-category-pill'; pill.textContent = categoryLabel(event);
      const title = document.createElement('h3'); title.textContent = event.title;
      const meta = document.createElement('p'); meta.className = 'event-meta'; meta.textContent = [event.time, event.location].filter(Boolean).join(' · ');
      const description = document.createElement('p'); description.textContent = event.description || '';
      card.append(pill, title, meta, description);
      if (event.link) {
        const link = document.createElement('a'); link.className = 'text-link'; link.href = event.link; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Event details ↗'; card.append(link);
      }
      list.append(card);
    });
    dialog.showModal();
  };

  const renderCalendar = () => {
    const year = years[yearIndex];
    yearNode.textContent = year;
    previousButton.disabled = yearIndex === 0;
    nextButton.disabled = yearIndex === years.length - 1;
    monthsNode.replaceChildren();
    monthNames.forEach((monthName, month) => {
      const monthElement = document.createElement('section'); monthElement.className = 'calendar-month';
      const title = document.createElement('h3'); title.textContent = monthName;
      const days = document.createElement('div'); days.className = 'calendar-days';
      weekdays.forEach((weekday) => { const label = document.createElement('span'); label.className = 'calendar-weekday'; label.textContent = weekday; days.append(label); });
      const firstDay = new Date(year, month, 1).getDay();
      for (let empty = 0; empty < firstDay; empty += 1) days.append(document.createElement('span'));
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter((event) => String(event.date) === key);
        const cell = document.createElement(dayEvents.length ? 'button' : 'span');
        cell.className = 'calendar-day'; cell.textContent = day;
        if (dayEvents.length) {
          cell.type = 'button'; cell.classList.add('has-events'); cell.style.setProperty('--event-color', eventColor(dayEvents[0]));
          cell.setAttribute('aria-label', `${formatDate(date, { month: 'long', day: 'numeric' })}: ${dayEvents.map((event) => event.title).join(', ')}`);
          if (dayEvents.length > 1) cell.dataset.count = dayEvents.length;
          cell.addEventListener('click', () => showEvents(date, dayEvents));
        }
        if (date.getTime() === today.getTime()) cell.classList.add('is-today');
        days.append(cell);
      }
      monthElement.append(title, days); monthsNode.append(monthElement);
    });
  };
  previousButton.addEventListener('click', () => { if (yearIndex > 0) { yearIndex -= 1; renderCalendar(); } });
  nextButton.addEventListener('click', () => { if (yearIndex < years.length - 1) { yearIndex += 1; renderCalendar(); } });
  document.querySelector('[data-calendar-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  renderCalendar();
}
