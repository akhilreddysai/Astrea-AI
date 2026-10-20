/* Astrea — header behavior: mobile menu, demo dropdown, current-page mark. */

(function () {
  'use strict';

  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('menu');
  var ddBtn = document.getElementById('ddBtn');
  var ddMenu = document.getElementById('ddmenu');

  function closeDd() {
    if (!ddMenu) return;
    ddMenu.classList.remove('open');
    ddBtn.setAttribute('aria-expanded', 'false');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
      if (!open) closeDd();
    });
  }

  if (ddBtn && ddMenu) {
    ddBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = ddMenu.classList.toggle('open');
      ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!ddMenu.contains(e.target) && e.target !== ddBtn) closeDd();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDd();
        ddBtn.focus();
      }
    });

    // tabbing out of the menu closes it
    ddMenu.addEventListener('focusout', function (e) {
      if (!ddMenu.contains(e.relatedTarget) && e.relatedTarget !== ddBtn) closeDd();
    });
  }

  // mark the current page in the nav
  var here = location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (here.length > 1) here = here.replace(/\/$/, '');
  Array.prototype.forEach.call(document.querySelectorAll('.mlink'), function (a) {
    var href = a.getAttribute('href').replace(/\/$/, '');
    if (href && href === here) a.setAttribute('aria-current', 'page');
  });
})();
