/**
 * Windows 11 UI Engine
 * Modular Vanilla JS implementation
 */

// --- Icons ---
const Icons = {
    computer: 'assets/icons/this-pc.png',
    network: 'assets/icons/network.png',
    trash: 'assets/icons/recycle-bin.png',
    folder: 'assets/icons/certificate.png',
    pdf: 'assets/icons/resume.png'
};

// --- Built-in desktop app icons (inline SVG data URIs, no image assets needed) ---
const AppIcons = {
    notepad: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='3' y='2' width='18' height='20' rx='2.5' fill='%231E6F9F'/><path d='M6 7h12v2H6zm0 4h12v2H6zm0 4h8v2H6z' fill='%23fff' opacity='.85'/></svg>",
    calc: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='4' y='2' width='16' height='20' rx='2.5' fill='%232D6A4F'/><rect x='8' y='4.5' width='8' height='3.5' fill='%23fff' rx='.6'/><g fill='%23fff'><circle cx='8.5' cy='11.5' r='1.2'/><circle cx='12' cy='11.5' r='1.2'/><circle cx='15.5' cy='11.5' r='1.2'/><circle cx='8.5' cy='15.5' r='1.2'/><circle cx='12' cy='15.5' r='1.2'/><circle cx='15.5' cy='15.5' r='1.2'/><circle cx='8.5' cy='19.5' r='1.2'/><circle cx='12' cy='19.5' r='1.2'/><circle cx='15.5' cy='19.5' r='1.2'/></g></svg>",
    taskmgr: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='3' width='20' height='18' rx='2' fill='%230067C0'/><rect x='5' y='6' width='14' height='2' fill='%23fff' opacity='.7'/><path d='M6 16l3.2-4 2.6 2.4L17 8' fill='none' stroke='%23fff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    settings: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M19.4 13c.04-.33.06-.66.06-1s-.02-.67-.06-1l2.06-1.6-2-3.46-2.43 1a7.6 7.6 0 0 0-2.93-1.7L13.5 2h-3l-.6 3.24a7.6 7.6 0 0 0-2.93 1.7l-2.43-1-2 3.46L4.6 11c-.04.33-.06.66-.06 1s.02.67.06 1l-2.06 1.6 2 3.46 2.43-1a7.6 7.6 0 0 0 2.93 1.7L10.5 22h3l.6-3.24a7.6 7.6 0 0 0 2.93-1.7l2.43 1 2-3.46L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z' fill='%23F2F2F2'/></svg>"
};

// --- Uploaded documents (resume + certificates) ---
const RESUME_FILE = 'assets/resume/Pinaki_Das_CV.pdf';

// --- App Config & State ---
const CONFIG = {
    gridX: 84,
    gridY: 104,
    desktopPadding: 10
};

const STATE = {
    zIndexCount: 100,
    windows: new Map(), // id -> DOM element
    activeWindowId: null,
    recycledItems: [], // { id, title, type, icon }
    desktopIcons: [
        { id: 'this-pc', title: 'This PC', type: 'explorer', icon: Icons.computer, initialX: 0, initialY: 0, keywords: 'my pc computer file explorer files folders' },
        { id: 'network', title: 'Network', type: 'explorer', icon: Icons.network, initialX: 0, initialY: 1, keywords: 'links' },
        { id: 'recycle', title: 'Recycle Bin', type: 'explorer', icon: Icons.trash, initialX: 0, initialY: 2, keywords: 'trash deleted' },
        { id: 'cert', title: 'Certificate', type: 'folder', icon: Icons.folder, initialX: 0, initialY: 3, keywords: 'certificates courses coursera aws linux' },
        { id: 'resume', title: 'Resume.pdf', type: 'pdf', icon: Icons.pdf, pdf: RESUME_FILE, initialX: 0, initialY: 4, keywords: 'cv resume download document' },
        { id: 'projects', title: 'Projects', type: 'folder', icon: Icons.folder, pinnedOnly: true, keywords: 'nova ai chatbot object detection eighth wonder' },
        { id: 'github', title: 'GitHub', type: 'explorer', icon: Icons.network, pinnedOnly: true, keywords: 'git profile repository' },
        { id: 'notepad', title: 'Notepad', type: 'app', icon: AppIcons.notepad, pinnedOnly: true, keywords: 'notes text editor write type pad' },
        { id: 'calc', title: 'Calculator', type: 'app', icon: AppIcons.calc, pinnedOnly: true, keywords: 'math calculate calculator numbers sum' },
        { id: 'taskmgr', title: 'Task Manager', type: 'app', icon: AppIcons.taskmgr, pinnedOnly: true, keywords: 'processes performance cpu memory monitor task manager' },
        { id: 'settings', title: 'Settings', type: 'app', icon: AppIcons.settings, pinnedOnly: true, keywords: 'settings options configuration personalize system display network bluetooth' }
    ]
};

