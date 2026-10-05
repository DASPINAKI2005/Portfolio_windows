// --- Widgets Panel ---
const WidgetsManager = {
    panelEl: null,
    isOpen: false,

    init() {
        this.panelEl = el('widgets-panel');
        this.render();

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panelEl.contains(e.target) && !el('widgets-btn').contains(e.target)) {
                this.hide();
            }
        });
    },

    /** Builds the panel from shared portfolio content (profile, skills, projects). */
    render() {
        if (!this.panelEl) return;
        const data = WindowManager.portfolioData();
        const profile = data.profile || {};
        const skills = data.skills || [];
        const project = (data.projects || [])[0];
        const topSkills = skills.slice(0, 4).map(s => `<span class="widget-chip">${esc(s.name)}</span>`).join('');
        const initial = esc((profile.name || 'P').charAt(0));
        this.panelEl.innerHTML = `
            <div class="widgets-title">Widgets</div>
            <div class="widget-card widget-card--profile">
                <div class="widget-avatar" aria-hidden="true">${initial}</div>
                <div class="widget-card-body">
                    <div class="widget-card-head">${esc(profile.name || 'Pinaki Das')}</div>
                    <div class="widget-card-sub">${esc(profile.role || profile.headline || '')}</div>
                    <button type="button" class="widget-link" data-widget-about>View profile →</button>
                </div>
            </div>
            <div class="widget-card">
                <div class="widget-card-head">Skills spotlight</div>
                <div class="widget-card-sub widget-card-chips">${topSkills || '<span class="widget-chip">Python</span>'}</div>
            </div>
            ${project ? `
            <div class="widget-card">
                <div class="widget-card-head">Latest project</div>
                <div class="widget-card-sub">${esc(project.title)}</div>
                <div class="widget-card-sub widget-project-tag">${esc(project.tagline || '')}</div>
                <button type="button" class="widget-link" data-widget-project="0">Open project →</button>
            </div>` : ''}
        `;

        this.panelEl.addEventListener('click', (e) => {
            if (e.target.closest('[data-widget-about]')) {
                this.hide();
                const app = appById('about');
                if (app) WindowManager.open(app);
                return;
            }
            const proj = e.target.closest('[data-widget-project]');
            if (proj) {
                this.hide();
                WindowManager.openProject(parseInt(proj.dataset.widgetProject, 10));
            }
        });
    },

    toggle() {
        if (this.isOpen) this.hide();
        else this.show();
    },

    show() {
        if (!this.panelEl) return;
        StartMenuManager.hide();
        this.panelEl.hidden = false;
        this.panelEl.classList.remove('hidden');
        this.isOpen = true;
    },

    hide() {
        if (!this.panelEl) return;
        this.panelEl.classList.add('hidden');
        this.isOpen = false;
    }
};

// --- Context Menu ---
const ContextMenuManager = {
    menuEl: null,
    targetId: null,

    init() {
        this.menuEl = el('context-menu');
        this.menuEl.removeAttribute('hidden');
        this.menuEl.addEventListener('click', (e) => this.onItemClick(e));
        this.menuEl.addEventListener('contextmenu', (e) => e.preventDefault());
        this.menuEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); this.hide(); }
            else if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-action]')) {
                e.preventDefault();
                e.stopPropagation();
                e.target.closest('[data-action]').click();
            }
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const iconEl = e.target.closest('.desktop-icon');
            if (iconEl) this.showIcon(e.clientX, e.clientY, iconEl);
            else this.showDesktop(e.clientX, e.clientY);
        });

        document.addEventListener('click', (e) => {
            if (!this.menuEl.contains(e.target)) this.hide();
        });
        document.addEventListener('mousedown', (e) => {
            if (!this.menuEl.contains(e.target)) this.hide();
        });
    },

    showDesktop(x, y) {
        StartMenuManager.hide();
        this.targetId = null;
        this.build(DesktopMenuHtml());
        this.position(x, y);
    },

    showIcon(x, y, iconEl) {
        StartMenuManager.hide();
        if (!iconEl.classList.contains('selected')) {
            DesktopManager.clearSelection();
            iconEl.classList.add('selected');
        }
        this.targetId = iconEl.dataset.id;
        const data = STATE.desktopIcons.find(i => i.id === this.targetId);
        this.build(IconMenuHtml(data));
        this.position(x, y);
    },

    build(html) {
        this.menuEl.innerHTML = html;
        this.menuEl.classList.remove('hidden');
    },

    position(x, y) {
        const rect = this.menuEl.getBoundingClientRect();
        const posX = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4));
        const posY = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4));
        this.menuEl.style.left = `${posX}px`;
        this.menuEl.style.top = `${posY}px`;
    },

    hide() {
        this.menuEl.classList.add('hidden');
    },

    onItemClick(e) {
        const item = e.target.closest('[data-action]');
        if (!item) return;
        const action = item.dataset.action;
        const targetId = this.targetId;
        const data = targetId ? STATE.desktopIcons.find(i => i.id === targetId) : null;
        this.hide();

        switch (action) {
            case 'refresh':
                DesktopManager.refresh();
                break;
            case 'sort-name':
                DesktopManager.sortIcons('name');
                break;
            case 'sort-default':
                DesktopManager.sortIcons('default');
                break;
            case 'new-folder':
                DesktopManager.createItem('folder');
                break;
            case 'new-text':
                DesktopManager.createItem('text');
                break;
            case 'open':
                if (data) { WindowManager.open(data); DesktopManager.clearSelection(); }
                break;
            case 'rename':
                if (targetId) DesktopManager.renameIcon(targetId);
                break;
            case 'delete':
                DesktopManager.recycleSelected();
                break;
            case 'properties':
                if (data) this.openProperties(data);
                break;
            case 'display-settings':
                WindowManager.openSettingsPage('system');
                break;
            case 'personalize':
                WindowManager.openSettingsPage('personalization');
                break;
        }
    },

    openProperties(data) {
        let dlg = el('props-dialog');
        if (!dlg) {
            dlg = document.createElement('div');
            dlg.id = 'props-dialog';
            dlg.className = 'props-dialog';
            dlg.hidden = true;
            dlg.innerHTML = `
                <div class="props-dialog__box" role="dialog" aria-label="Properties">
                    <div class="props-dialog__head">
                        <span id="props-dialog-title">Properties</span>
                        <button class="ctrl-btn" data-props-close aria-label="Close">
                            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1,1 L9,9 M9,1 L1,9" stroke="currentColor" stroke-width="1.5"/></svg>
                        </button>
                    </div>
                    <div class="props-dialog__icon"><img id="props-dialog-img" src="" alt=""><span id="props-dialog-name"></span></div>
                    <div class="props-dialog__grid" id="props-dialog-grid"></div>
                    <div class="props-dialog__foot">
                        <button type="button" data-props-close class="props-dialog__ok">OK</button>
                    </div>
                </div>`;
            document.body.appendChild(dlg);
            dlg.addEventListener('click', (e) => {
                if (e.target.closest('[data-props-close]') || e.target === dlg) dlg.hidden = true;
            });
            dlg.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { e.stopPropagation(); dlg.hidden = true; }
            });
        }

        const typeLabels = {
            'explorer': 'Shortcut',
            'folder': 'File folder',
            'pdf': 'PDF document',
            'text': 'Text document'
        };
        const now = new Date().toLocaleDateString();
        const rows = [
            ['Type', typeLabels[data.type] || 'Application'],
            ['Size', data.type === 'pdf' ? '186 KB' : data.type === 'text' ? '12 bytes' : data.type === 'folder' ? '—' : '1 KB'],
            ['Location', 'C:\\Users\\Pinaki\\Desktop'],
            ['Created', '12/05/2025'],
            ['Modified', now]
        ];
        dlg.querySelector('#props-dialog-img').src = data.icon;
        dlg.querySelector('#props-dialog-name').textContent = data.title;
        dlg.querySelector('#props-dialog-title').textContent = data.title + ' Properties';
        dlg.querySelector('#props-dialog-grid').innerHTML = rows.map(r =>
            '<div class="props-dialog__row"><span>' + esc(r[0]) + '</span><strong>' + esc(r[1]) + '</strong></div>'
        ).join('');
        dlg.hidden = false;
    }
};

