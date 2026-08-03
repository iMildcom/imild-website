/* ============================================================
   iMild.com — i18n v2 (51 languages)
   German is authored inline in the HTML and captured at runtime.
   Every other language lives in assets/lang-<code>.json
   (format: { "titles": {...}, "strings": {...} }).
   Fallback chain: chosen language → English → German (inline).
   Emails are assembled at runtime (harvesting protection).
   ============================================================ */
(function () {
  'use strict';

  /* code, native name, rtl? */
  var LANGS = [
    ['de', 'Deutsch'], ['en', 'English'], ['es', 'Español'], ['fr', 'Français'],
    ['it', 'Italiano'], ['pt', 'Português'], ['nl', 'Nederlands'], ['sv', 'Svenska'],
    ['no', 'Norsk'], ['da', 'Dansk'], ['fi', 'Suomi'], ['pl', 'Polski'],
    ['cs', 'Čeština'], ['sk', 'Slovenčina'], ['hu', 'Magyar'], ['ro', 'Română'],
    ['bg', 'Български'], ['el', 'Ελληνικά'], ['hr', 'Hrvatski'], ['sr', 'Srpski'],
    ['sl', 'Slovenščina'], ['lt', 'Lietuvių'], ['lv', 'Latviešu'], ['et', 'Eesti'],
    ['ru', 'Русский'], ['uk', 'Українська'], ['tr', 'Türkçe'],
    ['ar', 'العربية', 1], ['he', 'עברית', 1], ['fa', 'فارسی', 1], ['ur', 'اردو', 1],
    ['hi', 'हिन्दी'], ['bn', 'বাংলা'], ['pa', 'ਪੰਜਾਬੀ'], ['gu', 'ગુજરાતી'],
    ['mr', 'मराठी'], ['ta', 'தமிழ்'], ['te', 'తెలుగు'], ['kn', 'ಕನ್ನಡ'],
    ['ml', 'മലയാളം'], ['si', 'සිංහල'], ['ne', 'नेपाली'],
    ['zh', '中文'], ['ja', '日本語'], ['ko', '한국어'], ['th', 'ไทย'],
    ['vi', 'Tiếng Việt'], ['id', 'Bahasa Indonesia'], ['ms', 'Bahasa Melayu'],
    ['tl', 'Filipino'], ['sw', 'Kiswahili']
  ];
  var CODES = LANGS.map(function (l) { return l[0]; });
  var RTL = { ar: 1, he: 1, fa: 1, ur: 1 };
  var DOMAIN = 'iMild.com';

  var DE = {}, DE_PH = {};
  var deTitle = document.title;
  var page = document.body.getAttribute('data-page') || '';
  var cache = {};              /* code -> {titles, strings} */

  function nodes(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  nodes('[data-i18n]').forEach(function (el) { DE[el.getAttribute('data-i18n')] = el.innerHTML; });
  nodes('[data-i18n-ph]').forEach(function (el) { DE_PH[el.getAttribute('data-i18n-ph')] = el.getAttribute('placeholder') || ''; });

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* -------- e-mail harvesting protection -------- */
  function emails() {
    nodes('.em').forEach(function (el) {
      var u = el.getAttribute('data-u'); if (!u) return;
      var addr = u + '@' + DOMAIN;
      el.textContent = addr;
      if (el.tagName === 'A' && !el.classList.contains('em-link')) {
        el.setAttribute('href', 'mail' + 'to:' + addr);
      }
    });
    nodes('.em-link').forEach(function (el) {
      var u = el.getAttribute('data-u'); if (!u) return;
      var addr = u + '@' + DOMAIN;
      var subj = '[' + DOMAIN + '] ' + (el.getAttribute('data-s') || '');
      el.setAttribute('href', 'mail' + 'to:' + addr + '?subject=' + encodeURIComponent(subj));
    });
  }

  /* -------- language detection -------- */
  function detect() {
    var saved = store('imild-lang');
    if (saved && CODES.indexOf(saved) !== -1) return saved;
    var prefs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < prefs.length; i++) {
      var p = String(prefs[i]).toLowerCase();
      if (CODES.indexOf(p) !== -1) return p;
      var base = p.split('-')[0];
      if (CODES.indexOf(base) !== -1) return base;
    }
    return 'en';
  }

  /* -------- dictionary loading with fallback chain -------- */
  function load(code) {
    if (code === 'de') return Promise.resolve({ titles: {}, strings: DE });
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch('assets/lang-' + code + '.json').then(function (r) {
      if (!r.ok) throw new Error(code);
      return r.json();
    }).then(function (data) { cache[code] = data; return data; });
  }

  function render(code, dict, enDict) {
    var strings = dict.strings || {};
    var fallback = (enDict && enDict.strings) || {};
    nodes('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = strings[k] !== undefined ? strings[k] : (fallback[k] !== undefined ? fallback[k] : DE[k]);
      if (v !== undefined) el.innerHTML = v;
    });
    nodes('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph');
      var v = strings[k] !== undefined ? strings[k] : (fallback[k] !== undefined ? fallback[k] : DE_PH[k]);
      if (v !== undefined) el.setAttribute('placeholder', String(v).replace(/&amp;/g, '&'));
    });
    var titles = dict.titles || {};
    var enTitles = (enDict && enDict.titles) || {};
    document.title = titles[page] || enTitles[page] || deTitle;
    document.documentElement.setAttribute('lang', code);
    document.documentElement.setAttribute('dir', RTL[code] ? 'rtl' : 'ltr');
    nodes('.langsel').forEach(function (s) { s.value = code; });
    emails();
    window.__imildLang = code;
  }

  function apply(code) {
    if (code === 'de') { render('de', { titles: {}, strings: DE }); return; }
    var wantEnFallback = code !== 'en' ? load('en').catch(function () { return null; }) : Promise.resolve(null);
    Promise.all([load(code), wantEnFallback]).then(function (res) {
      render(code, res[0], res[1]);
    }).catch(function () {
      /* chosen language unavailable → English → German */
      if (code !== 'en') {
        load('en').then(function (en) { render('en', en, null); })
                  .catch(function () { render('de', { titles: {}, strings: DE }); });
      } else {
        render('de', { titles: {}, strings: DE });
      }
    });
  }

  /* -------- picker: turn the old DE/EN button into a full selector -------- */
  nodes('.langbtn').forEach(function (btn) {
    var sel = document.createElement('select');
    sel.className = 'langsel';
    sel.setAttribute('aria-label', 'Sprache wählen / Choose language');
    LANGS.forEach(function (l) {
      var o = document.createElement('option');
      o.value = l[0];
      o.textContent = l[1];
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      store('imild-lang', sel.value);
      apply(sel.value);
    });
    btn.parentNode.replaceChild(sel, btn);
  });

   /* search snippet must follow the chosen language (2026-07-26) */
   (function () {
      function sync() {
         var l = document.querySelector('.lead'), d = document.querySelector('meta[name="description"]');
         if (l && d) d.setAttribute('content', l.textContent.replace(/\s+/g, ' ').trim());
      }
      new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      sync();
   })();
   
  var initial = detect();
  nodes('.langsel').forEach(function (s) { s.value = initial; });
  apply(initial);
})();
