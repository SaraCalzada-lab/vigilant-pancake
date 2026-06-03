const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-main-nav]');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });
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