/** Desktop right-click menu markup. */
function DesktopMenuHtml() {
    return `
        <div class="menu-item has-submenu" data-submenu="sort" tabindex="0" role="button">
            Sort By<span class="menu-caret">&#8250;</span>
            <div class="menu-submenu">
                <div class="menu-item" data-action="sort-name" role="button" tabindex="0">Name</div>
                <div class="menu-item" data-action="sort-default" role="button" tabindex="0">Default order</div>
            </div>
        </div>
        <div class="menu-item" data-action="refresh" role="button" tabindex="0">Refresh</div>
        <div class="menu-divider"></div>
        <div class="menu-item has-submenu" data-submenu="new" tabindex="0" role="button">
            New<span class="menu-caret">&#8250;</span>
            <div class="menu-submenu">
                <div class="menu-item" data-action="new-folder" role="button" tabindex="0">Folder</div>
                <div class="menu-item" data-action="new-text" role="button" tabindex="0">Text Document</div>
            </div>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" data-action="display-settings" role="button" tabindex="0">Display settings</div>
        <div class="menu-item" data-action="personalize" role="button" tabindex="0">Personalize</div>`;
}

/** Icon right-click menu markup. */
function IconMenuHtml(data) {
    return `
        <div class="menu-item" data-action="open" role="button" tabindex="0">Open</div>
        <div class="menu-divider"></div>
        <div class="menu-item" data-action="rename" role="button" tabindex="0">Rename</div>
        <div class="menu-item" data-action="delete" role="button" tabindex="0">Delete</div>
        <div class="menu-divider"></div>
        <div class="menu-item" data-action="properties" role="button" tabindex="0">Properties</div>`;
}

// --- Clock Manager ---
const ClockManager = {
    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    },

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const dateStr = now.toLocaleDateString();
        
        el('time').textContent = timeStr;
        el('date').textContent = dateStr;
    }
};

