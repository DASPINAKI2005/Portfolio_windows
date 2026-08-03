/**
 * Mobile Shell
 * Builds the Android device frame: wallpaper layers, home mount, app mount,
 * status bar (live clock), navigation bar (back/home/overview), recents mount
 * and the quick-settings shade with gesture support.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;
    const I = Android.Icons;

    /** Wallpapers are crossfaded in order. Add more entries for a slideshow. */
    // TODO: Replace mobile/media/wallpaper.jpg with a personal wallpaper.
    const WALLPAPERS = ['mobile/media/wallpaper.jpg'];
    const WALLPAPER_SLIDESHOW_MS = 0; // 0 disables the slideshow

    const Shell = (Android.Shell = {
        root: null,
        screen: null,
        shade: null,
        shadeOpen: false,
        wallpaperLayers: [],
        wallpaperActive: 0,
        wallpaperTimer: null,
        dark: false,

        /* ---------------------------------------------------------- */

        build: function () {
            this.root = document.getElementById('android-root');
            if (!this.root || this.root.childElementCount > 0) return;

            this.screen = U.create('div', { class: 'android-screen' });
            this.root.appendChild(this.screen);

            this.buildWallpaper();
            this.screen.appendChild(U.create('div', { class: 'android-home' }));
            this.screen.appendChild(U.create('div', { class: 'android-apps' }));
            this.screen.appendChild(U.create('div', { class: 'android-recents', 'aria-hidden': 'true' }));
            this.buildShade();
            this.buildStatusbar();
            this.buildNavbar();
            this.bindGestures();
            this.startClock();
        },

        /* ---------------------------------------------------------- */
        /* Wallpaper with crossfade support                           */

        buildWallpaper: function () {
            const mount = U.create('div', { class: 'android-wallpaper' });
            WALLPAPERS.forEach(function (src, i) {
                const layer = U.create('div', { class: 'android-wallpaper__img' + (i === 0 ? ' is-active' : '') });
                layer.style.backgroundImage = 'url("' + src + '")';
                mount.appendChild(layer);
                Shell.wallpaperLayers.push(layer);
            });
            this.screen.appendChild(mount);

            if (WALLPAPER_SLIDESHOW_MS > 0 && WALLPAPERS.length > 1) {
                this.wallpaperTimer = setInterval(this.nextWallpaper.bind(this), WALLPAPER_SLIDESHOW_MS);
            }
        },

        nextWallpaper: function () {
            const next = (this.wallpaperActive + 1) % WALLPAPERS.length;
            const from = this.wallpaperLayers[this.wallpaperActive];
            const to = this.wallpaperLayers[next];
            to.style.backgroundImage = 'url("' + WALLPAPERS[next] + '")';
            to.classList.add('is-active');
            from.classList.remove('is-active');
            this.wallpaperActive = next;
        },

        setDark: function (isDark) {
            this.dark = isDark;
            this.screen.classList.toggle('is-dark', isDark);
        },

        /* ---------------------------------------------------------- */
        /* Status bar                                                 */

        buildStatusbar: function () {
            const bar = U.create('div', { class: 'android-statusbar', role: 'status' });
            const left = U.create('div', { class: 'android-statusbar__side', html: '<span class="android-statusbar__time" data-time>--:--</span><span class="android-statusbar__notif" aria-label="2 notifications">' + I.notifDot + '</span>' });
            const camera = U.create('div', { class: 'android-punch', 'aria-hidden': 'true' });
            const right = U.create('div', {
                class: 'android-statusbar__side android-statusbar__side--right',
                html: '<span aria-label="Signal strength">' + I.signal + '</span><span aria-label="Wi-Fi">' + I.wifi + '</span><span class="android-statusbar__battery" aria-label="Battery 85%">' + I.battery + '</span>'
            });
            bar.appendChild(left);
            bar.appendChild(camera);
            bar.appendChild(right);
            this.screen.appendChild(bar);
        },

        /* ---------------------------------------------------------- */
        /* Navigation bar (back / home / overview / lock)             */

        buildNavbar: function () {
            const bar = U.create('nav', {
                class: 'android-navbar',
                'aria-label': 'System navigation'
            });
            const buttons = [
                { action: 'nav-back', label: 'Back', icon: I.navBack },
                { action: 'nav-home', label: 'Home', icon: I.navHome },
                { action: 'nav-overview', label: 'Overview', icon: I.navRecents }
            ];
            buttons.forEach(function (btn) {
                const el = U.create('button', {
                    class: 'android-nav-btn android-ripple-target',
                    'data-nav': btn.action,
                    'aria-label': btn.label,
                    html: btn.icon
                });
                el.addEventListener('click', function () {
                    Shell.onNav(btn.action);
                });
                bar.appendChild(el);
            });
            this.screen.appendChild(bar);
        },

        onNav: function (action) {
            if (this.shadeOpen) {
                this.toggleShade(false);
                return;
            }
            if (action === 'nav-back') {
                Android.AppManager.back();
            } else if (action === 'nav-home') {
                Android.AppManager.goHome();
            } else if (action === 'nav-overview') {
                Android.Recents.toggle();
            } else if (action === 'nav-lock') {
                Android.Lock.lock();
            }
        },

        /* ---------------------------------------------------------- */
        /* Quick-settings shade                                       */

        buildShade: function () {
            const toggles = [
                { key: 'wifi', label: 'Wi-Fi', icon: I.wifi, on: true },
                { key: 'bt', label: 'Bluetooth', icon: I.bluetooth, on: false },
                { key: 'air', label: 'Airplane', icon: I.airplane, on: false },
                { key: 'torch', label: 'Flashlight', icon: I.flashlight, on: false },
                { key: 'rot', label: 'Auto-rotate', icon: I.rotate, on: true },
                { key: 'dark', label: 'Dark theme', icon: I.moon, on: false }
            ];
            const toggleHtml = toggles.map(function (t) {
                return (
                    '<button class="android-toggle android-ripple-target' + (t.on ? ' is-on' : '') + '" data-toggle="' + t.key + '" aria-pressed="' + t.on + '">' +
                    t.icon + '<span>' + t.label + '</span></button>'
                );
            }).join('');

            const shade = U.create('div', {
                class: 'android-shade',
                'aria-hidden': 'true',
                html:
                    '<div class="android-shade__head">' +
                    '<div><div class="android-shade__time" data-shade-time>--:--</div>' +
                    '<div class="android-shade__date" data-shade-date></div></div>' +
                    '<button class="android-shade__edit android-ripple-target" data-shade-edit aria-label="Edit quick settings">' + I.edit + '</button>' +
                    '</div>' +
                    '<div class="android-shade__toggles">' + toggleHtml + '</div>' +
                    '<div class="android-shade__bright">' +
                    '<span aria-hidden="true">' + I.spark + '</span>' +
                    '<input type="range" min="30" max="100" value="70" data-shade-brightness aria-label="Brightness">' +
                    '</div>' +
                    Android.Media.render() +
                    '<div class="android-shade__notifs">' +
                    '<div class="android-notif">' + I.whatsapp +
                    '<div class="android-notif__body"><strong>WhatsApp</strong><span>New message from Recruiter</span></div></div>' +
                    '<div class="android-notif">' + I.chatgpt +
                    '<div class="android-notif__body"><strong>ChatGPT</strong><span>Ready to help</span></div></div>' +
                    '</div>'
            });
            this.screen.appendChild(shade);
            this.shade = shade;
            Android.Media.bind(shade);

            shade.addEventListener('click', function (e) {
                const toggle = e.target.closest('[data-toggle]');
                if (toggle) {
                    const key = toggle.dataset.toggle;
                    const nowOn = !toggle.classList.contains('is-on');
                    toggle.classList.toggle('is-on', nowOn);
                    toggle.setAttribute('aria-pressed', String(nowOn));
                    if (key === 'dark') Shell.setDark(nowOn);
                    else U.toast((nowOn ? 'Turned on ' : 'Turned off ') + toggle.querySelector('span').textContent);
                    return;
                }
                if (e.target.closest('[data-shade-edit]')) {
                    U.toast('Editing quick settings');
                    return;
                }
                if (e.target === shade || e.target.closest('.android-shade__notifs')) {
                    Shell.toggleShade(false);
                }
            });

            const brightness = shade.querySelector('[data-shade-brightness]');
            brightness.addEventListener('input', function () {
                const value = Number(brightness.value) / 100;
                Shell.screen.style.filter = 'brightness(' + value + ')';
            });
        },

        toggleShade: function (open) {
            const isOpen = open === undefined ? !this.shadeOpen : open;
            this.shade.classList.toggle('is-open', isOpen);
            this.shade.setAttribute('aria-hidden', String(!isOpen));
            this.shadeOpen = isOpen;
        },

        /* ---------------------------------------------------------- */
        /* Gestures: swipe down for shade, swipe up to dismiss        */

        bindGestures: function () {
            let startY = 0;
            let startX = 0;
            let tracking = false;

            this.screen.addEventListener(
                'touchstart',
                function (e) {
                    const touch = e.touches[0];
                    startY = touch.clientY;
                    startX = touch.clientX;
                    tracking = startY < 90;
                },
                { passive: true }
            );

            this.screen.addEventListener(
                'touchmove',
                function (e) {
                    if (!tracking) return;
                    const touch = e.touches[0];
                    const dy = touch.clientY - startY;
                    if (Math.abs(touch.clientX - startX) > Math.abs(dy)) {
                        tracking = false;
                        return;
                    }
                    if (!Shell.shadeOpen && dy > 64) {
                        Shell.toggleShade(true);
                        tracking = false;
                    }
                },
                { passive: true }
            );

            this.shade.addEventListener(
                'touchstart',
                function (e) {
                    startY = e.touches[0].clientY;
                    tracking = true;
                },
                { passive: true }
            );

            this.shade.addEventListener(
                'touchmove',
                function (e) {
                    if (!tracking) return;
                    const dy = e.touches[0].clientY - startY;
                    if (dy < -48) {
                        Shell.toggleShade(false);
                        tracking = false;
                    }
                },
                { passive: true }
            );
        },

        /* ---------------------------------------------------------- */
        /* Live clock                                                 */

        startClock: function () {
            this.updateClock();
            setInterval(this.updateClock.bind(this), 10000);
        },

        updateClock: function () {
            const now = new Date();
            const time = U.formatTime(now);
            const date = U.formatDate(now);
            const timeEl = this.root.querySelector('[data-time]');
            if (timeEl && timeEl.textContent !== time) timeEl.textContent = time;
            const shadeTime = this.root.querySelector('[data-shade-time]');
            if (shadeTime) shadeTime.textContent = time;
            const shadeDate = this.root.querySelector('[data-shade-date]');
            if (shadeDate) shadeDate.textContent = date;
        }
    });
})(window);
