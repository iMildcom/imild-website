/* Register the iMild.com service worker after load (non-blocking, progressive
 * enhancement). Failures are swallowed so they can never break the page. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {
      /* offline features simply stay off if registration fails */
    });
  });
}