// --- Quick Settings (system tray) ---
const QuickSettingsManager = {
    panelEl: null,
    isOpen: false,
    state: null,

    DEFAULTS: { wifi: true, bluetooth: true, airplane: false, batterySaver: false, nightLight: false, focus: false, volume: 65, brightness: 100 },

    ACTIONS: [
        { key: 'wifi', label: 'Wi-Fi', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 21l3.6-4.8c-1-.8-2.2-1.2-3.6-1.2s-2.6.4-3.6 1.2L12 21zm0-18C7.9 3 4.2 4.6 1.4 7.2l2.4 3.2c2.1-1.9 5-3.1 8.2-3.1s6.1 1.2 8.2 3.1l2.4-3.2C19.8 4.6 16.1 3 12 3z"/></svg>' },
        { key: 'bluetooth', label: 'Bluetooth', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.7 7.3L13 2h-1v7.2L8 6 6.6 7.4 11 12l-4.4 4.6L8 18l4-3.2V22h1l4.7-5.3-4-3.7 4-3.7zM14 4.9l1.8 1.9L14 8.7V4.9zm1.8 12.3L14 19.1v-3.8l1.8 1.9z"/></svg>' },
        { key: 'airplane', label: 'Airplane mode', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.5 15.5L14 12V5.5A2 2 0 0 0 10 5.5V12l-7.5 3.5V17l7.5-2v3.5l-2 1.5V21l4.5-1 4.5 1v-1l-2-1.5V15l7.5 2v-1.5z"/></svg>' },
        { key: 'batterySaver', label: 'Battery saver', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 3H3v18h13V3zm-2 9.5l-4.5 5-2-2.2-1.4 1.4 3.4 3.8 6-6.7L14 12.5z"/><path d="M16 5h5v2h-1v2h1v2h-1v2h1v2h-1v2h1v2h-1v2h1v2h-6V5z" opacity="0"/></svg>' },
        { key: 'nightLight', label: 'Night light', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36A5.39 5.39 0 0 1 11.36 3.1C11.46 3.04 12 3 12 3zm0 2a3.36 3.36 0 0 0-3.06 4.71 3.96 3.96 0 0 1 4.35 4.35A3.36 3.36 0 0 0 18 12a7 7 0 0 0-6-7z"/></svg>' },
        { key: 'focus', label: 'Focus assist', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>' }
    ],

    init() {
        this.load();
        this.build();
        document.querySelectorAll('#tray-wifi, #tray-volume, #tray-battery').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
        });
        document.addEventListener('mousedown', (e) => {
            if (this.isOpen && this.panelEl && !this.panelEl.contains(e.target) && !e.target.closest('.tray-btn')) this.close();
        });
    },

    load() {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem('win11_quick')); } catch (e) {}
        this.state = Object.assign({}, this.DEFAULTS, saved || {});
    },

    save() {
        try { localStorage.setItem('win11_quick', JSON.stringify(this.state)); } catch (e) {}
    },

    build() {
        this.panelEl = document.createElement('div');
        this.panelEl.id = 'quick-settings';
        this.panelEl.setAttribute('role', 'dialog');
        this.panelEl.setAttribute('aria-label', 'Quick settings');
        this.panelEl.classList.add('hidden');
        this.panelEl.innerHTML = `
            <div class="qs-header">
                <div class="qs-network">
                    <span id="qs-net-name">Pinaki&rsquo;s PC</span>
                    <span id="qs-net-status">Wi-Fi connected</span>
                </div>
                <button type="button" class="qs-edit" data-qs-edit aria-label="Edit quick settings">Edit quick settings</button>
            </div>
            <div class="qs-grid" id="qs-grid"></div>
            <div class="qs-slider">
                <span class="qs-slider-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.6 3H8.4L7 5H3v16h18V5h-4l-1.4-2zM12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg></span>
                <input type="range" min="0" max="100" value="${this.state.volume}" data-slider="volume" aria-label="Volume">
                <span class="qs-slider-val" data-val="volume">${this.state.volume}</span>
            </div>
            <div class="qs-slider">
                <span class="qs-slider-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 7a5 5 0 1 0 5 5h-2a3 3 0 1 1-3-3V7z"/><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg></span>
                <input type="range" min="30" max="100" value="${this.state.brightness}" data-slider="brightness" aria-label="Brightness">
                <span class="qs-slider-val" data-val="brightness">${this.state.brightness}%</span>
            </div>
            ${MediaPlayerManager.render()}
            <div class="qs-footer">
                <span id="qs-battery">87%</span>
                <button type="button" class="qs-edit" data-qs-settings aria-label="All settings">All settings</button>
            </div>`;

        this.panelEl.addEventListener('click', (e) => {
            const tile = e.target.closest('[data-key]');
            if (tile) {
                this.toggleAction(tile.dataset.key);
                return;
            }
            if (e.target.closest('[data-qs-edit]')) {
                this.hide();
                WindowManager.openSettingsPage('personalization');
                return;
            }
            if (e.target.closest('[data-qs-settings]')) {
                const settingsApp = appById('settings');
                if (settingsApp) WindowManager.open(settingsApp);
            }
        });

        this.panelEl.addEventListener('input', (e) => {
            const slider = e.target.closest('[data-slider]');
            if (!slider) return;
            this.state[slider.dataset.slider] = parseInt(slider.value, 10);
            const val = this.panelEl.querySelector(`[data-val="${slider.dataset.slider}"]`);
            if (val) val.textContent = slider.dataset.slider === 'brightness' ? slider.value + '%' : slider.value;
            this.applyEffects();
            this.save();
        });

        document.body.appendChild(this.panelEl);
        this.renderActions();
        this.applyEffects();
        MediaPlayerManager.bind(this.panelEl);
    },

    renderActions() {
        const grid = el('qs-grid');
        if (!grid) return;
        grid.innerHTML = this.ACTIONS.map(a => {
            const on = this.state[a.key];
            const disabled = a.key !== 'airplane' && this.state.airplane ? ' tabindex="-1" aria-disabled="true"' : '';
            return `
                <button type="button" class="qs-tile${on ? ' is-on' : ''}${(a.key !== 'airplane' && this.state.airplane) ? ' is-disabled' : ''}"
                        data-key="${a.key}" role="switch" aria-checked="${on}"${disabled}>
                    <span class="qs-tile-icon">${a.icon}</span>
                    <span class="qs-tile-label">${a.label}</span>
                    <span class="qs-tile-state">${on ? 'On' : 'Off'}</span>
                </button>`;
        }).join('');
    },

    toggleAction(key) {
        if (key !== 'airplane' && this.state.airplane) return;
        this.state[key] = !this.state[key];
        if (key === 'airplane' && this.state.airplane) {
            this.state.wifi = false;
            this.state.bluetooth = false;
        }
        this.applyEffects();
        this.renderActions();
        this.save();
    },

    applyEffects() {
        const desktop = el('desktop');
        if (!desktop) return;
        const parts = [];
        if (this.state.brightness !== 100) parts.push(`brightness(${this.state.brightness / 100})`);
        if (this.state.nightLight) parts.push('sepia(0.28) hue-rotate(-8deg)');
        desktop.style.filter = parts.length ? parts.join(' ') : '';
    },

    toggle() {
        if (this.isOpen) this.close();
        else this.show();
    },

    show() {
        if (!this.panelEl) return;
        StartMenuManager.hide();
        WidgetsManager.hide();
        CalendarFlyoutManager.close();
        this.panelEl.classList.remove('hidden');
        this.isOpen = true;
    },

    close() {
        if (!this.panelEl) return;
        this.panelEl.classList.add('hidden');
        this.isOpen = false;
    }
};

// --- Media player (Quick Settings flyout) ---
const MediaPlayerManager = {
    index: 0,
    pos: 0,
    playing: false,
    timer: null,
    _card: null,

    PLAYLIST: [
        { title: 'Nova — Lo-Fi Focus', artist: 'Pinaki Das · AI Sessions', dur: 214, grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
        { title: 'Object Detection Beats', artist: 'Pinaki Das · AI Sessions', dur: 258, grad: 'linear-gradient(135deg,#60a5fa,#a78bfa)' },
        { title: 'The Eighth Wonder', artist: 'Pinaki Das · Idea Synths', dur: 372, grad: 'linear-gradient(135deg,#f472b6,#fb923c)' },
        { title: 'Pythonic Groove', artist: 'Pinaki Das · Idea Synths', dur: 186, grad: 'linear-gradient(135deg,#38bdf8,#10b981)' }
    ],

    ICONS: {
        play: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
        prev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>',
        next: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6v12z"/></svg>',
        close: '<svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor"><path d="M1,1 L9,9 M9,1 L1,9" stroke="currentColor" stroke-width="1.4"/></svg>',
        music: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>'
    },

    track() { return this.PLAYLIST[this.index]; },

    render() {
        const t = this.track();
        return `
            <div class="qs-media" data-media-card>
                <div class="qs-media__head">
                    <span class="qs-media__art" style="--g:${t.grad}" aria-hidden="true">${this.ICONS.music}</span>
                    <div class="qs-media__info">
                        <strong data-media-title>${esc(t.title)}</strong>
                        <span data-media-artist>${esc(t.artist)}</span>
                    </div>
                    <button type="button" class="qs-media__clear" data-media-action="clear" aria-label="Close player">${this.ICONS.close}</button>
                </div>
                <div class="qs-media__track" data-media-track role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
                    <span class="qs-media__fill" data-media-fill><span class="qs-media__knob"></span></span>
                </div>
                <div class="qs-media__foot">
                    <span class="qs-media__time" data-media-current>0:00</span>
                    <div class="qs-media__controls">
                        <button type="button" class="qs-media__btn" data-media-action="prev" aria-label="Previous track">${this.ICONS.prev}</button>
                        <button type="button" class="qs-media__btn qs-media__btn--play" data-media-action="toggle" aria-label="Play or pause" aria-pressed="false">${this.ICONS.play}</button>
                        <button type="button" class="qs-media__btn" data-media-action="next" aria-label="Next track">${this.ICONS.next}</button>
                    </div>
                    <span class="qs-media__time" data-media-duration>0:00</span>
                </div>
            </div>`;
    },

    bind(scope) {
        this._card = scope.querySelector('[data-media-card]');
        if (!this._card) return;
        scope.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-media-action]');
            if (!btn) return;
            this.action(btn.dataset.mediaAction);
        });
        const trackEl = this._card.querySelector('[data-media-track]');
        const seekFrom = (e) => {
            const rect = trackEl.getBoundingClientRect();
            const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            this.seek(rect.width ? x / rect.width : 0);
        };
        trackEl.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (trackEl.setPointerCapture) trackEl.setPointerCapture(e.pointerId);
            seekFrom(e);
        });
        trackEl.addEventListener('pointermove', (e) => {
            if (trackEl.hasPointerCapture && !trackEl.hasPointerCapture(e.pointerId)) return;
            seekFrom(e);
        });
        trackEl.addEventListener('keydown', (e) => {
            const step = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
            if (!step) return;
            e.preventDefault();
            this.seek((this.pos + step) / this.track().dur);
        });
        this.update();
    },

    action(name) {
        if (name === 'toggle') this.toggle();
        else if (name === 'next') this.next();
        else if (name === 'prev') this.prev();
        else if (name === 'clear') this.clear();
    },

    toggle() {
        this.playing = !this.playing;
        if (this.playing) this.startTicker();
        else this.stopTicker();
        this.update();
    },

    next() {
        this.index = (this.index + 1) % this.PLAYLIST.length;
        this.pos = 0;
        this.update();
    },

    prev() {
        if (this.pos > 3) { this.pos = 0; this.update(); return; }
        this.index = (this.index - 1 + this.PLAYLIST.length) % this.PLAYLIST.length;
        this.pos = 0;
        this.update();
    },

    seek(frac) {
        const t = this.track();
        this.pos = Math.max(0, Math.min(t.dur - 1, Math.round(frac * t.dur)));
        this.update();
    },

    clear() {
        this.stopTicker();
        this.playing = false;
        this.index = 0;
        this.pos = 0;
        this.update();
    },

    startTicker() {
        if (this.timer) return;
        this.timer = setInterval(() => {
            const t = this.track();
            this.pos += 1;
            if (this.pos >= t.dur) this.next();
            else this.update();
        }, 1000);
    },

    stopTicker() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },

    fmt(s) {
        const m = Math.floor(s / 60);
        return m + ':' + String(s % 60).padStart(2, '0');
    },

    update() {
        if (!this._card) return;
        const t = this.track();
        const frac = t.dur ? this.pos / t.dur : 0;
        const fill = this._card.querySelector('[data-media-fill]');
        if (fill) fill.style.width = (frac * 100) + '%';
        const cur = this._card.querySelector('[data-media-current]');
        if (cur) cur.textContent = this.fmt(this.pos);
        const dur = this._card.querySelector('[data-media-duration]');
        if (dur) dur.textContent = this.fmt(t.dur);
        const title = this._card.querySelector('[data-media-title]');
        if (title) title.textContent = t.title;
        const artist = this._card.querySelector('[data-media-artist]');
        if (artist) artist.textContent = t.artist;
        const art = this._card.querySelector('.qs-media__art');
        if (art) art.style.setProperty('--g', t.grad);
        const playBtn = this._card.querySelector('[data-media-action="toggle"]');
        if (playBtn) {
            playBtn.innerHTML = this.playing ? this.ICONS.pause : this.ICONS.play;
            playBtn.setAttribute('aria-pressed', String(this.playing));
        }
        const trackEl = this._card.querySelector('[data-media-track]');
        if (trackEl) trackEl.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
        this._card.classList.toggle('is-playing', this.playing);
    }
};

