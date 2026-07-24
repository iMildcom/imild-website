/* ============================================================
   iMild.com — Login / Anmeldung (client logic)
   - No framework, no dependencies (PWA + native-wrapper friendly).
   - All user-facing text comes from the i18n layer (see #js-i18n).
   - OAuth uses the redirect flow: the backend owns client secrets;
     the browser only ever sees public authorize redirects.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.IMILD_AUTH || {};
  var API = (CFG.apiBase || '').replace(/\/+$/, '');

  /* Providers that are live today. Everything else is shown as "soon". */
  var READY = { google: 1, github: 1, gitlab: 1 };

  var card    = document.querySelector('.auth-card');
  var form    = document.getElementById('auth-form');
  var email   = document.getElementById('f-email');
  var pass    = document.getElementById('f-password');
  var name    = document.getElementById('f-name');
  var submit  = document.getElementById('auth-submit');
  var msgBox  = document.getElementById('auth-msg');
  var toast   = document.getElementById('toast');
  var i18nBox = document.getElementById('js-i18n');

  /* -------- i18n helper: read localized strings rendered by i18n.js -------- */
  function t(key, fallback) {
    var el = i18nBox && i18nBox.querySelector('[data-i18n="' + key + '"]');
    return (el && el.textContent.trim()) || fallback || '';
  }

  /* -------- safe return target (never trust an off-site redirect) -------- */
  function returnTo() {
    try {
      var p = new URLSearchParams(window.location.search).get('redirect');
      if (p && p.charAt(0) === '/' && p.charAt(1) !== '/') return p; // same-origin path only
    } catch (e) { /* ignore */ }
    return '/';
  }

  /* -------- toast -------- */
  var toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-show');
      toast.hidden = true;
    }, 3200);
  }

  /* -------- inline message under the form -------- */
  function setMsg(text, kind) {
    if (!msgBox) return;
    if (!text) { msgBox.hidden = true; msgBox.textContent = ''; msgBox.className = 'auth-msg'; return; }
    msgBox.textContent = text;
    msgBox.className = 'auth-msg ' + (kind === 'ok' ? 'is-ok' : 'is-error');
    msgBox.hidden = false;
  }

  /* ============================================================
     1) Login / Register mode toggle
     ============================================================ */
  var tabLogin    = document.getElementById('tab-login');
  var tabRegister = document.getElementById('tab-register');

  function setMode(mode) {
    var isReg = mode === 'register';
    card.setAttribute('data-mode', mode);

    tabLogin.classList.toggle('is-active', !isReg);
    tabRegister.classList.toggle('is-active', isReg);
    tabLogin.setAttribute('aria-selected', String(!isReg));
    tabRegister.setAttribute('aria-selected', String(isReg));

    /* password autocomplete must match the intent */
    pass.setAttribute('autocomplete', isReg ? 'new-password' : 'current-password');
    if (name) name.required = isReg;

    /* CTA label + primary tab-panel label */
    var label = submit.querySelector('.btn-label');
    label.textContent = isReg
      ? t('login.tab.signup', 'Registrieren') || 'Registrieren'
      : t('login.tab.signin', 'Anmelden') || 'Anmelden';
    form.setAttribute('aria-labelledby', isReg ? 'tab-register' : 'tab-login');

    setMsg('');
  }

  /* pull CTA labels from the visible tab buttons (already localized) */
  function ctaFromTabs(isReg) {
    return (isReg ? tabRegister : tabLogin).textContent.trim();
  }
  function syncCtaLabel() {
    submit.querySelector('.btn-label').textContent = ctaFromTabs(card.getAttribute('data-mode') === 'register');
  }

  tabLogin.addEventListener('click', function () { setMode('login'); syncCtaLabel(); });
  tabRegister.addEventListener('click', function () { setMode('register'); syncCtaLabel(); });
  document.getElementById('switch-mode').addEventListener('click', function () {
    setMode(card.getAttribute('data-mode') === 'register' ? 'login' : 'register');
    syncCtaLabel();
    (name && card.getAttribute('data-mode') === 'register' ? name : email).focus();
  });

  /* ============================================================
     2) Password visibility
     ============================================================ */
  var pwToggle = document.getElementById('pw-toggle');
  var pwUse    = document.getElementById('pw-eye');
  pwToggle.addEventListener('click', function () {
    var show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    pwUse.setAttribute('href', show ? '#ic-eye-off' : '#ic-eye');
    var lbl = show ? t('login.js.hidePw', 'Passwort verbergen') : t('login.js.showPw', 'Passwort anzeigen');
    pwToggle.setAttribute('aria-label', lbl);
    pwToggle.setAttribute('title', lbl);
  });

  /* ============================================================
     3) "More options" toggle
     ============================================================ */
  var moreToggle = document.getElementById('more-toggle');
  var morePanel  = document.getElementById('more-panel');
  moreToggle.addEventListener('click', function () {
    var open = moreToggle.getAttribute('aria-expanded') === 'true';
    moreToggle.setAttribute('aria-expanded', String(!open));
    morePanel.hidden = open;
  });

  /* ============================================================
     4) Provider buttons (OAuth redirect or "soon" toast)
     ============================================================ */
  function startOAuth(provider) {
    if (!API) { setMsg(t('login.js.errGeneric'), 'error'); return; }
    var url = API + '/auth/' + encodeURIComponent(provider) +
              '?redirect=' + encodeURIComponent(returnTo());
    window.location.assign(url);
  }

  document.querySelectorAll('.provider').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var provider = btn.getAttribute('data-provider');
      if (READY[provider]) startOAuth(provider);
      else showToast(t('login.js.soon', 'Bald verfügbar.'));
    });
  });

  /* ============================================================
     5) Email / password submit (login + register)
     ============================================================ */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(isReg) {
    if (isReg && name && !name.value.trim()) { name.focus(); return t('login.js.errName'); }
    if (!EMAIL_RE.test(email.value.trim()))  { email.focus(); return t('login.js.errEmail'); }
    if (pass.value.length < 8)               { pass.focus();  return t('login.js.errPassword'); }
    return null;
  }

  function busy(on) {
    submit.disabled = on;
    submit.classList.toggle('is-busy', on);
    form.classList.toggle('is-loading', on);
  }

  function post(path, body) {
    return fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var isReg = card.getAttribute('data-mode') === 'register';

    var err = validate(isReg);
    if (err) { setMsg(err, 'error'); return; }
    if (!API) { setMsg(t('login.js.errGeneric'), 'error'); return; }

    setMsg('');
    busy(true);

    var path = isReg ? '/auth/register' : '/auth/login';
    var body = { email: email.value.trim(), password: pass.value };
    if (isReg && name) body.name = name.value.trim();

    post(path, body).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    }).then(function (r) {
      if (r.ok) {
        setMsg(isReg ? t('login.js.okRegistered') : t('login.js.okSignedin'), 'ok');
        var dest = (r.data && typeof r.data.redirect === 'string' && r.data.redirect.charAt(0) === '/')
          ? r.data.redirect : returnTo();
        setTimeout(function () { window.location.assign(dest); }, 700);
      } else {
        busy(false);
        /* Prefer a server-provided, already-localized message when present. */
        var m = (r.data && (r.data.message || r.data.error)) || t('login.js.errGeneric');
        setMsg(m, 'error');
      }
    }).catch(function () {
      busy(false);
      setMsg(t('login.js.errNetwork'), 'error');
    });
  });

  /* ============================================================
     6) Forgot password (minimal: send reset link for entered email)
     ============================================================ */
  document.getElementById('forgot-link').addEventListener('click', function () {
    var addr = email.value.trim();
    if (!EMAIL_RE.test(addr)) { email.focus(); setMsg(t('login.js.errForgotEmail'), 'error'); return; }
    if (!API) { setMsg(t('login.js.errGeneric'), 'error'); return; }
    busy(true);
    post('/auth/password/forgot', { email: addr }).then(function () {
      /* Always report success — never reveal whether an account exists. */
      busy(false);
      setMsg(t('login.js.okForgot'), 'ok');
    }).catch(function () {
      busy(false);
      setMsg(t('login.js.errNetwork'), 'error');
    });
  });

  /* ============================================================
     7) OAuth callback errors surfaced via ?error=... on this page
     ============================================================ */
  try {
    var qErr = new URLSearchParams(window.location.search).get('error');
    if (qErr) setMsg(t('login.js.errGeneric'), 'error');
  } catch (e) { /* ignore */ }

  /* keep CTA label correct once i18n has rendered */
  window.addEventListener('load', syncCtaLabel);
})();
