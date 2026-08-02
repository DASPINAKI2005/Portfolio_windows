/**
 * Welcome Overlay
 * Premium glassmorphism welcome screen.
 *
 * - Detects the device type from the screen width (768px breakpoint).
 * - Shows once per browser session using sessionStorage.
 * - Fades in, stays visible ~3s, fades out, then removes itself.
 * - Locks page scroll while visible.
 *
 * Self-contained and fully independent of the Windows / Android
 * simulations and the existing desktop engine in script.js.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'welcome-overlay-seen';
    var HOLD_MS = 3000;  // time the overlay stays fully visible
    var FADE_MS = 600;   // fade in / fade out duration

    // Only show once per browser session.
    var seen = false;
    try {
        seen = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
        // sessionStorage unavailable (private/blocked) -> just show once this load.
    }
    if (seen) return;

    var overlay = document.getElementById('welcome-overlay');
    var title = document.getElementById('welcome-title');
    if (!overlay) return;

    // Device detection via screen width (>=768px = Desktop/Laptop).
    var isDesktop = window.innerWidth >= 768;
    if (title) {
        title.textContent = isDesktop
            ? 'Welcome to the Windows 11 Portfolio Experience'
            : 'Welcome to the Android Portfolio Experience';
    }

    try {
        sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
        // Non-fatal: the overlay still plays on this load.
    }

    // Lock scrolling while visible (belt-and-suspenders; body is already hidden).
    document.documentElement.classList.add('welcome-lock');

    // Force a reflow so the opacity/scale enter transition actually animates.
    void overlay.offsetWidth;
    overlay.classList.add('is-visible');

    setTimeout(function () {
        overlay.classList.add('is-leaving');
        setTimeout(function () {
            overlay.remove();
            document.documentElement.classList.remove('welcome-lock');
        }, FADE_MS);
    }, HOLD_MS);
})();