// --- Calendar & Notifications Flyout ---
const CalendarFlyoutManager = {
    panelEl: null,
    isOpen: false,
    viewDate: new Date(),
    timer: null,

    NOTIFS: [
        { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M12 21l3.6-4.8c-1-.8-2.2-1.2-3.6-1.2s-2.6.4-3.6 1.2L12 21zm0-18C7.9 3 4.2 4.6 1.4 7.2l2.4 3.2c2.1-1.9 5-3.1 8.2-3.1s6.1 1.2 8.2 3.1l2.4-3.2C19.8 4.6 16.1 3 12 3z"/></svg>', title: 'Portfolio is running', time: 'Just now', color: '#60CDFF' },
        { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>', title: 'Resume downloaded', time: '2 hours ago', color: '#9BB7D4' },
        { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>', title: 'New folder created', time: 'Yesterday', color: '#F2C94C' }
    ],

    init() {
        this.build();
        const clock = el('taskbar-clock');
        clock.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
        clock.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
        });
        document.addEventListener('mousedown', (e) => {
            if (this.isOpen && this.panelEl && !this.panelEl.contains(e.target) && !e.target.closest('#taskbar-clock')) this.close();
        });
    },

    build() {
        this.panelEl = document.createElement('div');
        this.panelEl.id = 'calendar-flyout';
        this.panelEl.setAttribute('role', 'dialog');
        this.panelEl.setAttribute('aria-label', 'Calendar and notifications');
        this.panelEl.classList.add('hidden');
        this.panelEl.innerHTML = `
            <div class="cal-head">
                <div class="cal-clock" id="cal-clock"></div>
                <div class="cal-date" id="cal-date"></div>
            </div>
            <div class="cal-section">
                <div class="cal-section-title">
                    Notifications
                    <button type="button" class="cal-clear" data-cal-clear>Clear all</button>
                </div>
                <div class="cal-notifs" id="cal-notifs"></div>
            </div>
            <div class="cal-section cal-calendar">
                <div class="cal-nav">
                    <button type="button" class="cal-nav-btn" data-cal-prev aria-label="Previous month">&#8249;</button>
                    <span class="cal-month" id="cal-month"></span>
                    <button type="button" class="cal-nav-btn" data-cal-next aria-label="Next month">&#8250;</button>
                </div>
                <div class="cal-grid" id="cal-grid"></div>
            </div>`;

        this.panelEl.addEventListener('click', (e) => {
            if (e.target.closest('[data-cal-prev]')) { this.viewDate.setMonth(this.viewDate.getMonth() - 1); this.renderCalendar(); }
            else if (e.target.closest('[data-cal-next]')) { this.viewDate.setMonth(this.viewDate.getMonth() + 1); this.renderCalendar(); }
            else if (e.target.closest('[data-cal-clear]')) {
                el('cal-notifs').innerHTML = '<div class="cal-empty">You&rsquo;re all caught up</div>';
            }
        });

        document.body.appendChild(this.panelEl);
        this.renderNotifications();
        this.renderCalendar();
        this.updateClock();
        this.timer = setInterval(() => this.updateClock(), 30000);
    },

    renderNotifications() {
        el('cal-notifs').innerHTML = this.NOTIFS.map(n => `
            <div class="cal-notif-item">
                <span class="cal-notif-ico" style="--c:${n.color}">${n.icon}</span>
                <div class="cal-notif-body">
                    <div class="cal-notif-title">${n.title}</div>
                    <div class="cal-notif-time">${n.time}</div>
                </div>
            </div>`).join('');
    },

    updateClock() {
        const now = new Date();
        const t = el('cal-clock');
        const d = el('cal-date');
        if (t) t.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        if (d) d.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    },

    renderCalendar() {
        const y = this.viewDate.getFullYear();
        const m = this.viewDate.getMonth();
        const monthEl = el('cal-month');
        if (monthEl) monthEl.textContent = this.viewDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

        const grid = el('cal-grid');
        if (!grid) return;
        const firstDow = new Date(y, m, 1).getDay();
        const days = new Date(y, m + 1, 0).getDate();
        const today = new Date();
        const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        let html = weekdays.map(w => `<span class="cal-weekday">${w}</span>`).join('');
        for (let i = 0; i < firstDow; i++) html += '<span class="cal-empty-cell"></span>';
        for (let d = 1; d <= days; d++) {
            const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
            html += `<button type="button" class="cal-day${isToday ? ' today' : ''}" data-day="${d}">${d}</button>`;
        }
        grid.innerHTML = html;
    },

    toggle() {
        if (this.isOpen) this.close();
        else this.show();
    },

    show() {
        if (!this.panelEl) return;
        StartMenuManager.hide();
        WidgetsManager.hide();
        QuickSettingsManager.close();
        this.renderCalendar();
        this.updateClock();
        this.panelEl.classList.remove('hidden');
        this.isOpen = true;
    },

    close() {
        if (!this.panelEl) return;
        this.panelEl.classList.add('hidden');
        this.isOpen = false;
    }
};

// --- Windows Lock Screen (PIN + blur + clock) ---
const LockScreenManager = {
    overlayEl: null,
    pinEl: null,
    dotsEl: null,
    enteredPin: '',
    timer: null,
    PIN: '0000',

    init() {
        this.build();
    },

    build() {
        this.overlayEl = document.createElement('div');
        this.overlayEl.id = 'lock-screen';
        this.overlayEl.classList.add('hidden');
        this.overlayEl.innerHTML = `
            <div class="lock-clock">
                <div class="lock-time" id="lock-time"></div>
                <div class="lock-date" id="lock-date"></div>
            </div>
            <div class="lock-auth">
                <div class="lock-avatar">P</div>
                <div class="lock-name">Pinaki Das</div>
                <div class="lock-pin-row">
                    <span class="lock-dot"></span><span class="lock-dot"></span><span class="lock-dot"></span><span class="lock-dot"></span>
                </div>
                <div class="lock-keypad" id="lock-keypad"></div>
                <div class="lock-hint" id="lock-hint">Enter your PIN</div>
            </div>
            <button type="button" class="lock-power" id="lock-power-btn" aria-label="Power options">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>
            </button>
            <div class="lock-powermenu hidden" id="lock-powermenu">
                <div class="power-menu-item" data-lock-power="restart" role="button" tabindex="0">Restart</div>
                <div class="power-menu-item" data-lock-power="shutdown" role="button" tabindex="0">Shut Down</div>
            </div>`;

        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
        const keypad = this.overlayEl.querySelector('#lock-keypad');
        keypad.innerHTML = keys.map(k => {
            if (!k) return '<span class="lock-key lock-key--blank"></span>';
            if (k === 'del') {
                return '<button type="button" class="lock-key" data-key="del" aria-label="Backspace"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11C5.77 20.65 6.31 21 7 21h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg></button>';
            }
            return `<button type="button" class="lock-key" data-key="${k}">${k}</button>`;
        }).join('');

        keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-key]');
            if (!btn) return;
            this.pressKey(btn.dataset.key);
        });

        this.overlayEl.querySelector('#lock-power-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.overlayEl.querySelector('#lock-powermenu').classList.toggle('hidden');
        });

        this.overlayEl.querySelector('#lock-powermenu').addEventListener('click', (e) => {
            const act = e.target.closest('[data-lock-power]');
            if (!act) return;
            this.hide();
            if (act.dataset.lockPower === 'restart') PowerManager.restart();
            else PowerManager.shutdown();
        });

        this.overlayEl.addEventListener('click', (e) => {
            const menu = this.overlayEl.querySelector('#lock-powermenu');
            if (!e.target.closest('#lock-powermenu') && !e.target.closest('#lock-power-btn')) {
                menu.classList.add('hidden');
            }
        });

        this.overlayEl.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') this.pressKey(e.key);
            else if (e.key === 'Backspace') this.pressKey('del');
            else if (e.key === 'Enter') this.submitPin();
        });

        document.body.appendChild(this.overlayEl);
        this.dotsEl = this.overlayEl.querySelector('.lock-pin-row');
        this.hintEl = this.overlayEl.querySelector('#lock-hint');
        this.updateClock();
    },

    pressKey(key) {
        if (this.enteredPin.length >= this.PIN.length && key !== 'del') return;
        if (key === 'del') this.enteredPin = this.enteredPin.slice(0, -1);
        else this.enteredPin += key;
        this.renderDots();
        if (this.enteredPin.length === this.PIN.length) {
            setTimeout(() => this.submitPin(), 180);
        }
    },

    renderDots() {
        const dots = this.dotsEl.querySelectorAll('.lock-dot');
        dots.forEach((d, i) => d.classList.toggle('filled', i < this.enteredPin.length));
    },

    submitPin() {
        if (this.enteredPin === this.PIN) {
            this.overlayEl.classList.add('leaving');
            try { sessionStorage.setItem('win11_pin_hint_seen', '1'); } catch (e) {}
            setTimeout(() => {
                this.overlayEl.classList.remove('leaving');
                this.hide();
            }, 240);
        } else {
            this.overlayEl.classList.remove('shake');
            void this.overlayEl.offsetWidth;
            this.overlayEl.classList.add('shake');
            this.enteredPin = '';
            this.renderDots();
            this.hintEl.textContent = 'Incorrect PIN. Try again.';
            this.hintEl.classList.add('error');
        }
    },

    updateClock() {
        const now = new Date();
        const t = this.overlayEl.querySelector('#lock-time');
        const d = this.overlayEl.querySelector('#lock-date');
        if (t) t.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        if (d) d.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    },

    show() {
        this.hintEl.textContent = this.enteredPin ? 'Enter your PIN' : 'Enter your PIN';
        this.hintEl.classList.remove('error');
        this.enteredPin = '';
        this.renderDots();
        if (this.isFirstRun()) {
            this.hintEl.textContent = 'Enter your PIN (default 0000)';
        }
        this.updateClock();
        this.overlayEl.querySelector('#lock-powermenu').classList.add('hidden');
        StartMenuManager.hide();
        WidgetsManager.hide();
        QuickSettingsManager.close();
        CalendarFlyoutManager.close();
        ContextMenuManager.hide();
        SnapManager.closeLayout();
        this.overlayEl.classList.remove('hidden');
        const firstKey = this.overlayEl.querySelector('[data-key="1"]');
        if (firstKey) firstKey.focus();
        clearInterval(this.timer);
        this.timer = setInterval(() => this.updateClock(), 30000);
    },

    isFirstRun() {
        try { return !sessionStorage.getItem('win11_pin_hint_seen'); } catch (e) { return true; }
    },

    hide() {
        this.overlayEl.classList.add('hidden');
        clearInterval(this.timer);
        this.timer = null;
    },

    isLocked() {
        return !!(this.overlayEl && !this.overlayEl.classList.contains('hidden'));
    }
};

