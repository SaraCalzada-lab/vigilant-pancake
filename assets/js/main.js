const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-main-nav]');
const searchShell = document.querySelector('[data-search-expandable]');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });
}

if (searchShell) {
  const searchToggle = searchShell.querySelector('[data-search-toggle]');
  const searchPanel = searchShell.querySelector('[data-search-panel]');
  const searchInput = searchShell.querySelector('[data-search-input]');
  const historyList = searchShell.querySelector('[data-search-history-list]');
  const SEARCH_HISTORY_KEY = 'ullr_recent_searches';
  const SEARCH_HISTORY_LIMIT = 5;

  const getRecentSearches = () => {
    try {
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch {
      return [];
    }
  };

  const saveRecentSearches = (items) => {
    try {
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures.
    }
  };

  const addRecentSearch = (value) => {
    const query = value.trim();
    if (!query) return;

    const next = [query, ...getRecentSearches().filter((item) => item !== query)].slice(
      0,
      SEARCH_HISTORY_LIMIT
    );
    saveRecentSearches(next);
  };

  const renderRecentSearches = () => {
    if (!historyList) return;
    const recent = getRecentSearches();
    historyList.innerHTML = '';

    if (recent.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'search-history-empty';
      empty.textContent = 'No recent searches yet';
      historyList.appendChild(empty);
      return;
    }

    recent.forEach((item) => {
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-history-item';
      button.textContent = item;
      button.setAttribute('data-search-history-item', item);
      listItem.appendChild(button);
      historyList.appendChild(listItem);
    });
  };

  const setExpanded = (expanded, options = {}) => {
    if (!searchToggle || !searchPanel || !searchInput) return;

    searchShell.classList.toggle('is-expanded', expanded);
    searchPanel.hidden = !expanded;
    searchToggle.setAttribute('aria-expanded', String(expanded));

    if (expanded) {
      renderRecentSearches();
      window.requestAnimationFrame(() => {
        searchInput.focus();
        searchInput.select();
      });
      return;
    }

    if (options.returnFocus) {
      searchToggle.focus();
    }
  };

  searchToggle?.addEventListener('click', () => {
    const expanded = searchToggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setExpanded(false, { returnFocus: true });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      addRecentSearch(query);
      renderRecentSearches();
      setExpanded(false, { returnFocus: true });
    }
  });

  historyList?.addEventListener('click', (event) => {
    const historyItem = event.target.closest('[data-search-history-item]');
    if (!(historyItem instanceof HTMLButtonElement) || !searchInput) return;

    const value = historyItem.getAttribute('data-search-history-item') || '';
    searchInput.value = value;
    addRecentSearch(value);
    renderRecentSearches();
    setExpanded(false, { returnFocus: true });
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node)) return;
    if (!searchShell.contains(event.target)) {
      setExpanded(false);
    }
  });

  renderRecentSearches();
}

const currentPath = window.location.pathname;
const currentHash = window.location.hash;

document.querySelectorAll('.nav-list a').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href) return;

  if (href.startsWith('#')) {
    if (href === currentHash) {
      link.classList.add('active');
    }
    return;
  }

  if (
    currentPath.endsWith(href) ||
    (href !== '/' && currentPath.includes(href.replace('../', '')))
  ) {
    link.classList.add('active');
  }
});

const docsNav = document.querySelector('[data-docs-nav]');
if (docsNav) {
  const parentLinks = Array.from(docsNav.querySelectorAll('[data-submenu-toggle]'));

  const collapseAllSubmenus = () => {
    parentLinks.forEach((parentLink) => {
      const submenuId = parentLink.getAttribute('data-submenu-toggle');
      if (!submenuId) return;
      const submenu = document.getElementById(submenuId);
      if (!submenu) return;

      submenu.hidden = true;
      parentLink.setAttribute('aria-expanded', 'false');
    });
  };

  const expandSubmenuById = (submenuId) => {
    const parentLink = docsNav.querySelector(`[data-submenu-toggle="${submenuId}"]`);
    const submenu = document.getElementById(submenuId);
    if (!parentLink || !submenu) return;

    collapseAllSubmenus();
    submenu.hidden = false;
    parentLink.setAttribute('aria-expanded', 'true');
  };

  const activateHashLinks = () => {
    const hash = window.location.hash;
    docsNav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.classList.toggle('active', hash !== '' && link.getAttribute('href') === hash);
    });

    if (!hash) {
      const overviewLink = docsNav.querySelector('a[href="#overview"]');
      if (overviewLink) {
        overviewLink.classList.add('active');
      }
    }
  };

  const syncExpandedSectionToHash = () => {
    const hash = window.location.hash;
    if (!hash) {
      collapseAllSubmenus();
      return;
    }

    const childLink = docsNav.querySelector(`.nav-sublist a[href="${hash}"]`);
    if (childLink) {
      const submenu = childLink.closest('.nav-sublist');
      if (submenu?.id) {
        expandSubmenuById(submenu.id);
      }
      return;
    }

    const parentLink = docsNav.querySelector(`[data-submenu-toggle][href="${hash}"]`);
    if (parentLink) {
      const submenuId = parentLink.getAttribute('data-submenu-toggle');
      if (submenuId) {
        expandSubmenuById(submenuId);
      }
      return;
    }

    collapseAllSubmenus();
  };

  parentLinks.forEach((parentLink) => {
    parentLink.addEventListener('click', () => {
      const submenuId = parentLink.getAttribute('data-submenu-toggle');
      if (submenuId) {
        expandSubmenuById(submenuId);
      }
    });
  });

  window.addEventListener('hashchange', () => {
    activateHashLinks();
    syncExpandedSectionToHash();
  });

  activateHashLinks();
  syncExpandedSectionToHash();
}

// Feature tab navigator
const tabStrip = document.querySelector('.tab-strip[role="tablist"]');
if (tabStrip) {
  const tabs = Array.from(tabStrip.querySelectorAll('[role="tab"]'));

  const activateTab = (tab) => {
    tabs.forEach((t) => {
      const panelId = t.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      const isActive = t === tab;
      t.setAttribute('aria-selected', String(isActive));
      if (panel) panel.hidden = !isActive;
    });
    tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(e.currentTarget);
      if (e.key === 'ArrowRight') { e.preventDefault(); activateTab(tabs[(idx + 1) % tabs.length]); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); activateTab(tabs[(idx - 1 + tabs.length) % tabs.length]); }
      if (e.key === 'Home')       { e.preventDefault(); activateTab(tabs[0]); }
      if (e.key === 'End')        { e.preventDefault(); activateTab(tabs[tabs.length - 1]); }
    });
  });
}