// --- Utilities ---
const el = (id) => document.getElementById(id);
const appById = (id) => STATE.desktopIcons.find((app) => app.id === id);
const esc = (value) => {
    if (window.Android && Android.Utils && Android.Utils.esc) return Android.Utils.esc(value);
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

// --- Lightweight desktop toast (bottom-center, above the taskbar) ---
const DesktopToast = {
    timer: null,
    show(message) {
        let toast = document.getElementById('desktop-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'desktop-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
    }
};

// --- Networking app data ---
const NETWORK_LINKS = [
    {
        id: 'email',
        label: 'Email',
        account: 'daspinaki2005@gmail.com',
        href: 'mailto:daspinaki2005@gmail.com',
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#0F6CBD"/><path d="M4.5 7.5h15v9h-15z" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M4.8 7.6 12 13.2l7.2-5.6" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        account: 'linkedin.com/in/pinaki-das-9a2860281',
        href: 'https://linkedin.com/in/pinaki-das-9a2860281',
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2"/><path fill="#fff" d="M6.5 9.2v7.8H4.2V9.2h2.3zM4.3 5.4a1.4 1.4 0 1 1 2.7 0 1.4 1.4 0 0 1-2.7 0zM12.9 10v-1.4h-2.3V17h2.3v-3.9c0-1 .5-1.8 1.6-1.8 1 0 1.5.7 1.5 1.8V17h2.3v-4.4c0-2.3-1.2-3.5-3-3.5-1.4 0-2 .7-2.4 1.4z"/></svg>'
    },
    {
        id: 'github',
        label: 'GitHub',
        account: 'github.com/DASPINAKI2005',
        href: 'https://github.com/DASPINAKI2005',
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#18181b"/><path fill="#fff" d="M12 4.5A7.5 7.5 0 0 0 8.9 19c.4.1.5-.2.5-.4v-1.4c-2 .4-2.4-.9-2.4-.9-.3-.8-.8-1-.8-1-.7-.5 0-.5 0-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.9 2.2.7.1-.5.3-.9.5-1.1-1.7-.2-3.5-.9-3.5-3.9 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3-1.8 3.7-3.5 3.9.3.3.6.8.6 1.6v2.2c0 .2.1.5.5.4A7.5 7.5 0 0 0 12 4.5z"/></svg>'
    },
    {
        id: 'instagram',
        label: 'Instagram',
        account: 'instagram.com/daspinaki2005',
        href: 'https://instagram.com/daspinaki2005',
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="net-ig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F58529"/><stop offset=".5" stop-color="#DD2A7B"/><stop offset="1" stop-color="#8134AF"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#net-ig)"/><rect x="5.7" y="5.7" width="12.6" height="12.6" rx="3.6" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="16.9" cy="7.1" r="1.3" fill="#fff"/><circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" stroke-width="1.5"/></svg>'
    }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    WallpaperManager.init();
    DesktopManager.init();
    TaskbarManager.init();
    ClockManager.init();
    ContextMenuManager.init();
    StartMenuManager.init();
    WidgetsManager.init();
    SelectionManager.init();
    PowerManager.init();
    QuickSettingsManager.init();
    CalendarFlyoutManager.init();
    LockScreenManager.init();
    KeyboardShortcuts.init();
});

// --- Wallpaper Slideshow ---
// TODO: Replace the default wallpapers in assets/wallpapers/ with personal ones.
const WallpaperManager = {
    wallpapers: [
        'assets/wallpapers/wallpaper1.png',
        'assets/wallpapers/wallpaper2.jpg',
        'assets/wallpapers/wallpaper3.jpg',
        'assets/wallpapers/wallpaper4.jpg',
        'assets/wallpapers/wallpaper5.webp'
    ],
    layers: [],
    current: 0,
    activeLayer: 0,
    interval: null,

    init() {
        for (let i = 0; i < 2; i++) {
            const layer = document.createElement('div');
            layer.className = 'wallpaper-layer';
            document.body.prepend(layer);
            this.layers.push(layer);
        }

        this.wallpapers.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        let saved = null;
        try { saved = parseInt(localStorage.getItem('win11_wallpaper'), 10); } catch (e) {}
        if (!isNaN(saved) && saved >= 0 && saved < this.wallpapers.length) this.current = saved;

        this.layers[0].style.backgroundImage = `url("${this.wallpapers[this.current]}")`;
        this.layers[0].style.opacity = 1;

        this.interval = setInterval(() => this.next(), 5000);
    },

    next() {
        const next = (this.current + 1) % this.wallpapers.length;
        const from = this.layers[this.activeLayer];
        const to = this.layers[1 - this.activeLayer];
        to.style.backgroundImage = `url("${this.wallpapers[next]}")`;
        from.style.opacity = 0;
        to.style.opacity = 1;
        this.current = next;
        this.activeLayer = 1 - this.activeLayer;
    },

    /** Sets a specific wallpaper (used by Settings > Personalization). */
    set(index) {
        if (index < 0 || index >= this.wallpapers.length) return;
        const from = this.layers[this.activeLayer];
        const to = this.layers[1 - this.activeLayer];
        to.style.backgroundImage = `url("${this.wallpapers[index]}")`;
        from.style.opacity = 0;
        to.style.opacity = 1;
        this.current = index;
        this.activeLayer = 1 - this.activeLayer;
        // An explicit choice stops the default slideshow so the picked
        // wallpaper stays put (Windows "choose wallpaper" behaviour).
        if (this.interval) { clearInterval(this.interval); this.interval = null; }
        try { localStorage.setItem('win11_wallpaper', String(index)); } catch (e) {}
    }
};

// --- Desktop & Icons ---
const DesktopManager = {
    container: null,
    
    init() {
        this.container = el('icon-container');
        this.loadPositions();
        this.loadRecycle();
        this.loadDynamic();
        this.renderIcons();
        this.attachEvents();
    },

    loadRecycle() {
        try { STATE.recycledItems = JSON.parse(localStorage.getItem('win11_recycle')) || []; }
        catch (e) { STATE.recycledItems = []; }
    },

    saveRecycle() {
        try { localStorage.setItem('win11_recycle', JSON.stringify(STATE.recycledItems)); }
        catch (e) {}
    },

    loadDynamic() {
        let dyn = [];
        try { dyn = JSON.parse(localStorage.getItem('win11_dynamic')) || []; }
        catch (e) { dyn = []; }
        dyn.forEach(d => STATE.desktopIcons.push(d));
    },

    saveDynamic() {
        const dyn = STATE.desktopIcons.filter(i => i.dynamic);
        try { localStorage.setItem('win11_dynamic', JSON.stringify(dyn)); }
        catch (e) {}
    },

    loadPositions() {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('win11_icons')) || {}; } catch (e) { saved = {}; }
        STATE.desktopIcons.forEach(icon => {
            if (saved[icon.id]) {
                icon.x = saved[icon.id].x;
                icon.y = saved[icon.id].y;
            } else {
                icon.x = icon.initialX * CONFIG.gridX + CONFIG.desktopPadding;
                icon.y = icon.initialY * CONFIG.gridY + CONFIG.desktopPadding;
            }
        });
    },

    savePositions() {
        const toSave = {};
        STATE.desktopIcons.forEach(i => toSave[i.id] = {x: i.x, y: i.y});
        localStorage.setItem('win11_icons', JSON.stringify(toSave));
    },

    renderIcons() {
        this.container.innerHTML = '';
        STATE.desktopIcons.forEach(icon => {
            if (icon.pinnedOnly || icon.deleted) return;
            const div = document.createElement('div');
            div.className = 'desktop-icon';
            div.id = `icon-${icon.id}`;
            div.dataset.id = icon.id;
            div.style.left = `${icon.x}px`;
            div.style.top = `${icon.y}px`;
            div.setAttribute('tabindex', '0');
            
            div.innerHTML = `
                <img src="${icon.icon}" alt="${icon.title}">
                <span class="icon-label">${icon.title}</span>
            `;
            
            this.container.appendChild(div);
        });
    },

    attachEvents() {
        const desktop = el('desktop');
        
        desktop.addEventListener('mousedown', (e) => {
            if (e.target.closest('.desktop-icon')) return;
            this.clearSelection();
        });

        // Icon Interaction Delegation
        this.container.addEventListener('mousedown', (e) => {
            const iconEl = e.target.closest('.desktop-icon');
            if (iconEl) {
                e.stopPropagation();
                if (!e.ctrlKey && !iconEl.classList.contains('selected')) {
                    this.clearSelection();
                }
                iconEl.classList.add('selected');
                this.initDrag(e, iconEl);
            }
        });

        this.container.addEventListener('dblclick', (e) => {
            const iconEl = e.target.closest('.desktop-icon');
            if (iconEl) {
                const iconData = STATE.desktopIcons.find(i => i.id === iconEl.dataset.id);
                WindowManager.open(iconData);
                this.clearSelection();
            }
        });
    },

    clearSelection() {
        document.querySelectorAll('.desktop-icon.selected').forEach(el => {
            el.classList.remove('selected');
        });
    },

    selectAll() {
        document.querySelectorAll('.desktop-icon').forEach(el => el.classList.add('selected'));
    },

    refresh() {
        if (!this.container) return;
        this.renderIcons();
    },

    /** Number of grid columns that fit the current viewport. */
    columns() {
        return Math.max(1, Math.floor((window.innerWidth - CONFIG.desktopPadding) / CONFIG.gridX));
    },

    /** Creates a dynamic (user-made) folder or text document on the desktop. */
    createItem(kind) {
        const id = 'item-' + Date.now();
        const isFolder = kind === 'folder';
        const cols = this.columns();
        const rows = Math.max(1, Math.floor((window.innerHeight - 140) / CONFIG.gridY));
        const data = {
            id,
            title: isFolder ? 'New Folder' : 'New Text Document.txt',
            type: isFolder ? 'folder' : 'text',
            icon: isFolder ? Icons.folder : Icons.pdf,
            dynamic: true,
            x: CONFIG.desktopPadding + (Math.floor(Math.random() * cols) % cols) * CONFIG.gridX,
            y: CONFIG.desktopPadding + (Math.floor(Math.random() * rows) % rows) * CONFIG.gridY,
            keywords: isFolder ? 'folder new folder' : 'text document txt notepad'
        };
        STATE.desktopIcons.push(data);
        this.renderIcons();
        this.savePositions();
        this.saveDynamic();
        this.renameIcon(id);
    },

    /** Inline rename: swaps the icon label for an input (Enter commits, Esc cancels). */
    renameIcon(id) {
        const iconEl = el('icon-' + id);
        const data = STATE.desktopIcons.find(i => i.id === id);
        if (!iconEl || !data || iconEl.querySelector('.inline-rename')) return;
        const label = iconEl.querySelector('.icon-label');
        if (!label) return;

        const input = document.createElement('input');
        input.className = 'inline-rename';
        input.value = data.title;
        input.setAttribute('aria-label', 'Rename ' + data.title);
        label.replaceWith(input);
        input.focus();
        input.select();

        const finish = (commit) => {
            if (commit) {
                let value = input.value.trim();
                if (!value) value = data.title;
                data.title = value;
                const winEl = STATE.windows.get(id);
                if (winEl) {
                    const t = winEl.querySelector('.title-text');
                    if (t) t.textContent = value;
                }
                if (data.dynamic) this.saveDynamic();
            }
            const newLabel = document.createElement('span');
            newLabel.className = 'icon-label';
            newLabel.textContent = data.title;
            if (input.parentNode) input.replaceWith(newLabel);
        };

        input.addEventListener('blur', () => finish(true));
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') input.blur();
            else if (e.key === 'Escape') finish(false);
        });
    },

    /** Moves selected desktop icons to the Recycle Bin. */
    recycleSelected() {
        const selected = document.querySelectorAll('.desktop-icon.selected');
        if (!selected.length) return;
        const names = [];
        selected.forEach(iconEl => {
            const data = STATE.desktopIcons.find(i => i.id === iconEl.dataset.id);
            if (!data) return;
            STATE.recycledItems.push({ id: data.id, title: data.title, type: data.type, icon: data.icon });
            data.deleted = true;
            names.push(data.title);
        });
        this.renderIcons();
        this.saveRecycle();
        this.saveDynamic();
        DesktopToast.show((names.length === 1 ? names[0] : names.length + ' items') + ' moved to the Recycle Bin');
    },

    restoreItem(id) {
        const idx = STATE.recycledItems.findIndex(r => r.id === id);
        if (idx === -1) return;
        STATE.recycledItems.splice(idx, 1);
        const data = STATE.desktopIcons.find(i => i.id === id);
        if (data) data.deleted = false;
        this.renderIcons();
        this.saveRecycle();
    },

    emptyRecycle() {
        if (!STATE.recycledItems.length) return;
        STATE.recycledItems = [];
        this.saveRecycle();
        this.renderIcons();
    },

    /** Sorts visible desktop icons into grid order (name or default). */
    sortIcons(mode) {
        const visible = STATE.desktopIcons.filter(i => !i.pinnedOnly && !i.deleted);
        if (mode === 'name') {
            visible.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));
        } else {
            visible.sort((a, b) => {
                const ia = (a.initialY || 99) * 1000 + (a.initialX || 0);
                const ib = (b.initialY || 99) * 1000 + (b.initialX || 0);
                return ia - ib;
            });
        }
        const cols = this.columns();
        visible.forEach((icon, i) => {
            icon.x = CONFIG.desktopPadding + (i % cols) * CONFIG.gridX;
            icon.y = CONFIG.desktopPadding + Math.floor(i / cols) * CONFIG.gridY;
        });
        this.renderIcons();
        this.savePositions();
    },

    initDrag(e, iconEl) {
        let startX = e.clientX;
        let startY = e.clientY;
        const initialLeft = parseInt(iconEl.style.left || 0);
        const initialTop = parseInt(iconEl.style.top || 0);
        
        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            iconEl.style.left = `${initialLeft + dx}px`;
            iconEl.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = (upEvent) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Snap to grid
            const rawX = parseInt(iconEl.style.left);
            const rawY = parseInt(iconEl.style.top);
            
            const col = Math.max(0, Math.round((rawX - CONFIG.desktopPadding) / CONFIG.gridX));
            const row = Math.max(0, Math.round((rawY - CONFIG.desktopPadding) / CONFIG.gridY));
            
            const finalX = col * CONFIG.gridX + CONFIG.desktopPadding;
            const finalY = row * CONFIG.gridY + CONFIG.desktopPadding;
            
            iconEl.style.left = `${finalX}px`;
            iconEl.style.top = `${finalY}px`;
            
            // Update state & save
            const iconData = STATE.desktopIcons.find(i => i.id === iconEl.dataset.id);
            iconData.x = finalX;
            iconData.y = finalY;
            this.savePositions();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
};

// --- Desktop Selection Rectangle ---
const SelectionManager = {
    init() {
        const desktop = el('desktop');
        const box = el('selection-box');
        let isSelecting = false;
        let startX, startY;

        desktop.addEventListener('mousedown', (e) => {
            if (e.target !== desktop && e.target.id !== 'icon-container') return;
            if (e.button !== 0) return; // Only left click

            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;
            
            box.hidden = false;
            box.style.left = `${startX}px`;
            box.style.top = `${startY}px`;
            box.style.width = `0px`;
            box.style.height = `0px`;
            ContextMenuManager.hide();
            StartMenuManager.hide();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            box.style.left = `${left}px`;
            box.style.top = `${top}px`;
            box.style.width = `${width}px`;
            box.style.height = `${height}px`;

            this.checkCollisions({left, top, right: left + width, bottom: top + height});
        });

        document.addEventListener('mouseup', () => {
            if (isSelecting) {
                isSelecting = false;
                box.hidden = true;
            }
        });
    },

    checkCollisions(selRect) {
        document.querySelectorAll('.desktop-icon').forEach(iconEl => {
            const rect = iconEl.getBoundingClientRect();
            if (rect.left < selRect.right &&
                rect.right > selRect.left &&
                rect.top < selRect.bottom &&
                rect.bottom > selRect.top) {
                iconEl.classList.add('selected');
            } else {
                iconEl.classList.remove('selected');
            }
        });
    }
};

