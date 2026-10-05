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
    // TODO: Replace the mobile wallpaper in assets/images/wallpapers/.
    const WALLPAPERS = ['assets/images/wallpapers/mobile-wallpaper.jpg'];
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

/**
 * Mobile Media Player (T-010)
 * Simulated media player card rendered inside the quick-settings shade.
 * No real audio: a playlist of portfolio-themed tracks with play/pause,
 * prev/next, seek and an elapsed-time ticker while "playing".
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const I = Android.Icons;
    const U = Android.Utils;

    /** Edit the track list to customize what plays in the shade. */
    const PLAYLIST = [
        { title: 'Nova â€” Lo-Fi Focus', artist: 'Pinaki Das', album: 'AI Sessions', dur: 214, grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
        { title: 'Object Detection Beats', artist: 'Pinaki Das', album: 'AI Sessions', dur: 258, grad: 'linear-gradient(135deg,#60a5fa,#a78bfa)' },
        { title: 'The Eighth Wonder', artist: 'Pinaki Das', album: 'Idea Synths', dur: 372, grad: 'linear-gradient(135deg,#f472b6,#fb923c)' },
        { title: 'Pythonic Groove', artist: 'Pinaki Das', album: 'Idea Synths', dur: 186, grad: 'linear-gradient(135deg,#38bdf8,#10b981)' }
    ];

    const Media = (Android.Media = {
        index: 0,
        pos: 0,
        playing: false,
        timer: null,
        _card: null,

        /* ---------------------------------------------------------- */

        track: function () {
            return PLAYLIST[this.index];
        },

        /** Returns the media card markup for the shade. */
        render: function () {
            const t = this.track();
            return (
                '<div class="android-shade__media" data-media-card>' +
                '<div class="android-shade__media-head">' +
                '<span class="android-shade__media-art" style="--g:' + t.grad + '" aria-hidden="true">' + I.music + '</span>' +
                '<div class="android-shade__media-info">' +
                '<strong data-media-title>' + U.esc(t.title) + '</strong>' +
                '<span data-media-artist>' + U.esc(t.artist) + ' Â· ' + U.esc(t.album) + '</span>' +
                '</div>' +
                '<button type="button" class="android-shade__media-clear android-ripple-target" data-media-action="clear" aria-label="Close player">' + I.close + '</button>' +
                '</div>' +
                '<div class="android-shade__media-track" data-media-track role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">' +
                '<span class="android-shade__media-fill" data-media-fill><span class="android-shade__media-knob"></span></span>' +
                '</div>' +
                '<div class="android-shade__media-foot">' +
                '<span class="android-shade__media-time" data-media-current>0:00</span>' +
                '<div class="android-shade__media-controls">' +
                '<button type="button" class="android-shade__media-btn android-ripple-target" data-media-action="prev" aria-label="Previous track">' + I.skipPrev + '</button>' +
                '<button type="button" class="android-shade__media-btn android-shade__media-btn--play android-ripple-target" data-media-action="toggle" aria-label="Play or pause" aria-pressed="false">' + I.play + '</button>' +
                '<button type="button" class="android-shade__media-btn android-ripple-target" data-media-action="next" aria-label="Next track">' + I.skipNext + '</button>' +
                '</div>' +
                '<span class="android-shade__media-time" data-media-duration>0:00</span>' +
                '</div>' +
                '</div>'
            );
        },

        /** Binds the card controls; scope is the shade element. */
        bind: function (scope) {
            this._card = scope.querySelector('[data-media-card]');
            if (!this._card) return;

            scope.addEventListener('click', function (e) {
                const btn = e.target.closest ? e.target.closest('[data-media-action]') : null;
                if (!btn) return;
                Media.action(btn.dataset.mediaAction);
            });

            const trackEl = this._card.querySelector('[data-media-track]');
            const seekFrom = function (e) {
                const rect = trackEl.getBoundingClientRect();
                const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
                Media.seek(rect.width ? x / rect.width : 0);
            };
            trackEl.addEventListener('pointerdown', function (e) {
                e.preventDefault();
                if (trackEl.setPointerCapture) trackEl.setPointerCapture(e.pointerId);
                seekFrom(e);
            });
            trackEl.addEventListener('pointermove', function (e) {
                if (trackEl.hasPointerCapture && !trackEl.hasPointerCapture(e.pointerId)) return;
                seekFrom(e);
            });
            trackEl.addEventListener('keydown', function (e) {
                const step = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
                if (!step) return;
                e.preventDefault();
                const t = Media.track();
                Media.seek((Media.pos + step) / t.dur);
            });

            this.update();
        },

        /* ---------------------------------------------------------- */
        /* Transport controls                                          */

        action: function (name) {
            if (name === 'toggle') this.toggle();
            else if (name === 'next') this.next();
            else if (name === 'prev') this.prev();
            else if (name === 'clear') this.clear();
        },

        toggle: function () {
            this.playing = !this.playing;
            if (this.playing) this.startTicker();
            else this.stopTicker();
            this.update();
        },

        play: function () {
            if (!this.playing) {
                this.playing = true;
                this.startTicker();
                this.update();
            }
        },

        next: function () {
            this.index = (this.index + 1) % PLAYLIST.length;
            this.pos = 0;
            this.update();
        },

        prev: function () {
            if (this.pos > 3) {
                this.pos = 0;
                this.update();
                return;
            }
            this.index = (this.index - 1 + PLAYLIST.length) % PLAYLIST.length;
            this.pos = 0;
            this.update();
        },

        seek: function (frac) {
            const t = this.track();
            this.pos = Math.max(0, Math.min(t.dur - 1, Math.round(frac * t.dur)));
            this.update();
        },

        clear: function () {
            this.stopTicker();
            this.playing = false;
            this.index = 0;
            this.pos = 0;
            this.update();
        },

        /* ---------------------------------------------------------- */

        startTicker: function () {
            if (this.timer) return;
            this.timer = setInterval(this.tick.bind(this), 1000);
        },

        stopTicker: function () {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },

        tick: function () {
            const t = this.track();
            this.pos += 1;
            if (this.pos >= t.dur) this.next();
            else this.update();
        },

        /* ---------------------------------------------------------- */

        update: function () {
            if (!this._card) return;
            const t = this.track();
            const frac = t.dur ? this.pos / t.dur : 0;
            const fill = this._card.querySelector('[data-media-fill]');
            if (fill) fill.style.width = (frac * 100) + '%';
            const cur = this._card.querySelector('[data-media-current]');
            if (cur) cur.textContent = U.formatDuration(this.pos);
            const dur = this._card.querySelector('[data-media-duration]');
            if (dur) dur.textContent = U.formatDuration(t.dur);
            const title = this._card.querySelector('[data-media-title]');
            if (title) title.textContent = t.title;
            const artist = this._card.querySelector('[data-media-artist]');
            if (artist) artist.textContent = t.artist + ' Â· ' + t.album;
            const art = this._card.querySelector('.android-shade__media-art');
            if (art) art.style.setProperty('--g', t.grad);
            const playBtn = this._card.querySelector('[data-media-action="toggle"]');
            if (playBtn) {
                playBtn.innerHTML = this.playing ? I.pause : I.play;
                playBtn.setAttribute('aria-pressed', String(this.playing));
            }
            const trackEl = this._card.querySelector('[data-media-track]');
            if (trackEl) trackEl.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
            this._card.classList.toggle('is-playing', this.playing);
        }
    });
})(window);