// --- Power Manager (Restart / Shut Down / Sign In) ---
const PowerManager = {    screenEl: null,
    stageEl: null,
    offEl: null,
    textEl: null,
    shutDownMs: 2800,

    init() {
        this.screenEl = el('power-screen');
        this.stageEl = el('power-screen-stage');
        this.offEl = el('power-off');
        this.textEl = el('power-screen-text');

        const powerBtn = document.querySelector('.power-btn');
        if (powerBtn) {
            powerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        const menu = el('power-menu');
        if (menu) {
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.closest('[data-power-action]');
                if (!action) return;
                this.closeMenu();
                if (action.dataset.powerAction === 'lock') { this.closeMenu(); LockScreenManager.show(); }
                else if (action.dataset.powerAction === 'restart') this.restart();
                else if (action.dataset.powerAction === 'shutdown') this.shutdown();
            });
        }

        const signIn = el('power-signin-btn');
        if (signIn) signIn.addEventListener('click', () => this.signIn());
    },

    toggleMenu() {
        const menu = el('power-menu');
        if (!menu) return;
        if (menu.hidden) {
            StartMenuManager.show();
            menu.hidden = false;
        } else {
            menu.hidden = true;
        }
    },

    closeMenu() {
        const menu = el('power-menu');
        if (menu) menu.hidden = true;
    },

    restart() {
        this.showScreen('Restarting');
        setTimeout(() => {
            window.location.reload();
        }, this.shutDownMs);
    },

    shutdown() {
        this.showScreen('Shutting down');
        setTimeout(() => {
            this.stageEl.hidden = true;
            this.offEl.hidden = false;
        }, this.shutDownMs);
    },

    showScreen(text) {
        StartMenuManager.hide();
        LockScreenManager.hide();
        this.closeMenu();
        this.stageEl.hidden = false;
        this.offEl.hidden = true;
        this.textEl.textContent = text;
        this.screenEl.classList.remove('hidden');
        this.screenEl.hidden = false;
    },

    signIn() {
        try { sessionStorage.removeItem('welcome-overlay-seen'); } catch (e) {}
        window.location.reload();
    }
};