// --- Window Manager ---
const WindowManager = {
    container: null,
    template: null,

    init() {
        if(!this.container) {
            this.container = el('window-container');
            this.template = el('window-template');
            this.container.addEventListener('click', (e) => {
                const certItem = e.target.closest('[data-cert]');
                if (certItem) {
                    this.openCert(certItem.dataset.cert);
                    return;
                }
                const navFolder = e.target.closest('[data-nav-folder]');
                if (navFolder) {
                    this.navigateFolder(navFolder.closest('.window'), navFolder.dataset.navFolder);
                    return;
                }
                const navBack = e.target.closest('[data-nav-back]');
                if (navBack) {
                    this.navigateBack(navBack.closest('.window'));
                    return;
                }
                const openApp = e.target.closest('[data-open-app]');
                if (openApp) {
                    const app = appById(openApp.dataset.openApp);
                    if (app) this.open(app);
                    return;
                }
                const restore = e.target.closest('[data-restore]');
                if (restore) {
                    DesktopManager.restoreItem(restore.dataset.restore);
                    return;
                }
                const emptyBtn = e.target.closest('[data-empty-recycle]');
                if (emptyBtn) {
                    DesktopManager.emptyRecycle();
                    return;
                }
                const netLink = e.target.closest('[data-network-link]');
                if (netLink) {
                    this.openNetworkLink(netLink.dataset.networkLink);
                    return;
                }
                const dl = e.target.closest('[data-pdf-download]');
                if (dl && dl.dataset.pdfDownload) {
                    const a = document.createElement('a');
                    a.href = dl.dataset.pdfDownload;
                    a.download = dl.dataset.pdfDownload.split('/').pop();
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
            });
        }
    },

    open(appData) {
        this.init();
        const winId = `win-${appData.id}-${Date.now()}`;
        
        if(STATE.windows.has(appData.id) && appData.id !== 'cert') {
            const existing = STATE.windows.get(appData.id);
            if (existing.style.opacity === '0') {
                this.restore(existing.id);
            } else {
                this.focus(existing.id);
            }
            return;
        }

        const clone = this.template.content.cloneNode(true);
        const winEl = clone.querySelector('.window');
        winEl.id = winId;
        
        // Setup Header
        winEl.querySelector('.title-icon').src = appData.icon;
        winEl.querySelector('.title-text').textContent = appData.title;

        // Position slightly offset
        const offset = (STATE.windows.size * 30) % 150;
        winEl.style.left = `${100 + offset}px`;
        winEl.style.top = `${100 + offset}px`;
        
        // Generate Content
        const contentArea = winEl.querySelector('.window-content');
        if (appData.type === 'pdf') {
            contentArea.innerHTML = this.renderPdfContent(appData);
        } else if (appData.id === 'this-pc') {
            contentArea.innerHTML = this.renderMyPc(appData);
            winEl._fsStack = ['root'];
            const backBtn = winEl.querySelector('[data-nav-back]');
            if (backBtn) backBtn.style.visibility = 'hidden';
        } else if (appData.id === 'projects') {
            contentArea.innerHTML = this.renderExplorerFrame(appData, this.renderFsItems(this.fsDirs.projects.items()));
        } else if (appData.id === 'github') {
            contentArea.innerHTML = this.renderExplorerFrame(appData, this.renderGitHubBody());
        } else if (appData.id === 'recycle') {
            contentArea.innerHTML = this.renderRecycleView();
        } else if (appData.id === 'network') {
            contentArea.innerHTML = this.renderExplorerFrame(appData, this.renderNetworkBody());
        } else if (appData.type === 'app') {
            contentArea.innerHTML = this.renderSystemApp(appData);
        } else if (appData.type === 'folder') {
            contentArea.innerHTML = appData.dynamic
                ? this.renderExplorerFrame(appData, '<div style="color: var(--text-secondary); font-size: 13px;">This folder is empty.</div>')
                : this.renderExplorerFrame(appData, this.renderCertGrid());
        } else {
            contentArea.innerHTML = this.renderExplorerFrame(
                appData,
                '<div style="color: var(--text-secondary); font-size: 13px;">This folder is empty.</div>'
            );
        }

        // Controls binding
        winEl.querySelector('.close').addEventListener('click', () => this.close(winId, appData.id));
        winEl.querySelector('.maximize').addEventListener('click', () => this.toggleMaximize(winId));
        winEl.querySelector('.maximize').addEventListener('mouseenter', () => SnapManager.openLayout(winId));
        winEl.querySelector('.maximize').addEventListener('mouseleave', () => SnapManager.scheduleClose());
        winEl.querySelector('.minimize').addEventListener('click', () => this.minimize(winId));
        winEl.addEventListener('mousedown', () => this.focus(winId));

        // Per-app window sizing for the built-in apps.
        const SIZES = { notepad: [640, 480], calc: [340, 540], taskmgr: [680, 500], settings: [740, 520] };
        if (SIZES[appData.id]) {
            winEl.style.width = SIZES[appData.id][0] + 'px';
            winEl.style.height = SIZES[appData.id][1] + 'px';
        }

        // Built-in apps bind their own controls + timers.
        if (appData.type === 'app') this.bindSystemApp(winEl, appData);

        // Dragging & Resizing bindings
        this.bindDrag(winEl);
        this.bindResize(winEl);

        this.container.appendChild(winEl);
        STATE.windows.set(appData.id, winEl);
        
        this.focus(winId);
        TaskbarManager.addApp(appData, winId);
    },

    close(winId, appId) {
        const winEl = el(winId);
        if(!winEl) return;
        if (winEl._cleanup) {
            try { winEl._cleanup(); } catch (e) {}
        }
        winEl.classList.add('closing');
        setTimeout(() => {
            winEl.remove();
            STATE.windows.delete(appId);
            TaskbarManager.removeApp(winId);
        }, 150);
    },

    findAppId(winId) {
        for (const [id, winEl] of STATE.windows) {
            if (winEl.id === winId) return id;
        }
        return null;
    },

    toggleMaximize(winId) {
        const winEl = el(winId);
        if(!winEl) return;
        // A snapped window restores to its floating rect instead of maximizing.
        if (SnapManager.isSnapped(winId)) {
            SnapManager.restore(winId);
            return;
        }
        const isMaximized = winEl.classList.toggle('maximized');
        winEl.style.borderRadius = isMaximized ? '0' : '';
        SnapManager.updateMaximizeIcon(winEl, isMaximized);
    },

    minimize(winId) {
        const winEl = el(winId);
        if(!winEl) return;
        winEl.style.opacity = '0';
        // The windowOpen animation's `forwards` fill keeps computed opacity at 1
        // and overrides this inline value, so opacity alone leaves a visible but
        // pointer-dead window stuck on screen. visibility:hidden is what really
        // removes the window from the desktop while it is minimized.
        winEl.style.visibility = 'hidden';
        winEl.style.pointerEvents = 'none';
        STATE.activeWindowId = null;
        TaskbarManager.setAppActive(winId, false);
    },

    restore(winId) {
        const winEl = el(winId);
        if(!winEl) return;
        winEl.style.opacity = '1';
        winEl.style.visibility = 'visible';
        winEl.style.pointerEvents = 'all';
        this.focus(winId);
    },

    focus(winId) {
        const winEl = el(winId);
        if(!winEl) return;
        
        STATE.zIndexCount++;
        winEl.style.zIndex = STATE.zIndexCount;
        STATE.activeWindowId = winId;
        TaskbarManager.setAppActive(winId, true);
        
        document.querySelectorAll('.window').forEach(w => w.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)');
        winEl.style.boxShadow = 'var(--window-shadow)';
    },

    bindDrag(winEl) {
        const titleBar = winEl.querySelector('.title-bar');

        titleBar.addEventListener('dblclick', (e) => {
            if(e.target.closest('.ctrl-btn')) return;
            if (SnapManager.isSnapped(winEl.id)) SnapManager.restore(winEl.id);
            else this.toggleMaximize(winEl.id);
        });
        
        titleBar.addEventListener('mousedown', (e) => {
            if(e.target.closest('.ctrl-btn')) return;
            if(winEl.classList.contains('maximized')) return;

            // Dragging a snapped window returns it to a floating state that
            // follows the cursor (Windows 11 behaviour).
            if (SnapManager.isSnapped(winEl.id)) {
                const prev = SnapManager.restore(winEl.id);
                const grabDX = e.clientX - prev.left;
                const grabDY = e.clientY - prev.top;
                winEl.style.left = `${e.clientX - grabDX}px`;
                winEl.style.top = `${Math.max(0, e.clientY - grabDY)}px`;
            }

            let startX = e.clientX;
            let startY = e.clientY;
            let initialX = winEl.offsetLeft;
            let initialY = winEl.offsetTop;
            let lastX = startX;
            let lastY = startY;

            const onMouseMove = (moveEvent) => {
                lastX = moveEvent.clientX;
                lastY = moveEvent.clientY;
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                winEl.style.left = `${initialX + dx}px`;
                winEl.style.top = `${Math.max(0, initialY + dy)}px`;

                const zone = SnapManager.detectZone(moveEvent.clientX, moveEvent.clientY);
                if (zone) SnapManager.showPreview(zone);
                else SnapManager.hidePreview();
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                const zone = SnapManager.detectZone(lastX, lastY);
                if (zone) SnapManager.apply(winEl.id, zone);
                else SnapManager.hidePreview();
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },

    bindResize(winEl) {
        const handles = winEl.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                if(winEl.classList.contains('maximized')) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const dir = handle.className.split(' ')[1];
                let startX = e.clientX;
                let startY = e.clientY;
                let startW = winEl.offsetWidth;
                let startH = winEl.offsetHeight;
                let startL = winEl.offsetLeft;
                let startT = winEl.offsetTop;

                const minW = 300;
                const minH = 200;

                const onMouseMove = (me) => {
                    if (dir.includes('e')) {
                        winEl.style.width = `${Math.max(minW, startW + (me.clientX - startX))}px`;
                    }
                    if (dir.includes('s')) {
                        winEl.style.height = `${Math.max(minH, startH + (me.clientY - startY))}px`;
                    }
                    if (dir.includes('w')) {
                        const newW = startW - (me.clientX - startX);
                        if (newW > minW) {
                            winEl.style.width = `${newW}px`;
                            winEl.style.left = `${startL + (me.clientX - startX)}px`;
                        }
                    }
                    if (dir.includes('n')) {
                        const newH = startH - (me.clientY - startY);
                        if (newH > minH) {
                            winEl.style.height = `${newH}px`;
                            winEl.style.top = `${startT + (me.clientY - startY)}px`;
                        }
                    }
                };

                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        });
    },

    /** Shared portfolio content reused from the mobile build (apps.js). */
    portfolioData() {
        return (window.Android && Android.Apps && Android.Apps.data)
            ? Android.Apps.data
            : { profile: {}, certs: [], resume: {} };
    },

    renderExplorerFrame(appData, bodyHtml, path, backable) {
        const backArrow = backable
            ? '<button data-nav-back aria-label="Back" style="background:transparent;border:none;color:inherit;padding:4px;border-radius:4px;cursor:pointer;display:flex;align-items:center;"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15 2L1 8l14 6V2z"/></svg></button>'
            : '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15 2L1 8l14 6V2z" opacity="0.5"/></svg>';
        const currentPath = path || `C:\\Users\\Pinaki\\Desktop\\${esc(appData.title)}`;
        return `
            <div class="explorer-layout">
                <div class="explorer-toolbar">
                    ${backArrow}
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2l14 6-14 6V2z"/></svg>
                    <div class="explorer-path" style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 4px; flex-grow: 1; font-size: 13px;">
                        ${currentPath}
                    </div>
                </div>
                <div class="explorer-body">
                    <div class="explorer-nav">
                        <div class="nav-item">⭐ Quick access</div>
                        <div class="nav-item">💻 This PC</div>
                        <div class="nav-item">🌐 Network</div>
                    </div>
                    <div class="explorer-main">
                        ${bodyHtml}
                    </div>
                </div>
            </div>
        `;
    },

    renderCertGrid() {
        const certs = this.portfolioData().certs || [];
        if (!certs.length) {
            return '<div style="color: var(--text-secondary); font-size: 13px;">This folder is empty.</div>';
        }
        return certs.map((c, i) => `
            <div class="explorer-item" data-cert="${i}" role="button" tabindex="0" style="cursor:pointer">
                <div class="explorer-item-ico" style="--g:linear-gradient(135deg,${c.color1},${c.color2})">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
                </div>
                <div class="explorer-item-name">${esc(c.name)}</div>
                <div class="explorer-item-sub">${esc(c.org)}</div>
            </div>`).join('');
    },

    /** Shared cert launcher — reuses the exact viewer opened from the desktop / file system. */
    openCert(index) {
        const cert = (this.portfolioData().certs || [])[parseInt(index, 10)];
        if (cert && cert.pdf) {
            this.open({ id: 'cert-' + index, title: cert.name, type: 'pdf', icon: Icons.folder, pdf: cert.pdf });
        }
    },

    /** Virtual file system (This PC). Files reference the same shared app registry / data. */
    fsDirs: {
        root: {
            path: 'This PC',
            items() {
                const app = (id) => appById(id);
                return [
                    { kind: 'folder', nav: 'documents', title: 'Documents', icon: Icons.folder },
                    { kind: 'folder', nav: 'certificates', title: 'Certificates', icon: Icons.folder },
                    { kind: 'folder', nav: 'projects', title: 'Projects', icon: Icons.folder },
                    { kind: 'app', appId: 'network', title: 'Network', icon: Icons.network },
                    { kind: 'app', appId: 'recycle', title: 'Recycle Bin', icon: Icons.trash },
                    { kind: 'app', appId: 'github', title: 'GitHub', icon: Icons.network },
                    { kind: 'app', appId: 'notepad', title: 'Notepad', icon: app('notepad').icon },
                    { kind: 'app', appId: 'calc', title: 'Calculator', icon: app('calc').icon },
                    { kind: 'app', appId: 'taskmgr', title: 'Task Manager', icon: app('taskmgr').icon }
                ];
            }
        },
        documents: {
            path: 'This PC\\Documents',
            items() {
                return [{ kind: 'app', appId: 'resume', title: 'Resume.pdf', icon: Icons.pdf }];
            }
        },
        certificates: {
            path: 'This PC\\Certificates',
            items() {
                return (WindowManager.portfolioData().certs || []).map((c, i) => ({
                    kind: 'cert', index: i, title: c.name, sub: c.org, color1: c.color1, color2: c.color2
                }));
            }
        },
        projects: {
            path: 'This PC\\Projects',
            items() {
                return (WindowManager.portfolioData().projects || []).map(p => ({
                    kind: 'item', title: p.title, sub: p.views + ' views · ' + p.time, color1: p.c1, color2: p.c2
                }));
            }
        }
    },

    renderMyPc(appData) {
        return this.renderExplorerFrame(appData, this.renderFsItems(this.fsDirs.root.items()), 'This PC', true);
    },

    renderFsItems(items) {
        return items.map((item) => {
            if (item.kind === 'cert' || item.kind === 'item') {
                const dataAttr = item.kind === 'cert' ? ` data-cert="${item.index}"` : '';
                return `
                    <div class="explorer-item"${dataAttr} role="button" tabindex="0" style="cursor:${item.kind === 'cert' ? 'pointer' : 'default'}">
                        <div class="explorer-item-ico" style="--g:linear-gradient(135deg,${item.color1},${item.color2})">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
                        </div>
                        <div class="explorer-item-name">${esc(item.title)}</div>
                        <div class="explorer-item-sub">${esc(item.sub || '')}</div>
                    </div>`;
            }
            const dataAttr = item.kind === 'folder' ? ` data-nav-folder="${item.nav}"` : ` data-open-app="${item.appId}"`;
            return `
                <div class="explorer-item"${dataAttr} role="button" tabindex="0" style="cursor:pointer">
                    <img src="${item.icon}" alt="${esc(item.title)}" style="width:40px;height:40px;">
                    <div class="explorer-item-name">${esc(item.title)}</div>
                    ${item.sub ? `<div class="explorer-item-sub">${esc(item.sub)}</div>` : ''}
                </div>`;
        }).join('');
    },

    renderFsDir(winEl, dirId) {
        const dir = this.fsDirs[dirId];
        if (!dir) return;
        const main = winEl.querySelector('.explorer-main');
        const pathEl = winEl.querySelector('.explorer-path');
        const back = winEl.querySelector('[data-nav-back]');
        if (main) main.innerHTML = this.renderFsItems(dir.items());
        if (pathEl) pathEl.textContent = dir.path;
        if (back) back.style.visibility = (winEl._fsStack || []).length <= 1 ? 'hidden' : 'visible';
    },

    navigateFolder(winEl, dirId) {
        if (!winEl || !winEl._fsStack || !this.fsDirs[dirId]) return;
        winEl._fsStack.push(dirId);
        this.renderFsDir(winEl, dirId);
    },

    navigateBack(winEl) {
        if (!winEl || !winEl._fsStack || winEl._fsStack.length <= 1) return;
        winEl._fsStack.pop();
        this.renderFsDir(winEl, winEl._fsStack[winEl._fsStack.length - 1]);
    },

    renderGitHubBody() {
        const profile = this.portfolioData().profile || {};
        const rows = [
            { label: 'GitHub', value: profile.github },
            { label: 'LinkedIn', value: profile.linkedin },
            { label: 'Website', value: profile.website },
            { label: 'Email', value: profile.email },
            { label: 'Location', value: profile.location }
        ];
        return rows.map((r) => `
            <div class="explorer-item" style="width:auto;flex-direction:row;align-items:center;text-align:left;gap:12px;cursor:default;">
                <img src="${Icons.network}" alt="" style="width:28px;height:28px;">
                <div>
                    <div class="explorer-item-name">${esc(r.label)}</div>
                    <div class="explorer-item-sub">${esc(r.value || '')}</div>
                </div>
            </div>`).join('');
    },

    renderNetworkBody() {
        return `
            <div class="net-list">
                ${NETWORK_LINKS.map((link) => `
                    <div class="net-row" data-network-link="${link.id}" role="button" tabindex="0" aria-label="Open ${esc(link.label)}">
                        <div class="net-icon">${link.icon}</div>
                        <div class="net-info">
                            <div class="net-name">${esc(link.label)}</div>
                            <div class="net-account">${esc(link.account)}</div>
                        </div>
                        <div class="net-open">Open</div>
                    </div>`).join('')}
            </div>`;
    },

    renderRecycleView() {
        const items = STATE.recycledItems;
        const grid = items.length
            ? items.map(r => `
                <div class="explorer-item" data-restore="${esc(r.id)}" role="button" tabindex="0" title="Restore ${esc(r.title)}">
                    <div class="explorer-item-ico" style="background:transparent;">
                        <img src="${esc(r.icon)}" alt="" width="30" height="30">
                    </div>
                    <div class="explorer-item-name">${esc(r.title)}</div>
                    <div class="explorer-item-sub">Restore</div>
                </div>`).join('')
            : '<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">The Recycle Bin is empty.</div>';
        return `
            <div class="explorer-layout">
                <div class="explorer-toolbar">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2l14 6-14 6V2z" opacity="0.5"/></svg>
                    <div class="explorer-path" style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 4px; flex-grow: 1; font-size: 13px;">Recycle Bin</div>
                    <button type="button" data-empty-recycle class="props-dialog__ok" style="font-size:12px;padding:5px 12px;">Empty Recycle Bin</button>
                </div>
                <div class="explorer-body">
                    <div class="explorer-nav">
                        <div class="nav-item">⭐ Quick access</div>
                        <div class="nav-item">💻 This PC</div>
                        <div class="nav-item">🌐 Network</div>
                    </div>
                    <div class="explorer-main">
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:14px;padding:16px;align-content:start;flex:1;">
                            ${grid}
                        </div>
                    </div>
                </div>
            </div>`;
    },

    openNetworkLink(id) {
        const link = NETWORK_LINKS.find((l) => l.id === id);
        if (!link) return;
        if (id === 'email') {
            window.location.href = link.href;
        } else {
            window.open(link.href, '_blank', 'noopener');
        }
    },

    renderPdfContent(appData) {
        if (appData.pdf) {
            return `
            <div style="display:flex; flex-direction:column; height:100%;">
                <div class="pdf-toolbar">
                    <span>${esc(appData.title)}</span>
                    <button class="pdf-btn" data-pdf-download="${esc(appData.pdf)}">Download</button>
                </div>
                <div class="pdf-content" style="display:block; overflow:hidden;">
                    <iframe src="${esc(appData.pdf)}" title="${esc(appData.title)}" style="width:100%; height:100%; border:0; display:block; background:#fff;"></iframe>
                </div>
            </div>
            `;
        }
        const data = this.portfolioData();
        const profile = data.profile || {};
        const resume = data.resume || {};
        const expItems = (resume.experience || []).map((e) => `
            <li class="pdf-resume-item"><strong>${esc(e.role)}</strong><span>${esc(e.org)} · ${esc(e.years)}</span></li>`).join('');
        const eduItems = (resume.education || []).map((e) => `
            <li class="pdf-resume-item"><strong>${esc(e.degree)}</strong><span>${esc(e.org)} · ${esc(e.years)}</span></li>`).join('');
        return `
            <div style="display:flex; flex-direction:column; height:100%;">
                <div class="pdf-toolbar">
                    <span>${esc(appData.title)}</span>
                    <button class="pdf-btn">Download</button>
                </div>
                <div class="pdf-content">
                    <div class="pdf-paper">
                        <h2 class="pdf-name">${esc(profile.name || 'Resume')}</h2>
                        <p class="pdf-headline">${esc(profile.headline || '')}</p>
                        <div class="pdf-paper-section">
                            <h3>Summary</h3>
                            <p>${esc(resume.summary || '')}</p>
                        </div>
                        <div class="pdf-paper-section">
                            <h3>Experience</h3>
                            <ul>${expItems}</ul>
                        </div>
                        <div class="pdf-paper-section">
                            <h3>Education</h3>
                            <ul>${eduItems}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /* ---------------------------------------------------------- */
    /* T-007 Built-in apps: Notepad, Calculator, Task Manager     */
    /* ---------------------------------------------------------- */

    renderSystemApp(appData) {
        switch (appData.id) {
            case 'notepad': return this.renderNotepad(appData);
            case 'calc': return this.renderCalculator(appData);
            case 'taskmgr': return this.renderTaskManager(appData);
            case 'settings': return this.renderSettings(appData);
            default: return '<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">App not available.</div>';
        }
    },

    renderNotepad(appData) {
        return `
            <div class="app-notepad">
                <div class="ntp-menu">
                    <span class="ntp-menu-item" data-ntp="new">New</span>
                    <span class="ntp-menu-item" data-ntp="open">Open…</span>
                    <span class="ntp-menu-item" data-ntp="save">Save</span>
                    <span class="ntp-menu-item" data-ntp="wrap">Word wrap</span>
                </div>
                <textarea class="ntp-area" spellcheck="false" placeholder="Start typing…"></textarea>
                <div class="ntp-status"><span data-ntp-stats>Lines 1 · 0 characters</span></div>
            </div>`;
    },

    renderCalculator(appData) {
        const btn = (key, label, cls) => `<button type="button" class="calc-btn ${cls || ''}" data-calc="${key}">${label}</button>`;
        return `
            <div class="app-calc">
                <div class="calc-display" data-calc-display>0</div>
                <div class="calc-grid">
                    <div class="calc-row calc-row-mem">
                        ${btn('mc', 'MC', 'mem')}${btn('mr', 'MR', 'mem')}${btn('mplus', 'M+', 'mem')}${btn('mminus', 'M-', 'mem')}
                    </div>
                    <div class="calc-row">
                        ${btn('percent', '%')}${btn('ce', 'CE')}${btn('c', 'C')}${btn('back', '⌫')}
                    </div>
                    <div class="calc-row">
                        ${btn('recip', '1/x')}${btn('square', 'x²')}${btn('sqrt', '√')}${btn('divide', '÷', 'op')}
                    </div>
                    <div class="calc-row">
                        ${btn('7', '7')}${btn('8', '8')}${btn('9', '9')}${btn('multiply', '×', 'op')}
                    </div>
                    <div class="calc-row">
                        ${btn('4', '4')}${btn('5', '5')}${btn('6', '6')}${btn('subtract', '−', 'op')}
                    </div>
                    <div class="calc-row">
                        ${btn('1', '1')}${btn('2', '2')}${btn('3', '3')}${btn('add', '+', 'op')}
                    </div>
                    <div class="calc-row">
                        ${btn('negate', '±')}${btn('0', '0')}${btn('decimal', '.')}${btn('equals', '=', 'eq')}
                    </div>
                </div>
            </div>`;
    },

    renderTaskManager(appData) {
        return `
            <div class="app-taskmgr">
                <div class="tm-tabs">
                    <button type="button" class="tm-tab is-active" data-tm-tab="processes">Processes</button>
                    <button type="button" class="tm-tab" data-tm-tab="performance">Performance</button>
                </div>
                <div class="tm-pane" data-tm-pane="processes">
                    <div class="tm-table">
                        <div class="tm-head"><span>Name</span><span>Status</span><span>CPU</span><span>Memory</span></div>
                        <div class="tm-rows" data-tm-rows></div>
                    </div>
                    <div class="tm-footer">
                        <span data-tm-count></span>
                        <button type="button" class="tm-endtask" data-tm-endtask disabled>End task</button>
                    </div>
                </div>
                <div class="tm-pane" data-tm-pane="performance" hidden>
                    <div class="tm-perf">
                        <div class="tm-card">
                            <div class="tm-card-title">CPU</div>
                            <div class="tm-card-num" data-tm-cpu-num>0%</div>
                            <svg class="tm-spark" data-tm-cpu-spark viewBox="0 0 200 56" preserveAspectRatio="none"></svg>
                        </div>
                        <div class="tm-card">
                            <div class="tm-card-title">Memory</div>
                            <div class="tm-card-num" data-tm-mem-num>0%</div>
                            <svg class="tm-spark" data-tm-mem-spark viewBox="0 0 200 56" preserveAspectRatio="none"></svg>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    /** Live process list for Task Manager (open windows + simulated system processes). */
    tmSystemProcesses() {
        const gear = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='7' fill='none' stroke='%23999999' stroke-width='2'/><circle cx='12' cy='12' r='2.5' fill='%23999999'/></svg>";
        const folder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M4 5h7l2 2h7v12H4z' fill='%23FFD24A' stroke='%23B8860B' stroke-width='1'/></svg>";
        const shield = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z' fill='%2340C980'/></svg>";
        return [
            { name: 'System', icon: gear, cpu: 3, mem: 1 },
            { name: 'Explorer Shell', icon: folder, cpu: 2, mem: 4 },
            { name: 'Antimalware Service', icon: shield, cpu: 1, mem: 3 }
        ];
    },

    bindSystemApp(winEl, appData) {
        if (appData.id === 'notepad') this.bindNotepad(winEl);
        else if (appData.id === 'calc') this.bindCalculator(winEl);
        else if (appData.id === 'taskmgr') this.bindTaskManager(winEl);
        else if (appData.id === 'settings') this.bindSettings(winEl);
    },

    /* --- Settings app (T-008) --- */

    SET_PAGES: ['system', 'personalization', 'network', 'bluetooth', 'apps', 'time', 'about'],
    SET_NAV: {
        system: 'System',
        personalization: 'Personalization',
        network: 'Network & internet',
        bluetooth: 'Bluetooth & devices',
        apps: 'Apps',
        time: 'Time & language',
        about: 'About'
    },

    renderSettings(appData) {
        const nav = this.SET_PAGES.map((p, i) => `
            <button type="button" class="set-nav-item${i === 0 ? ' is-active' : ''}" data-set-page="${p}">
                ${esc(this.SET_NAV[p])}
            </button>`).join('');
        return `
            <div class="app-settings">
                <div class="set-layout">
                    <nav class="set-nav" aria-label="Settings categories">${nav}</nav>
                    <main class="set-body" data-set-body>
                        ${this.renderSetPage('system')}
                    </main>
                </div>
            </div>`;
    },

    renderSetPage(page) {
        const switchRow = (label, key, sub) => `
            <div class="set-row">
                <div class="set-row-text">
                    <div class="set-row-label">${esc(label)}</div>
                    ${sub ? `<div class="set-row-sub">${esc(sub)}</div>` : ''}
                </div>
                <button type="button" class="set-switch" data-set-toggle="${key}" role="switch" aria-checked="false"></button>
            </div>`;
        const sliderRow = (label, key, unit) => `
            <div class="set-row">
                <div class="set-row-text">
                    <div class="set-row-label">${esc(label)}</div>
                </div>
                <div class="set-slider-wrap">
                    <input type="range" min="0" max="100" data-set-slider="${key}" aria-label="${esc(label)}">
                    <span data-set-slider-val="${key}"></span>
                </div>
            </div>`;

        if (page === 'system') {
            return `
                <div class="set-section">
                    <div class="set-section-title">Display</div>
                    ${sliderRow('Brightness', 'brightness', '%')}
                    ${switchRow('Night light', 'nightLight', 'Warmer colors at night')}
                    ${switchRow('Battery saver', 'batterySaver', 'Extend battery life')}
                </div>
                <div class="set-section">
                    <div class="set-section-title">Sound</div>
                    ${sliderRow('Volume', 'volume', '')}
                </div>
                <div class="set-section">
                    <div class="set-section-title">Notifications</div>
                    ${switchRow('Focus assist', 'focus', 'Silence notifications while working')}
                </div>`;
        }
        if (page === 'personalization') {
            const wallpapers = WallpaperManager.wallpapers.map((src, i) => `
                <button type="button" class="set-wall" data-wallpaper="${i}" aria-label="Wallpaper ${i + 1}" style="background-image:url('${src}')"></button>`).join('');
            const accents = ['#60CDFF', '#0078D4', '#00B294', '#8764B8', '#E3008C', '#CA5010', '#107C10', '#F7630C'];
            const accentBtns = accents.map(c => `
                <button type="button" class="set-accent" data-accent="${c}" aria-label="Accent ${c}" style="background:${c}"></button>`).join('');
            return `
                <div class="set-section">
                    <div class="set-section-title">Background</div>
                    <div class="set-walls">${wallpapers}</div>
                </div>
                <div class="set-section">
                    <div class="set-section-title">Accent color</div>
                    <div class="set-accents">${accentBtns}</div>
                </div>
                <div class="set-section">
                    <div class="set-section-title">Theme</div>
                    ${switchRow('Dark mode', 'darkMode', 'Use a dark theme for windows and apps')}
                </div>`;
        }
        if (page === 'network') {
            return `
                <div class="set-section">
                    <div class="set-section-title">Network & internet</div>
                    ${switchRow('Wi-Fi', 'wifi', 'Pinaki’s PC · Connected')}
                    ${switchRow('Airplane mode', 'airplane', 'Turn off all wireless connections')}
                </div>`;
        }
        if (page === 'bluetooth') {
            return `
                <div class="set-section">
                    <div class="set-section-title">Bluetooth & devices</div>
                    ${switchRow('Bluetooth', 'bluetooth', 'Pair keyboards, mice and headsets')}
                </div>`;
        }
        if (page === 'apps') {
            const apps = STATE.desktopIcons.filter(a => !a.deleted && a.type === 'app');
            const cards = apps.map(a => `
                <div class="set-app-card" data-open-app="${a.id}" role="button" tabindex="0">
                    <img src="${a.icon}" alt="" width="28" height="28">
                    <span class="set-app-name">${esc(a.title)}</span>
                </div>`).join('');
            return `
                <div class="set-section">
                    <div class="set-section-title">Installed apps</div>
                    <div class="set-apps">${cards || '<div class="set-row-sub">No apps installed.</div>'}</div>
                </div>`;
        }
        if (page === 'time') {
            return `
                <div class="set-section">
                    <div class="set-section-title">Time & language</div>
                    <div class="set-row">
                        <div class="set-row-text">
                            <div class="set-row-label" data-set-clock></div>
                            <div class="set-row-sub" data-set-date></div>
                        </div>
                    </div>
                    <div class="set-row">
                        <div class="set-row-text">
                            <div class="set-row-label">Time zone</div>
                            <div class="set-row-sub">(UTC+05:30) India Standard Time · Automatic</div>
                        </div>
                    </div>
                </div>`;
        }
        // about
        return `
            <div class="set-section">
                <div class="set-section-title">About</div>
                <div class="set-about-card">
                    <div class="set-about-name">Pinaki-PC</div>
                    <div class="set-row-sub">Windows 11 Pro · Simulation build</div>
                </div>
                <div class="set-row">
                    <div class="set-row-text">
                        <div class="set-row-label">Device specifications</div>
                        <div class="set-row-sub">Processor: Intel Core i7 · 8 cores</div>
                        <div class="set-row-sub">Installed RAM: 16.0 GB</div>
                        <div class="set-row-sub">System type: 64-bit operating system</div>
                    </div>
                </div>
                <button type="button" class="set-button" data-set-update>Check for updates</button>
            </div>`;
    },

    bindSettings(winEl) {
        const body = winEl.querySelector('[data-set-body]');
        if (!body) return;

        const qs = QuickSettingsManager;
        const syncToggles = () => {
            body.querySelectorAll('[data-set-toggle]').forEach(btn => {
                const on = !!qs.state[btn.dataset.setToggle];
                btn.classList.toggle('is-on', on);
                btn.setAttribute('aria-checked', String(on));
            });
        };
        const syncSliders = () => {
            body.querySelectorAll('[data-set-slider]').forEach(input => {
                input.value = qs.state[input.dataset.setSlider];
                const val = body.querySelector(`[data-set-slider-val="${input.dataset.setSlider}"]`);
                if (val) val.textContent = input.dataset.setSlider === 'brightness' ? input.value + '%' : input.value;
            });
        };
        const renderPage = (page) => {
            body.innerHTML = WindowManager.renderSetPage(page);
            syncToggles();
            syncSliders();
        };

        const clockTimer = setInterval(() => {
            const clock = body.querySelector('[data-set-clock]');
            if (!clock) return;
            const now = new Date();
            clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
            const dateEl = body.querySelector('[data-set-date]');
            if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }, 1000);
        winEl._cleanup = () => clearInterval(clockTimer);

        winEl.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('[data-set-page]');
            if (pageBtn) {
                winEl.querySelectorAll('.set-nav-item').forEach(n => n.classList.toggle('is-active', n === pageBtn));
                renderPage(pageBtn.dataset.setPage);
                return;
            }
            const toggle = e.target.closest('[data-set-toggle]');
            if (toggle) {
                qs.toggleAction(toggle.dataset.setToggle);
                syncToggles();
                return;
            }
            const wallpaper = e.target.closest('[data-wallpaper]');
            if (wallpaper) {
                WallpaperManager.set(parseInt(wallpaper.dataset.wallpaper, 10));
                return;
            }
            const accent = e.target.closest('[data-accent]');
            if (accent) {
                document.documentElement.style.setProperty('--accent', accent.dataset.accent);
                try { localStorage.setItem('win11_accent', accent.dataset.accent); } catch (err) {}
                return;
            }
            if (e.target.closest('[data-set-update]')) {
                DesktopToast.show('You’re up to date');
            }
        });

        winEl.addEventListener('input', (e) => {
            const slider = e.target.closest('[data-set-slider]');
            if (!slider) return;
            const key = slider.dataset.setSlider;
            const value = parseInt(slider.value, 10);
            if (key === 'brightness') qs.state.brightness = Math.max(30, Math.min(100, value));
            else qs.state.volume = Math.max(0, Math.min(100, value));
            qs.applyEffects();
            qs.save();
            syncSliders();
        });
    },

    bindNotepad(winEl) {
        const area = winEl.querySelector('.ntp-area');
        if (!area) return;
        const statsEl = winEl.querySelector('[data-ntp-stats]');

        const updateStats = () => {
            const lines = area.value.split('\n').length;
            statsEl.textContent = `Lines ${lines} · ${area.value.length} characters`;
        };
        area.addEventListener('input', updateStats);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,text/plain';
        fileInput.style.display = 'none';
        winEl.appendChild(fileInput);

        winEl.querySelector('.ntp-menu').addEventListener('click', (e) => {
            const item = e.target.closest('[data-ntp]');
            if (!item) return;
            const action = item.dataset.ntp;
            if (action === 'wrap') {
                area.classList.toggle('is-wrap');
                item.classList.toggle('is-on');
            } else if (action === 'new') {
                if (area.value && !confirm('Start a new document? Any unsaved text will be lost.')) return;
                area.value = '';
                updateStats();
                area.focus();
            } else if (action === 'open') {
                fileInput.click();
            } else if (action === 'save') {
                const blob = new Blob([area.value], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'note.txt';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        });

        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                area.value = String(reader.result || '');
                updateStats();
            };
            reader.readAsText(file);
        });
    },

    bindCalculator(winEl) {
        const display = winEl.querySelector('[data-calc-display]');
        if (!display) return;

        const state = { cur: '0', prev: null, op: null, waiting: false, mem: 0 };
        const fmt = (n) => {
            if (!isFinite(n)) return 'Error';
            let s = String(Math.round(n * 1e12) / 1e12);
            if (s.length > 14) s = n.toExponential(6);
            return s;
        };
        const render = () => { display.textContent = state.cur; };
        const inputDigit = (d) => {
            if (state.waiting) { state.cur = d; state.waiting = false; }
            else state.cur = state.cur === '0' ? d : state.cur + d;
        };
        const inputDecimal = () => {
            if (state.waiting) { state.cur = '0.'; state.waiting = false; return; }
            if (state.cur.indexOf('.') === -1) state.cur += '.';
        };
        const setOp = (op) => {
            const value = parseFloat(state.cur);
            if (state.op != null && !state.waiting) {
                state.prev = compute();
                state.cur = fmt(state.prev);
            } else if (state.op == null) {
                state.prev = value;
            }
            state.op = op;
            state.waiting = true;
        };
        const compute = () => {
            const a = state.prev == null ? parseFloat(state.cur) : state.prev;
            const b = parseFloat(state.cur);
            switch (state.op) {
                case 'add': return a + b;
                case 'subtract': return a - b;
                case 'multiply': return a * b;
                case 'divide': return b === 0 ? Infinity : a / b;
                default: return b;
            }
        };
        const equals = () => {
            if (state.op == null) return;
            state.cur = fmt(compute());
            state.op = null;
            state.prev = null;
            state.waiting = true;
        };
        const unary = (fn) => {
            const v = parseFloat(state.cur);
            state.cur = fmt(fn(v));
            state.waiting = true;
        };

        winEl.querySelector('.calc-grid').addEventListener('click', (e) => {
            const b = e.target.closest('[data-calc]');
            if (!b) return;
            const k = b.dataset.calc;
            if (/^\d$/.test(k)) { inputDigit(k); }
            else if (k === 'decimal') { inputDecimal(); }
            else if (k === 'add' || k === 'subtract' || k === 'multiply' || k === 'divide') { setOp(k); }
            else if (k === 'equals') { equals(); }
            else if (k === 'c') { state.cur = '0'; state.prev = null; state.op = null; state.waiting = false; }
            else if (k === 'ce') { state.cur = '0'; state.waiting = false; }
            else if (k === 'back') { state.cur = state.cur.length > 1 ? state.cur.slice(0, -1) : '0'; }
            else if (k === 'negate') { state.cur = state.cur.charAt(0) === '-' ? state.cur.slice(1) : '-' + state.cur; }
            else if (k === 'percent') { unary((v) => v / 100); }
            else if (k === 'square') { unary((v) => v * v); }
            else if (k === 'sqrt') { unary((v) => Math.sqrt(v)); }
            else if (k === 'recip') { unary((v) => 1 / v); }
            else if (k === 'mc') { state.mem = 0; }
            else if (k === 'mr') { state.cur = fmt(state.mem); state.waiting = false; }
            else if (k === 'mplus') { state.mem += parseFloat(state.cur); }
            else if (k === 'mminus') { state.mem -= parseFloat(state.cur); }
            render();
        });
    },

    bindTaskManager(winEl) {
        const rowsEl = winEl.querySelector('[data-tm-rows]');
        const countEl = winEl.querySelector('[data-tm-count]');
        const endBtn = winEl.querySelector('[data-tm-endtask]');
        const cpuNum = winEl.querySelector('[data-tm-cpu-num]');
        const memNum = winEl.querySelector('[data-tm-mem-num]');
        const cpuSpark = winEl.querySelector('[data-tm-cpu-spark]');
        const memSpark = winEl.querySelector('[data-tm-mem-spark]');
        if (!rowsEl) return;

        let selectedAppId = null;
        const cpuSeries = Array(200).fill(0);
        const memSeries = Array(200).fill(0);
        let cpuValue = 12, memValue = 34;

        const renderSpark = (svg, series) => {
            const max = Math.max.apply(null, series) || 1;
            const pts = series.map((v, i) => `${(i / (series.length - 1)) * 200},${56 - (v / max) * 48}`).join(' ');
            svg.setAttribute('viewBox', '0 0 200 56');
            svg.innerHTML = `<polyline points="${pts}" fill="none" stroke="#60CDFF" stroke-width="1.5"/>`;
        };

        const renderRows = () => {
            const openApps = [];
            STATE.windows.forEach((w, appId) => {
                const app = appById(appId);
                openApps.push({
                    name: app ? app.title : appId,
                    icon: app ? app.icon : null,
                    appId: appId,
                    cpu: (5 + Math.random() * 25).toFixed(1),
                    mem: (2 + Math.random() * 18).toFixed(1)
                });
            });
            const system = WindowManager.tmSystemProcesses().map(p => ({
                name: p.name, icon: p.icon, appId: null, cpu: p.cpu, mem: p.mem
            }));
            const all = system.concat(openApps);
            rowsEl.innerHTML = all.map(r => {
                const iconHtml = r.icon
                    ? `<img src="${r.icon}" alt="" width="18" height="18">`
                    : '';
                return `
                    <div class="tm-row" data-tm-app="${r.appId || ''}" role="button" tabindex="0">
                        <span class="tm-name">${iconHtml}${esc(r.name)}</span>
                        <span class="tm-status">Running</span>
                        <span class="tm-cpu">${r.cpu}%</span>
                        <span class="tm-mem">${r.mem} MB</span>
                    </div>`;
            }).join('');
            countEl.textContent = `${all.length} processes`;
        };

        rowsEl.addEventListener('click', (e) => {
            const row = e.target.closest('[data-tm-app]');
            if (!row) return;
            rowsEl.querySelectorAll('.tm-row.is-selected').forEach(r => r.classList.remove('is-selected'));
            row.classList.add('is-selected');
            selectedAppId = row.dataset.tmApp || null;
            endBtn.disabled = !selectedAppId;
        });

        endBtn.addEventListener('click', () => {
            if (!selectedAppId) return;
            const winElById = STATE.windows.get(selectedAppId);
            if (winElById) WindowManager.close(winElById.id, selectedAppId);
            selectedAppId = null;
            endBtn.disabled = true;
            renderRows();
        });

        winEl.querySelector('.tm-tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('[data-tm-tab]');
            if (!tab) return;
            const target = tab.dataset.tmTab;
            winEl.querySelectorAll('.tm-tab').forEach(t => t.classList.toggle('is-active', t === tab));
            winEl.querySelectorAll('[data-tm-pane]').forEach(p => {
                p.hidden = p.dataset.tmPane !== target;
            });
        });

        const tick = () => {
            cpuValue = Math.max(1, Math.min(99, cpuValue + (Math.random() * 14 - 7)));
            memValue = Math.max(4, Math.min(96, memValue + (Math.random() * 6 - 3)));
            cpuSeries.push(cpuValue); cpuSeries.shift();
            memSeries.push(memValue); memSeries.shift();
            cpuNum.textContent = Math.round(cpuValue) + '%';
            memNum.textContent = Math.round(memValue) + '%';
            renderSpark(cpuSpark, cpuSeries);
            renderSpark(memSpark, memSeries);
            if (STATE.windows.has('taskmgr')) renderRows();
        };
        renderRows();
        tick();
        const interval = setInterval(tick, 1200);
        winEl._cleanup = () => clearInterval(interval);
    }
};

