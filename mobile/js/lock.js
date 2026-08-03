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
