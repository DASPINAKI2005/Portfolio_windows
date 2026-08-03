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
        { title: 'Nova — Lo-Fi Focus', artist: 'Pinaki Das', album: 'AI Sessions', dur: 214, grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
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
                '<span data-media-artist>' + U.esc(t.artist) + ' · ' + U.esc(t.album) + '</span>' +
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
            if (artist) artist.textContent = t.artist + ' · ' + t.album;
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
