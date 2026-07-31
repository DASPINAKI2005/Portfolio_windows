/**
 * Mobile Home
 * Renders the Android home screen: search pill, paged app grid, page
 * indicators and the dock. Grid and dock apps come from the app registry.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;
    const I = Android.Icons;
    const esc = U.esc;

    const APPS_PER_PAGE = 20;

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

        build: function () {
            const root = Android.Shell.root;
            this.mount = root.querySelector('.android-home');
            if (!this.mount || this.mount.childElementCount > 0) return;

            this.mount.innerHTML =
                '<button class="android-home__search android-ripple-target" data-action="open-app" data-app="google" aria-label="Open Google search">' +
                '<span class="android-home__search-ico">' + I.google + '</span>' +
                '<span class="android-home__search-text">Search</span>' +
                '<span class="android-home__mic" aria-hidden="true">' + I.mic + '</span>' +
                '</button>' +
                '<div class="android-home__pages" aria-label="Home screen apps"></div>' +
                '<div class="android-home__indicators" aria-hidden="true"></div>' +
                '<div class="android-home__dock" aria-label="App dock"></div>';

            this.pages = this.mount.querySelector('.android-home__pages');
            this.indicators = this.mount.querySelector('.android-home__indicators');

            this.renderPages();
            this.renderDock();
            this.bindPagination();
            this.bindKeyboard();
        },

        renderPages: function () {
            const apps = Android.Apps.gridApps;
            let pagesHtml = '';
            let dotsHtml = '';
            for (let i = 0; i < apps.length; i += APPS_PER_PAGE) {
                const slice = apps.slice(i, i + APPS_PER_PAGE);
                pagesHtml += '<div class="android-home__page">' + slice.map(appCell).join('') + '</div>';
                dotsHtml += '<span class="android-dot' + (i === 0 ? ' is-active' : '') + '"></span>';
            }
            this.pages.innerHTML = pagesHtml;
            this.indicators.innerHTML = dotsHtml;
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
        }
    });
})(window);
