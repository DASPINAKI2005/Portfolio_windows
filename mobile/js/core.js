/**
 * Mobile Core
 * Shared utilities, viewport detection, ripple, and toast/snackbar.
 * Pure additive layer - never touches desktop code.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});

    const U = (Android.Utils = {});

    /** Breakpoint used to switch desktop <-> mobile (matches gate.css). */
    U.MOBILE_QUERY = '(max-width: 1024px)';
    U.mobileMQ = global.matchMedia(U.MOBILE_QUERY);

    U.isMobile = function () {
        return U.mobileMQ.matches;
    };

    U.reducedMotion = function () {
        return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    /** Creates a DOM element from a tag name and attribute map. */
    U.create = function (tag, attrs) {
        const el = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach((key) => {
                if (key === 'class') {
                    el.className = attrs[key];
                } else if (key === 'html') {
                    el.innerHTML = attrs[key];
                } else if (key in el && key !== 'style') {
                    try {
                        el[key] = attrs[key];
                    } catch (e) {
                        el.setAttribute(key, attrs[key]);
                    }
                } else {
                    el.setAttribute(key, attrs[key]);
                }
            });
        }
        return el;
    };

    /** HTML-escapes a value for safe interpolation. */
    U.esc = function (value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    /** Throttles a function using a leading + trailing edge. */
    U.throttle = function (fn, wait) {
        let timer = null;
        let lastRun = 0;
        return function (...args) {
            const now = Date.now();
            const ctx = this;
            if (now - lastRun >= wait) {
                lastRun = now;
                fn.apply(ctx, args);
            } else {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    lastRun = Date.now();
                    fn.apply(ctx, args);
                }, wait - (now - lastRun));
            }
        };
    };

    /** Debounces a function (fires after activity stops). */
    U.debounce = function (fn, wait) {
        let timer = null;
        return function (...args) {
            const ctx = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(ctx, args);
            }, wait);
        };
    };

    /** Delegated event binding for a container. */
    U.on = function (el, type, selector, handler) {
        el.addEventListener(type, function (e) {
            const target = e.target && e.target.closest ? e.target.closest(selector) : null;
            if (target) handler.call(target, e, target);
        });
        return el;
    };

    /** Material-style touch ripple on a positioned, overflow-hidden surface. */
    U.ripple = function (x, y, surface) {
        if (U.reducedMotion()) return;
        const rect = surface.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.1;
        const ripple = U.create('span', { class: 'android-ripple' });
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x - rect.left - size / 2 + 'px';
        ripple.style.top = y - rect.top - size / 2 + 'px';
        surface.appendChild(ripple);
        ripple.addEventListener('animationend', function () {
            ripple.remove();
        });
    };

    /** Global snackbar shown inside the phone screen. */
    U.toast = function (message) {
        const root = document.getElementById('android-root');
        if (!root) return;
        let toast = root.querySelector('.android-toast');
        if (!toast) {
            toast = U.create('div', {
                class: 'android-toast',
                role: 'status',
                'aria-live': 'polite'
            });
            root.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.remove('android-toast--out');
        toast.classList.add('android-toast--in');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () {
            toast.classList.add('android-toast--out');
        }, 2200);
    };

    /** Delegated ripple: any element with .android-ripple-target receives one. */
    document.addEventListener(
        'pointerdown',
        function (e) {
            const target = e.target && e.target.closest ? e.target.closest('.android-ripple-target') : null;
            if (target) U.ripple(e.clientX, e.clientY, target);
        },
        { passive: true }
    );

    /** Simple animation helpers returning CSS transition handlers. */
    U.animate = function (el, frames, duration, fill) {
        return new Promise(function (resolve) {
            const reduced = U.reducedMotion();
            if (reduced) {
                resolve();
                return;
            }
            const anim = el.animate(frames, {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: fill || 'both'
            });
            anim.onfinish = resolve;
        });
    };

    /** Formats a Date as a 12-hour time string for the status bar. */
    U.formatTime = function (date) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    U.formatDate = function (date) {
        return date.toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    /** Formats seconds as m:ss for media time labels. */
    U.formatDuration = function (seconds) {
        const s = Math.max(0, Math.floor(seconds || 0));
        const m = Math.floor(s / 60);
        return m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
    };
})(window);
