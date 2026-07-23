/* ============================================================
   iMild.com — i18n (de/en)
   English is the MASTER language and lives in assets/en.json
   (loaded at runtime). German is authored inline in the HTML as a
   no-JS progressive-enhancement fallback and captured at load.
   Adding language N = add assets/i18n/<lang>.json + list it in LANGS.
   ============================================================ */
(function () {
  'use strict';

  var LANGS = ['de', 'en'];          // 'de' = inline source, 'en' = master file
  var MASTER = 'en';
  var page = document.body.getAttribute('data-page') || '';
  var deTitle = document.title;

  var EN = {};          // loaded from en.json
  var EN_TITLES = {};   // loaded from en.json ("_titles" map)
  var DE = {};          // captured from the authored HTML
  var DE_PH = {};
  var DE_ATTR = {};     // aria/title captured German values

  function nodes(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  // Capture the authored German strings (source of truth for DE, no-JS fallback).
  nodes('[data-i18n]').forEach(function (el) { DE[el.getAttribute('data-i18n')] = el.innerHTML; });
  nodes('[data-i18n-ph]').forEach(function (el) { DE_PH[el.getAttribute('data-i18n-ph')] = el.getAttribute('placeholder') || ''; });
  nodes('[data-i18n-aria]').forEach(function (el) { DE_ATTR['aria:' + el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label') || ''; });
  nodes('[data-i18n-title]').forEach(function (el) { DE_ATTR['title:' + el.getAttribute('data-i18n-title')] = el.getAttribute('title') || ''; });

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function currentLang() {
    var saved = store('imild-lang');
    if (LANGS.indexOf(saved) !== -1) return saved;
    var nav = (navigator.language || 'en').toLowerCase();
    return nav.indexOf('de') === 0 ? 'de' : 'en';
  }

  function txt(lang, key) {
    if (lang === MASTER) return EN[key] !== undefined ? EN[key] : DE[key];  // EN master, DE fallback
    return DE[key] !== undefined ? DE[key] : EN[key];                       // DE source, EN fallback
  }

  function apply(lang) {
    nodes('[data-i18n]').forEach(function (el) {
      var v = txt(lang, el.getAttribute('data-i18n'));
      if (v !== undefined) el.innerHTML = v;
    });
    nodes('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph');
      var v = lang === MASTER ? (EN[k] !== undefined ? EN[k] : DE_PH[k]) : DE_PH[k];
      if (v !== undefined) el.setAttribute('placeholder', String(v).replace(/&amp;/g, '&'));
    });
    nodes('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      var v = lang === MASTER ? (EN['aria:' + k] !== undefined ? EN['aria:' + k] : DE_ATTR['aria:' + k]) : DE_ATTR['aria:' + k];
      if (v !== undefined) el.setAttribute('aria-label', String(v).replace(/&amp;/g, '&'));
    });
    nodes('[data-i18n-title]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-title');
      var v = lang === MASTER ? (EN['title:' + k] !== undefined ? EN['title:' + k] : DE_ATTR['title:' + k]) : DE_ATTR['title:' + k];
      if (v !== undefined) el.setAttribute('title', String(v).replace(/&amp;/g, '&'));
    });

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', 'ltr');   // de/en are LTR; RTL langs handled by the product app
    document.title = lang === MASTER && EN_TITLES[page] ? EN_TITLES[page] : deTitle;

    nodes('.langbtn').forEach(function (b) { b.textContent = lang === MASTER ? 'DE' : 'EN'; });
    window.__imildLang = lang;
  }

  function bindToggle() {
    nodes('.langbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = window.__imildLang === MASTER ? 'de' : MASTER;
        store('imild-lang', next);
        apply(next);
      });
    });
  }

  function boot() {
    bindToggle();
    apply(currentLang());   // render immediately with what we have (DE always available)
  }

  // Load the English master file, then (re)render. Robust to fetch failure
  // (EN then falls back to the inline German source — no crash).
  fetch('assets/en.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (data) {
      EN = data || {};
      EN_TITLES = EN._titles || {};
      boot();
    })
    .catch(function () { boot(); });
})();
