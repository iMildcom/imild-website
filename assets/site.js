/* iMild.com — small site behaviours (menu, contact form) */
(function () {
  'use strict';

  /* Mobile menu */
  var menubtn = document.getElementById('menubtn');
  var nav = document.getElementById('sitenav');
  if (menubtn && nav) {
    menubtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menubtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menubtn.textContent = open ? '✕' : '☰';
    });
  }

  /* Contact form → mailto (no backend yet) */
  var form = document.getElementById('contactform');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (id) { return (document.getElementById(id) || {}).value || ''; };
      var subject = '[iMild.com] ' + (v('cf-topic') || 'Kontakt');
      var body = v('cf-msg') + '\n\n— ' + v('cf-name') + ' <' + v('cf-mail') + '>';
      window.location.href = 'mailto:s@imild.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
