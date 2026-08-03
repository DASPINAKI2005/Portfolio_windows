/**
 * Mobile Icons
 * Inline SVG icon set for the Android simulation (app icons + system icons).
 * All icons use viewBox="0 0 24 24" and scale via CSS.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});

    Android.Icons = {
        /* ---------- App icons ---------- */

        youtube:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4.8" width="20" height="14.4" rx="4" fill="#FF0000"/><path d="M10.2 9.2v5.6l4.9-2.8z" fill="#fff"/></svg>',

        contacts:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="#0F6CBD"/><path d="M12 13.6c-4.2 0-7.2 2.5-7.2 5.6V21h14.4v-1.8c0-3.1-3-5.6-7.2-5.6z" fill="#0F6CBD"/></svg>',

        whatsapp:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#25D366" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.1c-1.5 0-3-.4-4.3-1.1l-.3-.2-2.9.8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.5-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.7.9c-.2.2-.3.2-.6.1a6.5 6.5 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.7 2.6 4.2 3.7 1.6.7 2.1.7 2.9.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3z"/></svg>',

        chrome:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 2a10 10 0 0 1 9.4 6.6H12a5 5 0 0 0-4.5 2.9L4.4 4.9A10 10 0 0 1 12 2z" fill="#EA4335"/><path d="M7.5 11.6A5 5 0 0 0 12 17a5 5 0 0 0 4.4-2.6l-4 7A10 10 0 0 1 2.6 7.6l4.2 3z" fill="#FBBC05"/><path d="M12 17a5 5 0 0 1-4.5-2.9 5 5 0 0 1 .3-5L12 17z" fill="#34A853"/><circle cx="12" cy="12" r="2.6" fill="#4285F4"/></svg>',

        gmail:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2" fill="#fff"/><path d="M3 6l9 6.7L21 6" fill="none" stroke="#4285F4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.4 19L9.8 12.8M20.6 19l-6.4-6.2" stroke="#4285F4" stroke-width="2.4" stroke-linecap="round"/></svg>',

        maps:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 2a7 7 0 0 0-7 7c0 5.1 7 13 7 13s7-7.9 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.8" fill="#fff"/></svg>',

        instagram:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="ig-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F58529"/><stop offset=".5" stop-color="#DD2A7B"/><stop offset="1" stop-color="#8134AF"/></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="url(#ig-grad)"/><rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.4" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="16.7" cy="7.3" r="1.2" fill="#fff"/><circle cx="12" cy="12" r="3" fill="none" stroke="#fff" stroke-width="1.5"/></svg>',

        facebook:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#1877F2"/><path fill="#fff" d="M13.6 21.4v-7h2.3l.4-2.7h-2.7V9.8c0-.8.4-1.6 1.6-1.6h1.3V5.9s-1.1-.2-2.2-.2c-2.2 0-3.6 1.3-3.6 3.7v2.3H8.4v2.7h2.3v7z"/></svg>',

        photos:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 2a5 5 0 0 0-5 5v5h5a5 5 0 0 0 5-5 5 5 0 0 0-5-5z"/><path fill="#FBBC05" d="M2 12a5 5 0 0 0 5 5h5v-5H7a5 5 0 0 0-5 5z"/><path fill="#4285F4" d="M12 22a5 5 0 0 0 5-5v-5h-5a5 5 0 0 0-5 5 5 5 0 0 0 5 5z"/><path fill="#34A853" d="M22 12a5 5 0 0 0-5-5h-5v5a5 5 0 0 0 5 5 5 5 0 0 0 5-5z"/></svg>',

        drive:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M9.4 2.9h5.2L21 13.5 18 19H6l-3-5.5z"/><path fill="#FBBC05" d="M21 13.5 18 19H10.4l2.8-5z"/><path fill="#34A853" d="M6 19 3 13.5 9.4 2.9l2.7 5z"/><path fill="#4285F4" d="M21 13.5 13.2 2.9h1.4L21 13.5z"/></svg>',

        playstore:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00A0FF" d="M3 2.4 L13.5 12 L3 21.6 Z"/><path fill="#34B853" d="M13.5 12 L20.6 4.9 L3 2.4 Z"/><path fill="#FBBC04" d="M13.5 12 L20.6 19.1 L3 21.6 Z"/><path fill="#EA4335" d="M13.5 12 L20.6 19.1 L20.6 4.9 Z"/></svg>',

        google:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.4 5.4 0 0 1-2.3 3.6v3h3.7c2.2-2 3.6-5 3.6-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-3a6.8 6.8 0 0 1-10.3-2.5H2.1v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.9 15.6a7.2 7.2 0 0 1 0-7.2V5.3H2.1a12 12 0 0 0 0 13.4l3.8-3.1z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.3-3.3A12 12 0 0 0 2.1 5.3l3.8 3.1A7.2 7.2 0 0 1 12 4.8z"/></svg>',

        chatgpt:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5.5" fill="#10A37F"/><g stroke="#fff" stroke-width="2.1" stroke-linecap="round" fill="none"><path d="M12 4.6c3.3 0 5.2 2.2 5.2 4.9 0 3.2-2.1 4.9-5.2 4.9"/><path d="M12 19.4c-3.3 0-5.2-2.2-5.2-4.9 0-3.2 2.1-4.9 5.2-4.9"/></g><circle cx="12" cy="9.5" r="1.4" fill="#0b7f61"/></svg>',

        /* ---------- System / status bar icons ---------- */

        signal:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 18h3v3H2zm5-6h3v9H7zm5-7h3v16h-3zm5-3h3v19h-3z"/></svg>',

        wifi:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21l3.5-4.3a5 5 0 0 0-7 0zM12 6.8c3.5 0 6.7 1.3 9 3.4l-2 2.4a10.9 10.9 0 0 0-14 0l-2-2.4a13.9 13.9 0 0 1 9-3.4zm0-4.8c6.2 0 11.8 2.4 16 6.3l-2 2.4A18 18 0 0 0 12 4.8c-4.6 0-8.8 1.7-12 4.5l-2-2.4A20 20 0 0 1 12 2z" opacity=".9"/></svg>',

        battery:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 7h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm14 2v6h2V9z"/><rect x="5.6" y="8.6" width="10.8" height="6.8" rx="1" fill="currentColor"/></svg>',

        batteryLow:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 7h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm14 2v6h2V9z"/><rect x="5.6" y="8.6" width="5.4" height="6.8" rx="1" fill="currentColor"/></svg>',

        notifDot:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>',

        /* ---------- Navigation bar ---------- */

        navBack:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>',

        navHome:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.6c-4 0-7.3 3.3-7.3 7.4 0 4.1 3.3 7.4 7.3 7.4s7.3-3.3 7.3-7.4c0-4.1-3.3-7.4-7.3-7.4z"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/></svg>',

        navRecents:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 4h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm10 0h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM5 14h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2zm10 0h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z"/></svg>',

        /* ---------- App bar icons ---------- */

        search:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>',

        more:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>',

        close:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>',

        play:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',

        pause:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',

        skipPrev:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 5h2v14H7zM19 5v14L9.5 12z"/></svg>',

        skipNext:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15 5h2v14h-2zM5 5v14l9.5-7z"/></svg>',

        music:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h5V3z"/></svg>',

        mic:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z"/></svg>',

        send:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',

        attach:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6z"/></svg>',

        smile:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-3.5-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 17a5 5 0 0 0 4.5-3h-9A5 5 0 0 0 12 17z"/></svg>',

        arrowBack:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>',

        phone:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.2 1z"/></svg>',

        message:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 12H6v-2h12zm0-3H6V9h12zm0-3H6V6h12z"/></svg>',

        email:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg>',

        globe:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 8h-2.7a15 15 0 0 0-1.5-4.5A8 8 0 0 1 19.9 10zM12 4a13 13 0 0 1 2.4 6H9.6A13 13 0 0 1 12 4zM4.3 14a8 8 0 0 1 0-4h2.7a15 15 0 0 0 0 4zm1.8 2h2.7a15 15 0 0 0 1.5 4.5A8 8 0 0 1 6.1 16zm5.9 4a13 13 0 0 1-2.4-6h4.8a13 13 0 0 1-2.4 6zm3.4-1.5A15 15 0 0 0 16.9 14h2.7a8 8 0 0 1-4.2 4.5z"/></svg>',

        location:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',

        github:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 6.8 9.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 22 12 10 10 0 0 0 12 2z"/></svg>',

        linkedin:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9z"/></svg>',

        star:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17.3 6.2 20.5l1.1-6.4L2.4 9.4l6.4-.9L12 2.6l3.2 5.9 6.4.9-4.9 4.7 1.1 6.4z"/></svg>',

        download:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"/></svg>',

        grid:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h6v6H4zm0 10h6v6H4zm10-10h6v6h-6zm0 10h6v6h-6z"/></svg>',

        sort:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2H3zm0 5h14v2H3zm0 5h10v2H3z"/></svg>',

        refresh:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.76-4.24L13 11h7V4z"/></svg>',

        camera:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.4 3 7.9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.9l-1.5-2zM12 17.5A4.5 4.5 0 1 1 12 8.5a4.5 4.5 0 0 1 0 9z"/></svg>',

        lock:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM9 8V6a3 3 0 0 1 6 0v2z"/></svg>',

        account:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5z"/></svg>',

        spark:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l1.9 5.7L19.5 9l-5.6 1.3L12 16l-1.9-5.7L4.5 9l5.6-1.3z"/></svg>',

        award:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0-7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm6.5 3.5c0 1.9-.9 3.6-2.3 4.7l1.3 8.3-5.5-2.5-5.5 2.5 1.3-8.3A6.5 6.5 0 1 1 18.5 8.5z"/></svg>',

        photo:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>',

        folder:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 4 8 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/></svg>',

        doc:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm7 7V3.5L18.5 9z"/></svg>',

        airplane:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>',

        bluetooth:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.7 8 13 12l4.7 4L12 22h-1v-7.6L6.3 19 5 17.7 9.6 13 5 8.3 6.3 7 11 11.6V2h1zM13 5.8v3.8l1.9-1.9zM13 14.4v3.8l1.9-1.9z"/></svg>',

        flashlight:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h12v4H6zm1 5h10l1 3H6zM7 12h10l-1 9H8z"/></svg>',

        rotate:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4a8 8 0 0 1 8 8h2l-3 3-3-3h2a6 6 0 1 0-6 6v2a8 8 0 0 1 0-16zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>',

        moon:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',

        heart:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.8-10-9.3C.4 8.6 2.2 5 5.7 5c2 0 3.4 1 4.3 2.4C10.9 6 12.3 5 14.3 5c3.5 0 5.3 3.6 3.7 6.7C15.5 16.2 12 21 12 21z"/></svg>',

        comment:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.9 2 11.8c0 2.9 1.6 5.5 4.1 7.1-.2 1.3-.8 3.1-1.6 4.1 1.9 0 4-.7 5.4-1.9 1.6.5 3.4.7 5.1.7 5.5 0 10-3.9 10-8.9S17.5 3 12 3z"/></svg>',

        share:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 16.1a2.9 2.9 0 0 0-2.2 1L8.4 13a3 3 0 0 0 0-2l7.4-4.1a2.9 2.9 0 1 0-.9-1.3L7.5 9.7a2.9 2.9 0 1 0 0 4.6l7.4 4.1A2.9 2.9 0 1 0 18 16.1z"/></svg>',

        thumb:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 20h4V8H2zm20-11a2 2 0 0 0-2-2h-6.3l.9-4.5c.1-.5-.3-1-.8-1L8 6.6V20h10a2 2 0 0 0 2-1.4l2-9c.1-.5-.1-1-.2-1.6z"/></svg>',

        personAdd:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 2c-3.3 0-8 1.7-8 5v2h13v-2c0-3.3-4.7-5-8-5zM21 12h-2V9h-2v3h-2v2h2v3h2v-3h2z"/></svg>',

        check:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',

        cake:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 6v10H4V12c1.1 0 2 .9 2 2h3a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h3c1.1 0 2-.9 2-2z"/></svg>',

        edit:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>',

        pencil:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75zM3 17.25V21h3.75L17.8 9.94l-3.75-3.75z"/></svg>',

        drivePdf:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" fill="#EA4335"/><path fill="#fff" d="M8 8h2v8H9v-1H8zM11 8h2.5a2.5 2.5 0 0 1 0 5H12v3h-1zm1 4h1.5a1.5 1.5 0 0 0 0-3H12z"/></svg>',

        starBorder:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 17.3 6.2 20.5l1.1-6.4L2.4 9.4l6.4-.9L12 2.6l3.2 5.9 6.4.9-4.9 4.7 1.1 6.4z"/></svg>',

        info:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>',

        clock:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6 3.5 2-1 1.7-4.5-2.6V7h2z"/></svg>'
    };

    /** Returns the SVG markup for a named icon. */
    Android.Icons.get = function (name) {
        return Android.Icons[name] || '';
    };
})(window);
