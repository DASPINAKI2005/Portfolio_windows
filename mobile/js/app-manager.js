/**
 * Mobile App Manager
 * Opens apps full-screen with splash + enter animation, manages the app
 * stack (z-order), handles system back (in-app overlays first, then close)
 * and the Home action.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;

    const SPLASH_MS = 460;
    const CLOSE_MS = 200;

    const AppManager = (Android.AppManager = {
        mount: null,
        stack: [], // { id, holder, app }

        init: function () {
            this.mount = Android.Shell.root.querySelector('.android-apps');
        },

        /** Opens (or focuses, if already open) an app by id. */
        open: function (appId) {
            const app = Android.Apps.get(appId);
            if (!app) return;

            if (Android.Shell.shadeOpen) Android.Shell.toggleShade(false);
            if (Android.Recents.isOpen) Android.Recents.close();

            const existing = this.find(appId);
            if (existing) {
                this.focus(existing);
                return;
            }

            const holder = U.create('div', { class: 'android-app-instance' });
            holder.innerHTML = Android.Apps.render(appId);
            const appEl = holder.firstElementChild;

            this.mount.appendChild(holder);
            this.mount.classList.add('has-apps');

            const instance = { id: appId, holder: holder, app: appEl };
            this.stack.push(instance);

            this.focus(instance);
            this.showSplash(app, instance);

            if (appEl) {
                appEl.setAttribute('aria-hidden', 'false');
                appEl.focus({ preventScroll: true });
            }
        },

        find: function (appId) {
            for (let i = this.stack.length - 1; i >= 0; i--) {
                if (this.stack[i].id === appId) return this.stack[i];
            }
            return null;
        },

        top: function () {
            return this.stack[this.stack.length - 1] || null;
        },

        /** Brings an app instance to the top of the stack. */
        focus: function (instance) {
            this.stack.forEach(function (s, i) {
                s.holder.style.zIndex = String(3 + i);
            });
            this.stack.forEach(function (s) {
                s.app.classList.remove('is-top');
            });
            if (instance.app) instance.app.classList.add('is-top');
        },

        /** Colored splash with the app icon on cold open. */
        showSplash: function (app, instance) {
            if (U.reducedMotion()) return;
            const splash = U.create('div', { class: 'android-splash' });
            splash.style.background = app.splash;
            splash.innerHTML = '<span class="android-splash__icon">' + app.icon + '</span>';
            Android.Shell.screen.appendChild(splash);
            setTimeout(function () {
                splash.classList.add('is-done');
                setTimeout(function () {
                    splash.remove();
                }, 260);
            }, SPLASH_MS);
        },

        /** System back: recents -> in-app overlay -> close top app. */
        back: function () {
            if (Android.Recents.isOpen) {
                Android.Recents.close();
                return;
            }
            const top = this.top();
            if (!top || !top.app) return;

            const root = top.app;
            const openOverlay = root.querySelector('.is-open');
            if (openOverlay) {
                const closeBtn = openOverlay.querySelector('[data-action*="close"]');
                if (closeBtn) {
                    closeBtn.click();
                    return;
                }
            }
            const thread = root.querySelector('.whatsapp__thread:not([hidden])');
            if (thread) {
                const backBtn = root.querySelector('[data-action="whatsapp-back"]');
                if (backBtn) {
                    backBtn.click();
                    return;
                }
            }
            this.close(top);
        },

        /** Closes an app instance with an exit animation. */
        close: function (instance) {
            const idx = this.stack.indexOf(instance);
            if (idx === -1) return;

            if (instance.app) {
                instance.app.classList.add('is-closing');
                setTimeout(function () {
                    instance.holder.remove();
                }, U.reducedMotion() ? 0 : CLOSE_MS);
            } else {
                instance.holder.remove();
            }
            this.stack.splice(idx, 1);
            if (this.stack.length === 0) {
                this.mount.classList.remove('has-apps');
            }
        },

        /** Home button: show home screen, dismiss recents + shade. */
        goHome: function () {
            Android.Recents.close();
            Android.Shell.toggleShade(false);
            Android.Home.reset();
            const top = this.top();
            if (top && top.app) top.app.setAttribute('aria-hidden', 'true');
        }
    });
})(window);