// --- Snap Layouts ---
const SnapManager = {
    previewEl: null,
    popupEl: null,
    activeWinId: null,
    closeTimer: null,
    SNAP_EDGE: 28,
    // Drag-triggered zones (mouse accessible; Win+Arrow is OS-reserved in browsers)
    ZONES: ['tl', 'tr', 'bl', 'br', 'left', 'right', 'top'],

    taskbarHeight() {
        const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height'), 10);
        return isNaN(v) ? 48 : v;
    },

    area() {
        return {
            w: window.innerWidth,
            h: window.innerHeight - this.taskbarHeight()
        };
    },

    /** Computes the bounding rect for a snap zone. */
    rectFor(zone) {
        const { w, h } = this.area();
        switch (zone) {
            case 'left': return { left: 0, top: 0, width: Math.round(w / 2), height: h };
            case 'right': return { left: Math.round(w / 2), top: 0, width: Math.round(w / 2), height: h };
            case 'top': return { left: 0, top: 0, width: w, height: h };
            case 'tl': return { left: 0, top: 0, width: Math.round(w / 2), height: Math.round(h / 2) };
            case 'tr': return { left: Math.round(w / 2), top: 0, width: Math.round(w / 2), height: Math.round(h / 2) };
            case 'bl': return { left: 0, top: Math.round(h / 2), width: Math.round(w / 2), height: Math.round(h / 2) };
            case 'br': return { left: Math.round(w / 2), top: Math.round(h / 2), width: Math.round(w / 2), height: Math.round(h / 2) };
            case 'third-l': return { left: 0, top: 0, width: Math.round(w / 3), height: h };
            case 'third-c': return { left: Math.round(w / 3), top: 0, width: Math.round(w / 3), height: h };
            case 'third-r': return { left: Math.round(w * 2 / 3), top: 0, width: Math.round(w / 3), height: h };
            default: return null;
        }
    },

    isSnapped(winId) {
        const winEl = el(winId);
        return !!(winEl && winEl._snapZone);
    },

    /** Snaps the window into the given zone, remembering its previous rect. */
    apply(winId, zone) {
        const winEl = el(winId);
        const rect = this.rectFor(zone);
        if (!winEl || !rect) return;
        this.hidePreview();
        if (!winEl._snapPrev) {
            winEl._snapPrev = {
                left: winEl.offsetLeft,
                top: winEl.offsetTop,
                width: winEl.offsetWidth,
                height: winEl.offsetHeight
            };
        }
        winEl.classList.remove('maximized');
        winEl.style.left = `${rect.left}px`;
        winEl.style.top = `${rect.top}px`;
        winEl.style.width = `${rect.width}px`;
        winEl.style.height = `${rect.height}px`;
        winEl.style.borderRadius = '0';
        winEl._snapZone = zone;
        WindowManager.focus(winId);
        this.updateMaximizeIcon(winEl, true);
    },

    /** Restores a snapped window to its previous floating rect. Returns that rect. */
    restore(winId) {
        const winEl = el(winId);
        if (!winEl) return null;
        const prev = winEl._snapPrev;
        if (prev) {
            winEl.style.left = `${prev.left}px`;
            winEl.style.top = `${prev.top}px`;
            winEl.style.width = `${prev.width}px`;
            winEl.style.height = `${prev.height}px`;
        }
        winEl.style.borderRadius = '';
        winEl._snapZone = null;
        winEl._snapPrev = null;
        this.updateMaximizeIcon(winEl, false);
        return prev || { left: winEl.offsetLeft, top: winEl.offsetTop, width: winEl.offsetWidth, height: winEl.offsetHeight };
    },

    updateMaximizeIcon(winEl, restoreState) {
        const btn = winEl.querySelector('.maximize');
        if (!btn) return;
        btn.innerHTML = restoreState
            ? '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1.5 3.5h5v5h-5z M3.5 1.5h5v5h-5z" fill="none" stroke="currentColor" stroke-width="1"/></svg>'
            : '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" stroke="currentColor" stroke-width="1" fill="none"/></svg>';
        btn.setAttribute('aria-label', restoreState ? 'Restore' : 'Maximize');
    },

    /** Detects a drag snap zone from the pointer position. */
    detectZone(x, y) {
        const e = this.SNAP_EDGE;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const nearL = x <= e;
        const nearR = x >= w - e;
        const nearT = y <= e;
        const nearB = y >= h - e;
        if (nearL && nearT) return 'tl';
        if (nearR && nearT) return 'tr';
        if (nearL && nearB) return 'bl';
        if (nearR && nearB) return 'br';
        if (nearL) return 'left';
        if (nearR) return 'right';
        if (nearT) return 'top';
        return null;
    },

    showPreview(zone) {
        if (!this.previewEl) {
            this.previewEl = document.createElement('div');
            this.previewEl.id = 'snap-preview';
            document.body.appendChild(this.previewEl);
        }
        const rect = this.rectFor(zone);
        if (!rect) return;
        this.previewEl.style.left = `${rect.left}px`;
        this.previewEl.style.top = `${rect.top}px`;
        this.previewEl.style.width = `${rect.width}px`;
        this.previewEl.style.height = `${rect.height}px`;
        this.previewEl.classList.add('is-visible');
    },

    hidePreview() {
        if (this.previewEl) this.previewEl.classList.remove('is-visible');
    },

    /** Hover popup on the maximize button. */
    openLayout(winId) {
        const winEl = el(winId);
        if (!winEl) return;
        clearTimeout(this.closeTimer);
        this.activeWinId = winId;
        if (!this.popupEl) {
            this.popupEl = document.createElement('div');
            this.popupEl.id = 'snap-layout';
            this.popupEl.setAttribute('role', 'dialog');
            this.popupEl.setAttribute('aria-label', 'Snap layouts');
            this.popupEl.innerHTML = `
                <div class="snap-grid">
                    <div class="snap-col">
                        <div class="snap-zone" data-zone="third-l" role="button" tabindex="0" aria-label="Snap left third"></div>
                        <div class="snap-zone" data-zone="left" role="button" tabindex="0" aria-label="Snap left half"></div>
                    </div>
                    <div class="snap-col">
                        <div class="snap-zone" data-zone="third-c" role="button" tabindex="0" aria-label="Snap center third"></div>
                    </div>
                    <div class="snap-col">
                        <div class="snap-zone" data-zone="third-r" role="button" tabindex="0" aria-label="Snap right third"></div>
                        <div class="snap-zone" data-zone="right" role="button" tabindex="0" aria-label="Snap right half"></div>
                    </div>
                </div>
                <div class="snap-layout-actions">
                    <button type="button" data-snap-action="max">Maximize</button>
                    <button type="button" data-snap-action="restore">Restore</button>
                </div>`;
            this.popupEl.addEventListener('click', (e) => {
                const zone = e.target.closest('[data-zone]');
                if (zone) {
                    this.apply(this.activeWinId, zone.dataset.zone);
                    this.closeLayout();
                    return;
                }
                const act = e.target.closest('[data-snap-action]');
                if (act) {
                    const win = el(this.activeWinId);
                    if (win) {
                        if (act.dataset.snapAction === 'max') {
                            if (this.isSnapped(this.activeWinId)) this.restore(this.activeWinId);
                            if (!win.classList.contains('maximized')) WindowManager.toggleMaximize(this.activeWinId);
                        } else {
                            if (win.classList.contains('maximized')) WindowManager.toggleMaximize(this.activeWinId);
                            this.restore(this.activeWinId);
                        }
                    }
                    this.closeLayout();
                }
            });
            this.popupEl.addEventListener('mouseleave', () => this.scheduleClose());
            document.addEventListener('mousedown', (e) => {
                if (this.popupEl && !this.popupEl.contains(e.target)) this.closeLayout();
            });
        }
        const rect = winEl.getBoundingClientRect();
        const pw = 220;
        let left = rect.right - pw - 6;
        if (left < 6) left = 6;
        if (left + pw > window.innerWidth - 6) left = window.innerWidth - pw - 6;
        this.popupEl.style.left = `${left}px`;
        this.popupEl.style.top = `${Math.max(4, rect.top + 4)}px`;
        this.popupEl.classList.remove('hidden');
    },

    closeLayout() {
        clearTimeout(this.closeTimer);
        this.activeWinId = null;
        if (this.popupEl) this.popupEl.classList.add('hidden');
    },

    scheduleClose() {
        clearTimeout(this.closeTimer);
        this.closeTimer = setTimeout(() => {
            const win = this.activeWinId ? el(this.activeWinId) : null;
            const btn = win ? win.querySelector('.maximize') : null;
            if (!btn || !btn.matches(':hover')) this.closeLayout();
        }, 220);
    }
};

