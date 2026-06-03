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
document.querySelectorAll('.nav-list a').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href) return;

  if (
    currentPath.endsWith(href) ||
    (href !== '/' && currentPath.includes(href.replace('../', '')))
  ) {
    link.classList.add('active');
  }
});