/**
 * Mobile Home
 * Renders the Android home screen: search pill, paged app grid, page
 * indicators and the dock. Grid and dock apps come from the app registry.
 *
 * T-009: long-press drag on grid icons to reorder, create folders, drop on
 * folders, or remove apps; folders open in an overlay (rename + launch);
 * removed apps can be restored from the drag edit bar. Layout persists to
 * localStorage (android_home_layout).
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;
    const I = Android.Icons;
    const esc = U.esc;

    const APPS_PER_PAGE = 20;
    const LONG_PRESS_MS = 450;
    const MOVE_CANCEL = 14;

    function appCell(app) {
        return (
            '<button class="android-app-icon android-ripple-target" data-action="open-app" data-app="' +
            esc(app.id) + '" aria-label="Open ' + esc(app.name) + '">' +
            '<span class="android-app-icon__glyph">' + app.icon + '</span>' +
            '<span class="android-app-icon__label">' + esc(app.name) + '</span>' +
            '</button>'
        );
    }

    const Home = (Android.Home = {
        mount: null,
        pages: null,
        indicators: null,
        pageIndex: 0,

        layout: [],
        removed: [],
        drag: null,
        overlay: null,
        currentFolder: null,
        dropKind: null,
        dropTargetId: null,
        _suppressClick: false,

        STORE: 'android_home_layout',

        build: function () {
            const root = Android.Shell.root;
            this.mount = root.querySelector('.android-home');
            if (!this.mount || this.mount.childElementCount > 0) return;

            this.loadLayout();

            this.mount.innerHTML =
                '<button class="android-home__search android-ripple-target" data-action="open-app" data-app="google" aria-label="Open Google search">' +
                '<span class="android-home__search-ico">' + I.google + '</span>' +
                '<span class="android-home__search-text">Search</span>' +
                '<span class="android-home__mic" aria-hidden="true">' + I.mic + '</span>' +
                '</button>' +
                '<div class="android-home__pages" aria-label="Home screen apps"></div>' +
                '<div class="android-home__indicators" aria-hidden="true"></div>' +
                '<div class="android-home__dock" aria-label="App dock"></div>' +
                '<div class="android-editbar">' +
                '<div class="android-editbar__zone" data-drop-remove>' +
                '<span class="android-editbar__trash" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM8 9h8v10H8V9zm3.5-5h1l.5.5H18v2H6v-2h5l.5-.5z"/></svg></span>' +
                '<span>Drop to remove</span>' +
                '</div>' +
                '<div class="android-editbar__restore" data-restore-chips></div>' +
                '</div>';

            this.pages = this.mount.querySelector('.android-home__pages');
            this.indicators = this.mount.querySelector('.android-home__indicators');
            this.editBar = this.mount.querySelector('.android-editbar');

            this.renderPages();
            this.renderDock();
            this.bindPagination();
            this.bindKeyboard();
            this.bindDrag();
            this.bindEditBar();
        },

        /* ---------------------------------------------------------- */
        /* Layout persistence                                          */
        /* ---------------------------------------------------------- */

        defaultLayout: function () {
            return Android.Apps.gridApps.map(function (a) {
                return { type: 'app', id: a.id };
            });
        },

        loadLayout: function () {
            let saved = null;
            try { saved = JSON.parse(localStorage.getItem(this.STORE)); } catch (e) {}
            if (saved && Array.isArray(saved.layout)) {
                this.removed = Array.isArray(saved.removed) ? saved.removed : [];
                this.layout = [];
                saved.layout.forEach(function (entry) {
                    if (entry.type === 'folder') {
                        if (Array.isArray(entry.apps)) {
                            entry.apps = entry.apps.filter(function (id) { return Android.Apps.get(id); });
                            if (entry.apps.length) this.layout.push(entry);
                        }
                    } else if (Android.Apps.get(entry.id) && this.removed.indexOf(entry.id) === -1) {
                        this.layout.push(entry);
                    }
                }, this);
                const seen = {};
                this.layout.forEach(function (e) {
                    if (e.type === 'app') seen[e.id] = true;
                    else if (Array.isArray(e.apps)) e.apps.forEach(function (id) { seen[id] = true; });
                });
                Android.Apps.gridApps.forEach(function (a) {
                    if (!seen[a.id] && this.removed.indexOf(a.id) === -1) {
                        this.layout.push({ type: 'app', id: a.id });
                    }
                }, this);
                return;
            }
            this.removed = [];
            this.layout = this.defaultLayout();
        },

        saveLayout: function () {
            try {
                localStorage.setItem(this.STORE, JSON.stringify({
                    layout: this.layout,
                    removed: this.removed
                }));
            } catch (e) {}
        },

        folderById: function (id) {
            for (let i = 0; i < this.layout.length; i++) {
                if (this.layout[i].type === 'folder' && this.layout[i].id === id) return this.layout[i];
            }
            return null;
        },

        /* ---------------------------------------------------------- */
        /* Rendering                                                   */
        /* ---------------------------------------------------------- */

        renderPages: function () {
            const layout = this.layout;
            let pagesHtml = '';
            let dotsHtml = '';
            for (let i = 0; i < layout.length; i += APPS_PER_PAGE) {
                const slice = layout.slice(i, i + APPS_PER_PAGE);
                pagesHtml += '<div class="android-home__page">' + slice.map(this.renderCell, this).join('') + '</div>';
                dotsHtml += '<span class="android-dot' + (i === 0 ? ' is-active' : '') + '"></span>';
            }
            this.pages.innerHTML = pagesHtml;
            this.indicators.innerHTML = dotsHtml;
        },

        renderCell: function (entry) {
            if (entry.type === 'folder') return this.folderCell(entry);
            const app = Android.Apps.get(entry.id);
            return app ? appCell(app) : '';
        },

        folderCell: function (folder) {
            const mini = folder.apps.slice(0, 4).map(function (id) {
                const a = Android.Apps.get(id);
                return a ? '<span class="android-folder__mini">' + a.icon + '</span>' : '';
            }).join('');
            const more = folder.apps.length > 4
                ? '<span class="android-folder__more">+' + (folder.apps.length - 4) + '</span>'
                : '';
            return (
                '<button class="android-app-icon android-folder android-ripple-target" data-folder="' + esc(folder.id) +
                '" aria-label="Open folder ' + esc(folder.name) + '">' +
                '<span class="android-folder__stack">' + mini + more + '</span>' +
                '<span class="android-app-icon__label">' + esc(folder.name) + '</span>' +
                '</button>'
            );
        },

        renderDock: function () {
            const dock = this.mount.querySelector('.android-home__dock');
            dock.innerHTML = Android.Apps.dockApps.map(appCell).join('');
        },

        bindPagination: function () {
            this.pages.addEventListener(
                'scroll',
                U.throttle(
                    function () {
                        const width = this.pages.clientWidth || 1;
                        const idx = Math.round(this.pages.scrollLeft / width);
                        if (idx !== this.pageIndex) {
                            this.pageIndex = idx;
                            this.updateIndicators();
                        }
                    }.bind(this),
                    80
                ),
                { passive: true }
            );
        },

        updateIndicators: function () {
            const dots = this.indicators.children;
            for (let i = 0; i < dots.length; i++) {
                dots[i].classList.toggle('is-active', i === this.pageIndex);
            }
        },

        /** Grid columns used for vertical arrow-key navigation. */
        columns: function () {
            const width = (this.pages && this.pages.clientWidth) || 320;
            if (width >= 800) return 6;
            if (width >= 500) return 5;
            return 4;
        },

        bindKeyboard: function () {
            this.pages.addEventListener('keydown', function (e) {
                const cells = Array.prototype.slice.call(this.pages.querySelectorAll('.android-app-icon'));
                const current = cells.indexOf(document.activeElement);
                if (current === -1) return;
                const cols = this.columns();
                let next = -1;
                if (e.key === 'ArrowRight') next = current + 1;
                else if (e.key === 'ArrowLeft') next = current - 1;
                else if (e.key === 'ArrowDown') next = current + cols;
                else if (e.key === 'ArrowUp') next = current - cols;
                else return;
                e.preventDefault();
                if (next >= 0 && next < cells.length) cells[next].focus();
            }.bind(this));
        },

        /** Returns to the first page when the user presses Home. */
        reset: function () {
            if (this.pageIndex !== 0 && this.pages) {
                this.pages.scrollTo({ left: 0, behavior: U.reducedMotion() ? 'auto' : 'smooth' });
            }
        },

        /* ---------------------------------------------------------- */
        /* Long-press drag (grid only; dock stays pinned)              */
        /* ---------------------------------------------------------- */

        bindDrag: function () {
            this.pages.addEventListener('pointerdown', function (e) { this.startPress(e); }.bind(this));
            this.pages.addEventListener('pointermove', function (e) { this.moveDrag(e); }.bind(this));
            this.pages.addEventListener('pointerup', function (e) { this.endDrag(e); }.bind(this));
            this.pages.addEventListener('pointercancel', function (e) { this.endDrag(e); }.bind(this));
            this.pages.addEventListener('click', function (e) { this.onCellClick(e); }.bind(this), true);
        },

        bindEditBar: function () {
            this.editBar.addEventListener('click', function (e) {
                const chip = e.target.closest('[data-restore]');
                if (!chip) return;
                e.stopPropagation();
                this.restoreApp(chip.dataset.restore);
            }.bind(this));
        },

        cellInfo: function (cell) {
            let entry = null;
            if (cell.dataset.folder) {
                entry = this.folderById(cell.dataset.folder);
                return entry ? { index: this.layout.indexOf(entry), entry: entry } : null;
            }
            if (cell.dataset.app) {
                for (let i = 0; i < this.layout.length; i++) {
                    if (this.layout[i].type === 'app' && this.layout[i].id === cell.dataset.app) {
                        return { index: i, entry: this.layout[i] };
                    }
                }
            }
            return null;
        },

        startPress: function (e) {
            if (this.drag) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const cell = e.target.closest('.android-app-icon');
            if (!cell) return;
            const info = this.cellInfo(cell);
            if (!info) return;
            const d = {
                cell: cell,
                entryIndex: info.index,
                entry: info.entry,
                startX: e.clientX,
                startY: e.clientY,
                grabX: 0,
                grabY: 0,
                baseLeft: 0,
                baseTop: 0,
                active: false,
                timer: null
            };
            d.timer = setTimeout(function () {
                if (this.drag === d) this.activateDrag(d);
            }.bind(this), LONG_PRESS_MS);
            this.drag = d;
        },

        activateDrag: function (d) {
            d.active = true;
            const r = d.cell.getBoundingClientRect();
            d.grabX = d.startX - r.left;
            d.grabY = d.startY - r.top;
            d.baseLeft = r.left;
            d.baseTop = r.top;
            d.cell.classList.add('is-dragging');
            d.cell.style.touchAction = 'none';
            this.pages.classList.add('is-dragging');
            this.pages.querySelectorAll('.android-app-icon').forEach(function (c) {
                if (c !== d.cell) c.classList.add('is-wiggling');
            });
            this.showEditBar();
            this._suppressClick = true;
            if (navigator.vibrate) navigator.vibrate(15);
        },

        moveDrag: function (e) {
            const d = this.drag;
            if (!d) return;
            if (!d.active) {
                const dx = e.clientX - d.startX;
                const dy = e.clientY - d.startY;
                if (Math.abs(dx) + Math.abs(dy) > MOVE_CANCEL) {
                    clearTimeout(d.timer);
                    this.drag = null;
                }
                return;
            }
            d.cell.style.transform =
                'translate(' + (e.clientX - d.grabX - d.baseLeft) + 'px,' + (e.clientY - d.grabY - d.baseTop) + 'px) scale(1.12)';
            this.highlightDrop(e.clientX, e.clientY);
        },

        highlightDrop: function (x, y) {
            this.mount.querySelectorAll('.is-drop-target').forEach(function (n) {
                n.classList.remove('is-drop-target');
            });
            this.dropKind = null;
            this.dropTargetId = null;
            // The dragged cell rides under the cursor - hide it so the
            // real element at the point is found.
            const dragged = this.drag ? this.drag.cell : null;
            if (dragged) dragged.style.visibility = 'hidden';
            const hit = document.elementFromPoint(x, y);
            if (dragged) dragged.style.visibility = '';
            if (!hit) return;
            const rm = hit.closest('[data-drop-remove]');
            if (rm) {
                rm.classList.add('is-drop-target');
                this.dropKind = 'remove';
                return;
            }
            const folder = hit.closest('.android-folder');
            if (folder) {
                folder.classList.add('is-drop-target');
                this.dropKind = 'folder';
                this.dropTargetId = folder.dataset.folder;
                return;
            }
            const other = hit.closest('.android-app-icon');
            if (other) {
                other.classList.add('is-drop-target');
                this.dropKind = 'app';
                this.dropTargetId = other.dataset.app || null;
            }
        },

        endDrag: function (e) {
            const d = this.drag;
            if (!d) return;
            this.drag = null;
            if (d.active && e) {
                this.highlightDrop(e.clientX, e.clientY);
                const kind = this.dropKind;
                if (kind === 'remove') {
                    this.removeFromHome(d.entry);
                } else if (kind === 'folder') {
                    this.addToFolder(this.dropTargetId, d.entry);
                } else if (kind === 'app') {
                    this.createFolder(d.entry, this.dropTargetId);
                } else {
                    this.reorder(d.entryIndex, e.clientX, e.clientY);
                }
            }
            this.pages.classList.remove('is-dragging');
            this.hideEditBar();
            this.pages.querySelectorAll('.is-dragging, .is-wiggling, .is-drop-target').forEach(function (n) {
                n.classList.remove('is-dragging', 'is-wiggling', 'is-drop-target');
            });
            this.renderPages();
            this.saveLayout();
        },

        onCellClick: function (e) {
            if (this._suppressClick) {
                e.stopPropagation();
                this._suppressClick = false;
                return;
            }
            const folder = e.target.closest('[data-folder]');
            if (folder) {
                e.stopPropagation();
                this.openFolder(folder.dataset.folder);
            }
        },

        nearestIndex: function (x, y) {
            const cells = this.pages.querySelectorAll('.android-home__page .android-app-icon');
            let best = null;
            let bestDist = Infinity;
            cells.forEach(function (c, i) {
                const r = c.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const d = (cx - x) * (cx - x) + (cy - y) * (cy - y);
                if (d < bestDist) {
                    bestDist = d;
                    best = i;
                }
            });
            return best;
        },

        /* ---------------------------------------------------------- */
        /* Layout mutations                                            */
        /* ---------------------------------------------------------- */

        removeFromHome: function (entry) {
            const idx = this.layout.indexOf(entry);
            if (idx === -1) return;
            if (entry.type === 'folder') {
                const apps = entry.apps.slice();
                this.layout.splice(idx, 1);
                apps.reverse().forEach(function (id) {
                    this.layout.splice(idx, 0, { type: 'app', id: id });
                }, this);
                U.toast('Folder removed');
                return;
            }
            this.layout.splice(idx, 1);
            this.removed.push(entry.id);
            const app = Android.Apps.get(entry.id);
            U.toast('Removed ' + (app ? app.name : 'app') + ' â€” drag the icon to restore');
        },

        restoreApp: function (id) {
            this.removed = this.removed.filter(function (x) { return x !== id; });
            this.layout.push({ type: 'app', id: id });
            const app = Android.Apps.get(id);
            U.toast('Restored ' + (app ? app.name : 'app'));
            this.renderPages();
            this.saveLayout();
        },

        createFolder: function (entry, otherAppId) {
            const other = this.layout.find(function (e) { return e.type === 'app' && e.id === otherAppId; });
            if (!other || other === entry) return;
            const apps = [];
            if (entry.type === 'app') apps.push(entry.id);
            else entry.apps.forEach(function (id) { apps.push(id); });
            apps.push(otherAppId);
            const folder = {
                type: 'folder',
                id: 'f_' + Date.now().toString(36) + Math.floor(Math.random() * 999),
                name: 'Folder',
                apps: Array.from(new Set(apps))
            };
            const a = this.layout.indexOf(entry);
            const b = this.layout.indexOf(other);
            this.layout.splice(Math.min(a, b), 2, folder);
            U.toast('Folder created');
        },

        addToFolder: function (folderId, entry) {
            const folder = this.folderById(folderId);
            if (!folder) return;
            if (entry.type === 'app') {
                if (folder.apps.indexOf(entry.id) !== -1) return;
                folder.apps.push(entry.id);
            } else {
                entry.apps.forEach(function (id) {
                    if (folder.apps.indexOf(id) === -1) folder.apps.push(id);
                });
            }
            this.layout.splice(this.layout.indexOf(entry), 1);
            U.toast('Added to ' + folder.name);
        },

        reorder: function (fromIndex, x, y) {
            const target = this.nearestIndex(x, y);
            if (target === null) return;
            const entry = this.layout.splice(fromIndex, 1)[0];
            if (!entry) return;
            let to = target;
            if (to > fromIndex) to -= 1;
            to = Math.max(0, Math.min(to, this.layout.length));
            this.layout.splice(to, 0, entry);
        },

        /* ---------------------------------------------------------- */
        /* Folder overlay                                              */
        /* ---------------------------------------------------------- */

        openFolder: function (folderId) {
            const folder = this.folderById(folderId);
            if (!folder) return;
            this.currentFolder = folder;
            this.getOverlay();
            this.renderOverlay(folder);
            this.overlay.classList.remove('is-hidden');
            this.releaseTrap = U.trapFocus(this.overlay);
        },

        closeFolder: function () {
            if (this.overlay) this.overlay.classList.add('is-hidden');
            if (this.releaseTrap) {
                this.releaseTrap();
                this.releaseTrap = null;
            }
            this.currentFolder = null;
        },

        getOverlay: function () {
            if (this.overlay) return this.overlay;
            const overlay = U.create('div', { class: 'android-folder-overlay is-hidden' });
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Folder');
            overlay.innerHTML =
                '<div class="android-folder__sheet">' +
                '<div class="android-folder__head">' +
                '<span class="android-folder__name" data-folder-name></span>' +
                '<input class="android-folder__rename" data-folder-input aria-label="Folder name" hidden>' +
                '<button type="button" class="android-folder__btn" data-folder-rename>Rename</button>' +
                '<button type="button" class="android-folder__btn" data-folder-close aria-label="Close folder">Close</button>' +
                '</div>' +
                '<div class="android-folder__grid" data-folder-grid></div>' +
                '<div class="android-folder__foot">Hold an app icon to remove it</div>' +
                '</div>';

            overlay.addEventListener('pointerdown', function (e) {
                if (e.target === overlay) Home.closeFolder();
            });
            overlay.addEventListener('click', function (e) {
                const app = e.target.closest('[data-action="open-app"]');
                if (app) { Home.closeFolder(); return; }
                const rm = e.target.closest('[data-remove-from-folder]');
                if (rm) { Home.removeFromFolder(rm.dataset.removeFromFolder); return; }
                const rename = e.target.closest('[data-folder-rename]');
                if (rename) { Home.enableRename(); return; }
                const done = e.target.closest('[data-folder-done]');
                if (done) { Home.commitRename(); return; }
                if (e.target.closest('[data-folder-close]')) Home.closeFolder();
            });
            overlay.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') Home.closeFolder();
            });
            overlay.addEventListener('pointerdown', function (e) {
                const app = e.target.closest('.android-app-icon');
                if (!app || !app.dataset.app) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                const timer = setTimeout(function () {
                    Home.removeFromFolder(app.dataset.app);
                }, LONG_PRESS_MS);
                const cancel = function () {
                    clearTimeout(timer);
                    overlay.removeEventListener('pointerup', cancel);
                    overlay.removeEventListener('pointercancel', cancel);
                };
                overlay.addEventListener('pointerup', cancel);
                overlay.addEventListener('pointercancel', cancel);
            });
            Android.Shell.screen.appendChild(overlay);
            this.overlay = overlay;
            return overlay;
        },

        renderOverlay: function (folder) {
            const nameEl = this.overlay.querySelector('[data-folder-name]');
            const input = this.overlay.querySelector('[data-folder-input]');
            const grid = this.overlay.querySelector('[data-folder-grid]');
            nameEl.textContent = folder.name;
            nameEl.hidden = false;
            input.hidden = true;
            grid.innerHTML = folder.apps.map(function (id) {
                const a = Android.Apps.get(id);
                return a ? appCell(a) : '';
            }).join('');
        },

        removeFromFolder: function (appId) {
            const folder = this.currentFolder;
            if (!folder) return;
            folder.apps = folder.apps.filter(function (id) { return id !== appId; });
            if (folder.apps.length === 0) {
                this.layout = this.layout.filter(function (e) { return e !== folder; });
                U.toast('Folder removed');
                this.closeFolder();
            } else {
                this.renderOverlay(folder);
                U.toast('Removed from folder');
            }
            this.saveLayout();
            this.renderPages();
        },

        enableRename: function () {
            if (!this.currentFolder || !this.overlay) return;
            const nameEl = this.overlay.querySelector('[data-folder-name]');
            const input = this.overlay.querySelector('[data-folder-input]');
            nameEl.hidden = true;
            input.hidden = false;
            input.value = this.currentFolder.name;
            input.focus();
            input.select();
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') Home.commitRename();
            });
        },

        commitRename: function () {
            if (!this.currentFolder || !this.overlay) return;
            const nameEl = this.overlay.querySelector('[data-folder-name]');
            const input = this.overlay.querySelector('[data-folder-input]');
            const value = (input.value || '').trim().slice(0, 24);
            if (value) this.currentFolder.name = value;
            nameEl.textContent = this.currentFolder.name;
            nameEl.hidden = false;
            input.hidden = true;
            this.saveLayout();
            this.renderPages();
        },

        /* ---------------------------------------------------------- */
        /* Edit bar (drag targets)                                     */
        /* ---------------------------------------------------------- */

        showEditBar: function () {
            this.editBar.classList.add('is-visible');
            const chips = this.editBar.querySelector('[data-restore-chips]');
            chips.innerHTML = this.removed.map(function (id) {
                const a = Android.Apps.get(id);
                return a
                    ? '<button type="button" class="android-editbar__chip" data-restore="' + esc(id) + '">' +
                      a.icon + '<span>' + esc(a.name) + '</span></button>'
                    : '';
            }).join('');
        },

        hideEditBar: function () {
            this.editBar.classList.remove('is-visible');
        }
    });
})(window);