// --- Taskbar Manager ---
const TaskbarManager = {
    container: null,
    apps: new Map(), // winId -> button element

    init() {
        this.container = el('taskbar-apps');
        
        el('start-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            StartMenuManager.toggle();
        });

        // Taskbar search reuses the Start Menu search panel & engine.
        el('search-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (StartMenuManager.isOpen) {
                StartMenuManager.hide();
            } else {
                StartMenuManager.show();
                const input = StartMenuManager.menuEl.querySelector('.start-search input');
                if (input) input.focus();
            }
        });

        el('widgets-btn').addEventListener('click', () => {
            WidgetsManager.toggle();
        });

        el('show-desktop').addEventListener('click', () => {
            STATE.windows.forEach((winEl, appId) => {
                WindowManager.minimize(winEl.id);
            });
        });
    },

    addApp(appData, winId) {
        const btn = document.createElement('button');
        btn.className = 'taskbar-btn active focused';
        btn.innerHTML = `<img src="${appData.icon}" alt="${appData.title}">`;
        
        btn.addEventListener('click', () => {
            const winEl = el(winId);
            if (STATE.activeWindowId === winId && winEl.style.opacity !== '0') {
                WindowManager.minimize(winId);
            } else {
                WindowManager.restore(winId);
            }
        });

        this.container.appendChild(btn);
        this.apps.set(winId, btn);
    },

    removeApp(winId) {
        if(this.apps.has(winId)) {
            this.apps.get(winId).remove();
            this.apps.delete(winId);
            if(STATE.activeWindowId === winId) STATE.activeWindowId = null;
        }
    },

    setAppActive(winId, isActive) {
        this.apps.forEach((btn, id) => {
            if(id === winId) {
                if(isActive) btn.classList.add('focused');
                else btn.classList.remove('focused');
            } else {
                btn.classList.remove('focused');
            }
        });
    }
};

