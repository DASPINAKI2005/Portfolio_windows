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
