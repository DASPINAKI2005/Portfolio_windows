/**
 * Mobile Entry Point
 * Detects the mobile viewport (<= 1024px), lazily boots the Android
 * simulation only when needed, and wires up global keyboard controls.
 *
 * On desktop (>= 1025px) nothing here initializes - the mobile CSS hides
 * #android-root and the desktop build is untouched.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;

    let booted = false;

    function boot() {
        if (booted) return;
        booted = true;

        Android.Shell.build();
        Android.Home.build();
        Android.AppManager.init();
        Android.Recents.init();
        Android.Apps.bind(Android.Shell.root);
        Android.Keyboard.init();
        Android.Lock.lock();
    }

    /* ---------------------------------------------------------- */
    /* Global keyboard navigation (desktop previews, emulators)   */
    /* ---------------------------------------------------------- */

    Android.Keyboard = {
        init: function () {
            document.addEventListener('keydown', function (e) {
                if (!U.isMobile()) return;

                // While locked, only the lock screen reacts.
                if (Android.Lock.isLocked()) return;

                if (e.key === 'Escape') {
                    if (Android.Shell.shadeOpen) {
                        Android.Shell.toggleShade(false);
                    } else if (Android.Recents.isOpen) {
                        Android.Recents.close();
                    } else {
                        Android.AppManager.back();
                    }
                    return;
                }
                if (e.key === 'Home') {
                    e.preventDefault();
                    Android.AppManager.goHome();
                }
            });
        }
    };

    /* ---------------------------------------------------------- */
    /* Bootstrap with lazy init (only when the mobile breakpoint   */
    /* matches, or when the viewport is resized into it)           */
    /* ---------------------------------------------------------- */

    Android.init = function () {
        const mq = U.mobileMQ;
        const onMatch = function () {
            if (U.isMobile()) boot();
        };
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', onMatch);
        } else if (typeof mq.addListener === 'function') {
            mq.addListener(onMatch);
        }
        if (U.isMobile()) boot();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', Android.init);
    } else {
        Android.init();
    }
})(window);