/**
 * Mobile Recents
 * The Overview screen: stacked cards for open apps, tap to reopen,
 * swipe-up to dismiss, close button per card.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;
    const I = Android.Icons;
    const esc = U.esc;

    const Recents = (Android.Recents = {
        mount: null,
        isOpen: false,
        dragCard: null,
        dragStartY: 0,

        init: function () {
            this.mount = Android.Shell.root.querySelector('.android-recents');
        },

        toggle: function () {
            if (this.isOpen) this.close();
            else this.open();
        },

        open: function () {
            if (this.isOpen) return;
            const stack = Android.AppManager.stack;
            if (stack.length === 0) {
                U.toast('No recent apps');
                return;
            }
            this.render();
            this.mount.classList.add('is-open');
            this.mount.setAttribute('aria-hidden', 'false');
            this.isOpen = true;
        },

        close: function () {
            if (!this.isOpen) return;
            this.mount.classList.remove('is-open');
            this.mount.setAttribute('aria-hidden', 'true');
            this.isOpen = false;
        },

        render: function () {
            const stack = Android.AppManager.stack;
            const cards = stack
                .map(function (instance) {
                    const app = Android.Apps.get(instance.id);
                    if (!app) return '';
                    return (
                        '<article class="android-recents__card" data-recent="' + app.id + '" style="--g:' + app.splash + '">' +
                        '<div class="android-recents__shade"></div>' +
                        '<button class="android-recents__close android-ripple-target" data-recent-close="' +
                        app.id + '" aria-label="Close ' + esc(app.name) + '">' + I.close + '</button>' +
                        '<div class="android-recents__info">' +
                        '<span class="android-recents__icon">' + app.icon + '</span>' +
                        '<strong>' + esc(app.name) + '</strong>' +
                        '</div>' +
                        '</article>'
                    );
                })
                .join('');

            this.mount.innerHTML =
                '<div class="android-recents__head">Recent apps</div>' +
                '<div class="android-recents__list">' + cards + '</div>';
            this.bindCards();
        },

        bindCards: function () {
            const list = this.mount.querySelector('.android-recents__list');

            list.addEventListener('click', function (e) {
                const closeBtn = e.target.closest('[data-recent-close]');
                if (closeBtn) {
                    const instance = Android.AppManager.find(closeBtn.dataset.recentClose);
                    if (instance) Android.AppManager.close(instance);
                    if (Android.AppManager.stack.length === 0) Recents.close();
                    else Recents.render();
                    return;
                }
                const card = e.target.closest('[data-recent]');
                if (card) {
                    const instance = Android.AppManager.find(card.dataset.recent);
                    if (instance) {
                        Recents.close();
                        Android.AppManager.focus(instance);
                    }
                }
            });

            list.addEventListener(
                'touchstart',
                function (e) {
                    const card = e.target.closest('[data-recent]');
                    if (!card) return;
                    this.dragCard = card;
                    this.dragStartY = e.touches[0].clientY;
                }.bind(this),
                { passive: true }
            );

            list.addEventListener(
                'touchmove',
                function (e) {
                    if (!this.dragCard) return;
                    const dy = e.touches[0].clientY - this.dragStartY;
                    if (dy < 0) {
                        this.dragCard.style.transform = 'translateY(' + dy + 'px) scale(0.96)';
                        this.dragCard.style.opacity = String(Math.max(0, 1 + dy / 260));
                    }
                }.bind(this),
                { passive: true }
            );

            list.addEventListener(
                'touchend',
                function (e) {
                    if (!this.dragCard) return;
                    const dy = e.changedTouches[0].clientY - this.dragStartY;
                    const card = this.dragCard;
                    this.dragCard = null;
                    if (dy < -60) {
                        const instance = Android.AppManager.find(card.dataset.recent);
                        if (instance) Android.AppManager.close(instance);
                        if (Android.AppManager.stack.length === 0) Recents.close();
                        else Recents.render();
                    } else {
                        card.style.transform = '';
                        card.style.opacity = '';
                    }
                }.bind(this)
            );
        }
    });
})(window);

/**
 * Mobile Lock Screen
 * AOD (Always-On Display) -> PIN keypad -> unlock.
 * The phone boots locked; it also re-locks when the tab loses focus
 * (visibilitychange), just like a real handset turning its screen off.
 * Layers above every other Android layer (z-index 200).
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;

    const Lock = (Android.Lock = {
        root: null,
        aodEl: null,
        pinEl: null,
        dotsEl: null,
        hintEl: null,
        entered: '',
        PIN: '2580',

        build: function () {
            if (this.root) return;
            const screen = Android.Shell.screen;
            if (!screen) return;

            this.root = U.create('div', { class: 'android-lock' });

            this.aodEl = U.create('button', {
                class: 'android-aod',
                type: 'button',
                'aria-label': 'Wake device',
                html:
                    '<span class="android-aod__time" data-lock-aod-time>--:--</span>' +
                    '<span class="android-aod__date" data-lock-aod-date></span>'
            });

            const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
            const keypadHtml = keys.map(function (k) {
                if (!k) return '<span class="android-lock__key--blank"></span>';
                if (k === 'del') {
                    return (
                        '<button type="button" class="android-lock__key" data-key="del" aria-label="Backspace">' +
                        '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11C5.77 20.65 6.31 21 7 21h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg>' +
                        '</button>'
                    );
                }
                return '<button type="button" class="android-lock__key" data-key="' + k + '">' + k + '</button>';
            }).join('');

            this.pinEl = U.create('div', {
                class: 'android-lock__pin',
                html:
                    '<div class="android-lock__info">' +
                    '<div class="android-lock__time" data-lock-time>--:--</div>' +
                    '<div class="android-lock__date" data-lock-date></div>' +
                    '</div>' +
                    '<div class="android-lock__auth">' +
                    '<div class="android-lock__hint" data-lock-hint>Enter your PIN</div>' +
                    '<div class="android-lock__dots">' +
                    '<span class="android-lock__dot"></span><span class="android-lock__dot"></span>' +
                    '<span class="android-lock__dot"></span><span class="android-lock__dot"></span>' +
                    '</div>' +
                    '<div class="android-lock__keypad">' + keypadHtml + '</div>' +
                    '</div>'
            });

            this.aodEl.addEventListener('click', function () {
                Lock.wake();
            });

            this.pinEl.addEventListener('click', function (e) {
                const key = e.target.closest('[data-key]');
                if (key) Lock.pressKey(key.dataset.key);
            });

            this.pinEl.setAttribute('role', 'dialog');
            this.pinEl.setAttribute('aria-modal', 'true');
            this.pinEl.setAttribute('aria-label', 'Lock screen PIN entry');

            this.root.appendChild(this.aodEl);
            this.root.appendChild(this.pinEl);
            screen.appendChild(this.root);

            this.dotsEl = this.root.querySelector('.android-lock__dots');
            this.hintEl = this.root.querySelector('[data-lock-hint]');

            // Keep the screen's swipe-down shade gesture from firing behind the lock.
            ['touchstart', 'touchmove', 'touchend'].forEach(function (type) {
                this.root.addEventListener(type, function (e) {
                    e.stopPropagation();
                }, { passive: true });
            }, this);

            this.updateClock();
            setInterval(this.updateClock.bind(this), 10000);
        },

        updateClock: function () {
            if (!this.root) return;
            const now = new Date();
            const time = U.formatTime(now);
            const date = U.formatDate(now);
            const pairs = [
                ['data-lock-aod-time', time],
                ['data-lock-aod-date', date],
                ['data-lock-time', time],
                ['data-lock-date', date]
            ];
            pairs.forEach(function (pair) {
                const el = this.root.querySelector('[' + pair[0] + ']');
                if (el && el.textContent !== pair[1]) el.textContent = pair[1];
            }, this);
        },

        /** Locks with the AOD shown first (boot / screen-off). */
        lock: function () {
            this.build();
            if (!this.root) return;
            Android.Shell.toggleShade(false);
            Android.Recents.close();
            Android.Home.closeFolder();
            this.resetState();
            this.aodEl.classList.remove('is-fade');
            this.pinEl.classList.remove('is-visible');
            this.root.classList.remove('is-hidden');
            this.releaseTrap = U.trapFocus(this.pinEl);
        },

        /** Transitions AOD -> PIN lock screen. */
        wake: function () {
            if (!this.root || this.root.classList.contains('is-hidden')) return;
            this.resetState();
            this.aodEl.classList.add('is-fade');
            this.pinEl.classList.add('is-visible');
            const btn = this.pinEl.querySelector('.android-lock__key');
            if (btn) btn.focus();
        },

        resetState: function () {
            this.entered = '';
            this.renderDots();
            this.setHint('Enter your PIN');
            if (this.isFirstRun()) this.setHint('Default PIN: ' + this.PIN);
        },

        pressKey: function (key) {
            if (this.entered.length >= this.PIN.length && key !== 'del') return;
            if (key === 'del') this.entered = this.entered.slice(0, -1);
            else this.entered += key;
            this.renderDots();
            if (this.entered.length === this.PIN.length) {
                setTimeout(this.submit.bind(this), 200);
            }
        },

        renderDots: function () {
            const dots = this.dotsEl ? this.dotsEl.querySelectorAll('.android-lock__dot') : [];
            dots.forEach(function (d, i) {
                d.classList.toggle('is-filled', i < this.entered.length);
            }, this);
        },

        setHint: function (text) {
            if (this.hintEl) {
                this.hintEl.textContent = text;
                this.hintEl.classList.remove('is-error');
            }
        },

        isFirstRun: function () {
            try {
                return !sessionStorage.getItem('android_pin_hint_seen');
            } catch (e) {
                return true;
            }
        },

        submit: function () {
            if (this.entered === this.PIN) {
                this.unlock();
                return;
            }
            this.entered = '';
            this.renderDots();
            if (this.hintEl) {
                this.hintEl.textContent = 'Wrong PIN';
                this.hintEl.classList.add('is-error');
            }
            const pin = this.pinEl;
            if (pin) {
                pin.classList.remove('is-shaking');
                void pin.offsetWidth;
                pin.classList.add('is-shaking');
            }
        },

        unlock: function () {
            try {
                sessionStorage.setItem('android_pin_hint_seen', '1');
            } catch (e) {}
            if (!this.root) return;
            if (this.releaseTrap) {
                this.releaseTrap();
                this.releaseTrap = null;
            }
            this.root.classList.add('is-hidden');
        },

        isLocked: function () {
            return !!(this.root && !this.root.classList.contains('is-hidden'));
        }
    });

    /** Screen-off -> re-lock when the tab is hidden (realistic phone behaviour). */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden && Android.Lock.isLocked && !Android.Lock.isLocked()) {
            Android.Lock.lock();
        }
    });
})(window);

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
