// --- Wallpaper Slideshow ---
// TODO: Replace the default wallpapers in assets/images/wallpapers/ with personal ones.
const WallpaperManager = {
    wallpapers: [
        'assets/images/wallpapers/wallpaper1.png',
        'assets/images/wallpapers/wallpaper2.jpg',
        'assets/images/wallpapers/wallpaper3.jpg',
        'assets/images/wallpapers/wallpaper4.jpg',
        'assets/images/wallpapers/wallpaper5.webp'
    ],
    layers: [],
    current: 0,
    activeLayer: 0,
    interval: null,

    init() {
        if (window.matchMedia('(max-width: 1024px)').matches) return;

        for (let i = 0; i < 2; i++) {
            const layer = document.createElement('div');
            layer.className = 'wallpaper-layer';
            document.body.prepend(layer);
            this.layers.push(layer);
        }

        // Only the active wallpaper is loaded up front. Later slideshow
        // wallpapers are fetched on demand inside next(), so first paint
        // never pays for the whole (multi-megabyte) wallpaper set.
        let saved = null;
        try { saved = parseInt(localStorage.getItem('win11_wallpaper'), 10); } catch (e) {}
        if (!isNaN(saved) && saved >= 0 && saved < this.wallpapers.length) this.current = saved;

        this.layers[0].style.backgroundImage = `url("${this.wallpapers[this.current]}")`;
        this.layers[0].style.opacity = 1;

        this.interval = setInterval(() => this.next(), 5000);
    },

    /** Crossfades to the given wallpaper once its image has decoded. */
    swapTo(next, persist) {
        const from = this.layers[this.activeLayer];
        const to = this.layers[1 - this.activeLayer];
        const src = this.wallpapers[next];
        to.style.backgroundImage = `url("${src}")`;
        const apply = () => {
            from.style.opacity = 0;
            to.style.opacity = 1;
            this.current = next;
            this.activeLayer = 1 - this.activeLayer;
        };
        // Wait for the bitmap before fading so the incoming layer is never
        // momentarily empty; a short timeout keeps the slideshow moving
        // even if the image cannot be decoded.
        const img = new Image();
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            apply();
        };
        img.onload = finish;
        img.onerror = finish;
        img.src = src;
        setTimeout(finish, 2500);
        if (persist) {
            // An explicit choice stops the default slideshow so the picked
            // wallpaper stays put (Windows "choose wallpaper" behaviour).
            if (this.interval) { clearInterval(this.interval); this.interval = null; }
            try { localStorage.setItem('win11_wallpaper', String(next)); } catch (e) {}
        }
    },

    next() {
        this.swapTo((this.current + 1) % this.wallpapers.length, false);
    },

    /** Sets a specific wallpaper (used by Settings > Personalization). */
    set(index) {
        if (index < 0 || index >= this.wallpapers.length) return;
        this.swapTo(index, true);
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

