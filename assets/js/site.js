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
const archiveCategoryFilters = document.querySelector('[data-archive-category-filters]');
const archiveYearFilter = document.querySelector('[data-archive-year-filter]');

if (archiveGrid && archiveMore) {
  const archiveCards = Array.from(archiveGrid.querySelectorAll('[data-archive-card]'));
  const pageSize = Number.parseInt(archiveGrid.dataset.pageSize, 10) || 12;
  const categoryColors = {
    'Community': '#A47A24',
    'Fieldwork': '#286247',
    'Waste Reduction': '#B46A3C',
    'Wildlife': '#4E7182',
    'Upcycling': '#8A5D7B',
    'Advocacy': '#785C78'
  };
  const yearRank = (year) => year === 'Ongoing' ? 10000 : /^\d{4}$/.test(year) ? Number(year) : -1;
  archiveCards.sort((a, b) => yearRank(b.dataset.year) - yearRank(a.dataset.year));
  archiveCards.forEach((card) => {
    const color = categoryColors[card.dataset.category] || '#286247';
    card.style.setProperty('--archive-color', color);
    archiveGrid.append(card);
  });

  let activeCategory = 'All';
  let activeYear = 'All';
  let visibleCount = pageSize;

  const makeCategoryFilters = (container, values) => {
    if (!container) return;
    ['All', ...values].forEach((value) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'archive-filter';
      button.textContent = value;
      button.dataset.filterValue = value;
      button.setAttribute('aria-pressed', String(value === 'All'));
      if (value !== 'All') button.style.setProperty('--archive-color', categoryColors[value] || '#286247');
      button.addEventListener('click', () => {
        activeCategory = value;
        container.querySelectorAll('.archive-filter').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        visibleCount = pageSize;
        updateArchive();
      });
      container.append(button);
    });
  };

  const categories = [...new Set(archiveCards.map((card) => card.dataset.category))].sort();
  const years = [...new Set(archiveCards.map((card) => card.dataset.year))].sort((a, b) => yearRank(b) - yearRank(a));
  makeCategoryFilters(archiveCategoryFilters, categories);
  years.forEach((year) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = /^\d{4}$/.test(year) ? year : year === 'Ongoing' ? 'Ongoing work' : 'Earlier archive';
    archiveYearFilter?.append(option);
  });
  archiveYearFilter?.addEventListener('change', () => {
    activeYear = archiveYearFilter.value;
    visibleCount = pageSize;
    updateArchive();
  });

  const updateArchive = () => {
    const filteredCards = archiveCards.filter((card) => {
      const categoryMatches = activeCategory === 'All' || card.dataset.category === activeCategory;
      const yearMatches = activeYear === 'All' || card.dataset.year === activeYear;
      return categoryMatches && yearMatches;
    });
    archiveCards.forEach((card) => { card.hidden = true; });
    filteredCards.forEach((card, index) => {
      card.hidden = index >= visibleCount;
    });

    const shown = Math.min(visibleCount, filteredCards.length);
    const remaining = filteredCards.length - shown;
    archiveMore.hidden = remaining <= 0;
    if (remaining > 0 && archiveMoreLabel) {
      archiveMoreLabel.textContent = `Show ${Math.min(pageSize, remaining)} more records`;
    }
    if (archiveStatus) {
      archiveStatus.textContent = `Showing ${shown} of ${filteredCards.length} archive records · newest first`;
    }
  };

  archiveMore.addEventListener('click', () => {
    const filteredCards = archiveCards.filter((card) => (activeCategory === 'All' || card.dataset.category === activeCategory) && (activeYear === 'All' || card.dataset.year === activeYear));
    const firstNewCard = filteredCards[visibleCount];
    visibleCount = Math.min(visibleCount + pageSize, filteredCards.length);
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
  const yearSelect = calendarRoot.querySelector('[data-calendar-year-select]');
  const eventYears = events.map((event) => parseDate(event.date).getFullYear());
  const years = [...new Set(eventYears)].sort((a, b) => b - a);
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

  years.forEach((year) => {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = year;
    yearSelect.append(option);
  });

  const renderYear = (year) => {
    const yearGroup = document.createElement('section');
    yearGroup.className = 'calendar-year-group';
    if (yearSelect.value === 'all' && years.length > 1) {
      const heading = document.createElement('h3');
      heading.className = 'calendar-year-divider';
      heading.textContent = year;
      yearGroup.append(heading);
    }
    const monthGrid = document.createElement('div');
    monthGrid.className = 'calendar-month-grid';
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
      monthElement.append(title, days); monthGrid.append(monthElement);
    });
    yearGroup.append(monthGrid);
    monthsNode.append(yearGroup);
  };

  const renderCalendar = () => {
    monthsNode.replaceChildren();
    if (!years.length) {
      yearNode.textContent = 'No dates yet';
      yearSelect.disabled = true;
      return;
    }
    if (yearSelect.value === 'all') {
      yearNode.textContent = 'All years';
      years.forEach(renderYear);
    } else {
      const selectedYear = Number(yearSelect.value);
      yearNode.textContent = selectedYear;
      renderYear(selectedYear);
    }
  };
  yearSelect.addEventListener('change', renderCalendar);
  document.querySelector('[data-calendar-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  renderCalendar();
}