// --- Start Menu ---
const StartMenuManager = {
    menuEl: null,
    isOpen: false,

    init() {
        this.menuEl = el('start-menu');
        
        // Populate pinned apps from the shared app registry (same apps as the desktop).
        const pinnedContainer = this.menuEl.querySelector('.pinned-apps');
        const pinnedList = [
            { appId: 'this-pc', name: 'This PC' },
            { appId: 'notepad', name: 'Notepad' },
            { appId: 'calc', name: 'Calculator' },
            { appId: 'taskmgr', name: 'Task Manager' },
            { appId: 'settings', name: 'Settings' },
            { appId: 'github', name: 'GitHub' },
            { appId: 'projects', name: 'Projects' },
            { appId: 'resume', name: 'Resume' },
            { appId: 'recycle', name: 'Recycle Bin' },
            { appId: 'cert', name: 'Certificates' }
        ];
        pinnedList.forEach(item => {
            const app = appById(item.appId);
            if (!app) return;
            pinnedContainer.innerHTML += `
                <div class="pinned-app" data-open-app="${item.appId}" role="button" tabindex="0" aria-label="Open ${esc(item.name)}">
                    <img src="${app.icon}" alt="">
                    <span>${esc(item.name)}</span>
                </div>
            `;
        });

        // Pins, recommended files and search results all launch via the shared launcher.
        this.menuEl.addEventListener('click', (e) => {
            const launch = e.target.closest('[data-open-app], [data-open-cert]');
            if (!launch) return;
            if (launch.dataset.openApp) {
                const app = appById(launch.dataset.openApp);
                if (app) WindowManager.open(app);
                this.hide();
            } else if (launch.dataset.openCert) {
                WindowManager.openCert(launch.dataset.openCert);
                this.hide();
            }
        });

        // Live search over the existing app list (case-insensitive, partial match).
        const searchInput = this.menuEl.querySelector('.start-search input');
        searchInput.addEventListener('input', () => this.filterApps(searchInput.value));

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menuEl.contains(e.target) && !el('start-btn').contains(e.target)) {
                this.hide();
            }
        });
    },

    filterApps(query) {
        const results = el('start-search-results');
        if (!results) return;
        const q = query.trim().toLowerCase();
        if (!q) {
            results.innerHTML = '';
            this.setSearchMode(false);
            return;
        }

        const matches = [];
        STATE.desktopIcons.forEach(app => {
            const haystack = (app.title + ' ' + (app.keywords || '')).toLowerCase();
            if (haystack.indexOf(q) !== -1) {
                matches.push({ type: 'app', appId: app.id, title: app.title, icon: app.icon, sub: app.type === 'pdf' ? 'Document' : 'Application' });
            }
        });
        (WindowManager.portfolioData().certs || []).forEach((c, i) => {
            if ((c.name + ' ' + c.org).toLowerCase().indexOf(q) !== -1) {
                matches.push({ type: 'cert', index: i, title: c.name, sub: c.org, icon: Icons.folder });
            }
        });

        this.setSearchMode(true);
        results.innerHTML = matches.length
            ? matches.map(m => {
                const dataAttr = m.type === 'app' ? `data-open-app="${m.appId}"` : `data-open-cert="${m.index}"`;
                return `
                    <div class="rec-item" ${dataAttr} role="button" tabindex="0" aria-label="Open ${esc(m.title)}">
                        <div class="rec-icon"><img src="${m.icon}" alt="" style="width:24px;height:24px;display:block"></div>
                        <div class="rec-details">
                            <div class="rec-name">${esc(m.title)}</div>
                            <div class="rec-time">${esc(m.sub)}</div>
                        </div>
                    </div>`;
            }).join('')
            : '<div class="rec-item"><div class="rec-details"><div class="rec-name">No results found</div></div></div>';
    },

    setSearchMode(on) {
        const results = el('start-search-results');
        this.menuEl.querySelectorAll('.start-section-title, .pinned-apps, .recommended-files').forEach(el => {
            el.classList.toggle('hidden', on);
        });
        if (results) results.classList.toggle('hidden', !on);
    },

    toggle() {
        if(this.isOpen) this.hide();
        else this.show();
    },

    show() {
        this.menuEl.hidden = false;
        this.menuEl.classList.remove('hidden');
        this.isOpen = true;
        const powerMenu = el('power-menu');
        if (powerMenu) powerMenu.hidden = true;
        WidgetsManager.hide();
        ContextMenuManager.hide();
    },

    hide() {
        this.menuEl.classList.add('hidden');
        this.isOpen = false;
        const input = this.menuEl.querySelector('.start-search input');
        if (input && input.value) input.value = '';
        this.setSearchMode(false);
    }
};

// --- Widgets Panel ---
const WidgetsManager = {
    panelEl: null,
    isOpen: false,

    init() {
        this.panelEl = el('widgets-panel');

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panelEl.contains(e.target) && !el('widgets-btn').contains(e.target)) {
                this.hide();
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
                DesktopToast.show('Display settings are on the roadmap');
                break;
            case 'personalize':
                DesktopToast.show('Personalization coming soon');
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
                DesktopToast.show('Quick settings editor coming soon');
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
        'settings': 'settings', 'ms-settings': 'settings', 'settings app': 'settings'
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