// --- Keyboard Shortcuts & System Keys ---
// Escape, Ctrl+A, Enter, F5, Alt+F4 plus best-effort Meta(Win)+D/E/R and
// Alt+Tab. Note: the OS reserves Alt+Tab / Win / Alt+F4 on Windows, so the
// Task View button + Show Desktop + tray fallbacks keep these reachable by
// mouse. The Run dialog is a fully working fake "Run..." command box.
const KeyboardShortcuts = {
    switcherEl: null,
    switcherItems: [],
    switcherIndex: 0,
    switcherOpen: false,
    showDesktopState: null,
    _prevVisible: [],

    RUN_ALIASES: {
        'explorer': 'this-pc', 'this pc': 'this-pc', 'computer': 'this-pc',
        'resume': 'resume', 'resume.pdf': 'resume',
        'cert': 'cert', 'certificates': 'cert', 'certificate': 'cert',
        'recycle': 'recycle', 'recycle bin': 'recycle',
        'github': 'github', 'projects': 'projects', 'network': 'network',
        'notepad': 'notepad', 'notepad.exe': 'notepad',
        'calc': 'calc', 'calculator': 'calc', 'calc.exe': 'calc',
        'taskmgr': 'taskmgr', 'task manager': 'taskmgr', 'taskmgr.exe': 'taskmgr',
        'settings': 'settings', 'ms-settings': 'settings', 'settings app': 'settings',
        'about': 'about', 'about me': 'about', 'profile': 'about'
    },

    init() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => {
            if (this.switcherOpen && (e.key === 'Alt' || e.key === 'Meta')) {
                this.activateSwitcherItem(this.switcherIndex);
            }
        });
    },

    isTyping(e) {
        const t = e.target;
        if (!t || !t.tagName) return false;
        const tag = t.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
    },

    focusInWindow() {
        const ae = document.activeElement;
        return !!(ae && ae.closest && ae.closest('.window'));
    },

    onKeyDown(e) {
        // While locked, only the lock screen's own keypad handler reacts.
        if (LockScreenManager.isLocked()) return;

        // Alt+Tab window switcher
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            if (!this.switcherOpen) this.openSwitcher();
            this.cycleSwitcher(e.shiftKey ? -1 : 1);
            return;
        }

        if (this.isTyping(e)) {
            if (e.key === 'Escape') e.target.blur();
            return;
        }

        // While the switcher is open only arrow/enter/escape make sense.
        if (this.switcherOpen) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); this.cycleSwitcher(1); }
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); this.cycleSwitcher(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); this.activateSwitcherItem(this.switcherIndex); }
            else if (e.key === 'Escape') { e.preventDefault(); this.closeSwitcher(); }
            return;
        }

        if (e.altKey && e.key.toLowerCase() === 'f4') {
            e.preventDefault();
            this.altF4();
            return;
        }

        if (e.altKey && !e.ctrlKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            this.lockScreen();
            return;
        }

        if (e.metaKey) {
            const k = e.key.toLowerCase();
            if (k === 'd') { e.preventDefault(); this.toggleShowDesktop(); }
            else if (k === 'e') { e.preventDefault(); this.openThisPC(); }
            else if (k === 'r') { e.preventDefault(); this.showRunDialog(); }
            return;
        }

        if (e.ctrlKey) {
            if (e.key.toLowerCase() === 'a' && !this.focusInWindow()) {
                e.preventDefault();
                DesktopManager.selectAll();
            }
            return;
        }

        if (e.key === 'Escape') this.handleEscape();
        else if (e.key === 'Enter') this.openSelected();
        else if (e.key.toLowerCase() === 'f5') { e.preventDefault(); DesktopManager.refresh(); }
    },

    handleEscape() {
        if (this.switcherOpen) { this.closeSwitcher(); return; }
        const run = el('run-dialog');
        if (run && !run.hidden) { this.hideRunDialog(); return; }
        if (ContextMenuManager.menuEl && !ContextMenuManager.menuEl.classList.contains('hidden')) ContextMenuManager.hide();
        if (StartMenuManager.isOpen) StartMenuManager.hide();
        if (WidgetsManager.isOpen) WidgetsManager.hide();
        if (QuickSettingsManager.isOpen) QuickSettingsManager.close();
        if (CalendarFlyoutManager.isOpen) CalendarFlyoutManager.close();
        const pm = el('power-menu');
        if (pm && !pm.hidden) pm.hidden = true;
    },

    openSelected() {
        if (this.focusInWindow()) return;
        const sel = document.querySelector('.desktop-icon.selected');
        if (!sel) return;
        const data = STATE.desktopIcons.find(i => i.id === sel.dataset.id);
        if (!data) return;
        WindowManager.open(data);
        DesktopManager.clearSelection();
    },

    altF4() {
        const winId = STATE.activeWindowId;
        const winEl = winId && el(winId);
        if (winEl) {
            const appId = WindowManager.findAppId(winId);
            WindowManager.close(winId, appId || winId);
            return;
        }
        // Desktop: same surface as the Start-menu power button.
        if (StartMenuManager.isOpen) StartMenuManager.hide();
        const powerBtn = document.querySelector('.power-btn');
        if (powerBtn) powerBtn.click();
    },

    lockScreen() {
        StartMenuManager.hide();
        WidgetsManager.hide();
        LockScreenManager.show();
    },

    toggleShowDesktop() {
        if (this.showDesktopState === 'hidden') {
            (this._prevVisible || []).forEach(winId => {
                const winEl = el(winId);
                if (winEl && winEl.style.visibility === 'hidden') WindowManager.restore(winId);
            });
            this._prevVisible = [];
            this.showDesktopState = null;
        } else {
            this._prevVisible = [];
            STATE.windows.forEach((winEl) => {
                if (winEl.style.visibility !== 'hidden') this._prevVisible.push(winEl.id);
                WindowManager.minimize(winEl.id);
            });
            this.showDesktopState = 'hidden';
        }
    },

    openThisPC() {
        const app = appById('this-pc');
        if (app) WindowManager.open(app);
    },

    /* ---------------- Alt+Tab switcher ---------------- */

    openSwitcher() {
        if (this.switcherEl) return;
        const wins = [];
        STATE.windows.forEach((winEl) => wins.push(winEl));
        wins.sort((a, b) => (parseInt(b.style.zIndex, 10) || 0) - (parseInt(a.style.zIndex, 10) || 0));
        if (!wins.length) return;

        this.switcherItems = wins.map(winEl => ({
            winId: winEl.id,
            title: (winEl.querySelector('.title-text') || {}).textContent || 'Window',
            icon: (winEl.querySelector('.title-icon') || {}).src || ''
        }));

        const overlay = document.createElement('div');
        overlay.className = 'alt-tab-overlay';
        overlay.id = 'alt-tab-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Task switcher');
        overlay.innerHTML = this.switcherItems.map((w, i) => `
            <div class="alt-tab-card${i === 0 ? ' is-active' : ''}" data-index="${i}" role="button" tabindex="0"
                 aria-label="Switch to ${esc(w.title)}">
                <div class="alt-tab-thumb"><img src="${esc(w.icon)}" alt=""></div>
                <div class="alt-tab-title">${esc(w.title)}</div>
            </div>`).join('');

        overlay.addEventListener('mousedown', (e) => {
            const card = e.target.closest('.alt-tab-card');
            if (card) this.activateSwitcherItem(parseInt(card.dataset.index, 10));
        });
        document.body.appendChild(overlay);
        this.switcherEl = overlay;
        this.switcherOpen = true;
        this.switcherIndex = 0;
    },

    cycleSwitcher(dir) {
        if (!this.switcherItems.length) return;
        this.switcherIndex = (this.switcherIndex + dir + this.switcherItems.length) % this.switcherItems.length;
        const cards = this.switcherEl.querySelectorAll('.alt-tab-card');
        cards.forEach((c, i) => c.classList.toggle('is-active', i === this.switcherIndex));
        const active = cards[this.switcherIndex];
        if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    },

    activateSwitcherItem(index) {
        const item = this.switcherItems[index];
        if (item) {
            const winEl = el(item.winId);
            if (winEl) {
                if (winEl.style.visibility === 'hidden') WindowManager.restore(item.winId);
                else WindowManager.focus(item.winId);
            }
        }
        this.closeSwitcher();
    },

    closeSwitcher() {
        if (this.switcherEl) {
            this.switcherEl.remove();
            this.switcherEl = null;
        }
        this.switcherItems = [];
        this.switcherOpen = false;
    },

    /* ---------------- Run dialog ---------------- */

    getRunDialog() {
        let run = el('run-dialog');
        if (run) return run;
        run = document.createElement('div');
        run.id = 'run-dialog';
        run.className = 'run-dialog';
        run.hidden = true;
        run.innerHTML = `
            <div class="run-dialog__box" role="dialog" aria-label="Run">
                <div class="run-dialog__head">
                    <span>Run</span>
                    <button class="ctrl-btn" data-run-close aria-label="Close">
                        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1,1 L9,9 M9,1 L1,9" stroke="currentColor" stroke-width="1.5"/></svg>
                    </button>
                </div>
                <div class="run-dialog__body">
                    <div class="run-dialog__row">
                        <label for="run-dialog-input">Open:</label>
                        <input id="run-dialog-input" data-run-input type="text"
                            placeholder="Type the name of a program, folder, document..." autocomplete="off">
                    </div>
                </div>
                <div class="run-dialog__foot">
                    <button type="button" data-run-cancel>Cancel</button>
                    <button type="button" data-run-ok class="run-dialog__ok">OK</button>
                </div>
            </div>`;
        document.body.appendChild(run);

        run.addEventListener('click', (e) => {
            if (e.target.closest('[data-run-close]') || e.target.closest('[data-run-cancel]')) this.hideRunDialog();
            else if (e.target.closest('[data-run-ok]')) this.executeRun();
        });
        run.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); this.executeRun(); }
            else if (e.key === 'Escape') this.hideRunDialog();
        });
        run.addEventListener('mousedown', (e) => {
            if (e.target === run) this.hideRunDialog();
        });
        return run;
    },

    showRunDialog() {
        StartMenuManager.hide();
        WidgetsManager.hide();
        ContextMenuManager.hide();
        const run = this.getRunDialog();
        run.hidden = false;
        const input = run.querySelector('[data-run-input]');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 10);
        }
    },

    hideRunDialog() {
        const run = el('run-dialog');
        if (run) run.hidden = true;
    },

    executeRun() {
        const run = el('run-dialog');
        if (!run) return;
        const input = run.querySelector('[data-run-input]');
        const q = (input.value || '').trim().toLowerCase();
        this.hideRunDialog();
        if (!q) return;
        const appId = this.RUN_ALIASES[q];
        if (appId) {
            const app = appById(appId);
            if (app) WindowManager.open(app);
        }
    }
};