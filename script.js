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
    desktopIcons: [
        { id: 'this-pc', title: 'This PC', type: 'explorer', icon: Icons.computer, initialX: 0, initialY: 0 },
        { id: 'network', title: 'Network', type: 'explorer', icon: Icons.network, initialX: 0, initialY: 1 },
        { id: 'recycle', title: 'Recycle Bin', type: 'explorer', icon: Icons.trash, initialX: 0, initialY: 2 },
        { id: 'cert', title: 'Certificate', type: 'folder', icon: Icons.folder, initialX: 0, initialY: 3 },
        { id: 'resume', title: 'Resume.pdf', type: 'pdf', icon: Icons.pdf, initialX: 0, initialY: 4 }
    ]
};

// --- Utilities ---
const el = (id) => document.getElementById(id);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    WallpaperManager.init();
    DesktopManager.init();
    TaskbarManager.init();
    ClockManager.init();
    ContextMenuManager.init();
    StartMenuManager.init();
    SelectionManager.init();
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

        this.layers[0].style.backgroundImage = `url("${this.wallpapers[0]}")`;
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
    }
};

// --- Desktop & Icons ---
const DesktopManager = {
    container: null,
    
    init() {
        this.container = el('icon-container');
        this.loadPositions();
        this.renderIcons();
        this.attachEvents();
    },

    loadPositions() {
        const saved = JSON.parse(localStorage.getItem('win11_icons')) || {};
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
        }
    },

    open(appData) {
        this.init();
        const winId = `win-${appData.id}-${Date.now()}`;
        
        if(STATE.windows.has(appData.id) && appData.id !== 'cert') {
            this.focus(STATE.windows.get(appData.id).id);
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
            contentArea.innerHTML = `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div class="pdf-toolbar">
                        <span>${appData.title}</span>
                        <button class="pdf-btn">Download</button>
                    </div>
                    <div class="pdf-content">
                        <div style="text-align:center; padding: 40px;">
                            <!-- TODO: Replace this simulated preview with the real Resume.pdf asset -->
                            <h2>Pinaki Das — Resume Preview</h2>
                            <p>This is a simulated view of ${appData.title}. Replace it with the real resume PDF.</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Default Explorer View
            contentArea.innerHTML = `
                <div class="explorer-layout">
                    <div class="explorer-toolbar">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15 2L1 8l14 6V2z" opacity="0.5"/></svg>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2l14 6-14 6V2z"/></svg>
                        <div style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 4px; flex-grow: 1; font-size: 13px;">
                            C:\\Users\\Pinaki\\Desktop\\${appData.title}
                        </div>
                    </div>
                    <div class="explorer-body">
                        <div class="explorer-nav">
                            <div class="nav-item">⭐ Quick access</div>
                            <div class="nav-item">💻 This PC</div>
                            <div class="nav-item">🌐 Network</div>
                        </div>
                        <div class="explorer-main">
                            <div style="color: var(--text-secondary); font-size: 13px;">This folder is empty.</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Controls binding
        winEl.querySelector('.close').addEventListener('click', () => this.close(winId, appData.id));
        winEl.querySelector('.maximize').addEventListener('click', () => this.toggleMaximize(winId));
        winEl.querySelector('.minimize').addEventListener('click', () => this.minimize(winId));
        winEl.addEventListener('mousedown', () => this.focus(winId));

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
        winEl.classList.add('closing');
        setTimeout(() => {
            winEl.remove();
            STATE.windows.delete(appId);
            TaskbarManager.removeApp(winId);
        }, 150);
    },

    toggleMaximize(winId) {
        const winEl = el(winId);
        if(!winEl) return;
        winEl.classList.toggle('maximized');
    },

    minimize(winId) {
        const winEl = el(winId);
        if(!winEl) return;
        winEl.style.opacity = '0';
        winEl.style.pointerEvents = 'none';
        TaskbarManager.setAppActive(winId, false);
    },

    restore(winId) {
        const winEl = el(winId);
        if(!winEl) return;
        winEl.style.opacity = '1';
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
        
        titleBar.addEventListener('mousedown', (e) => {
            if(e.target.closest('.ctrl-btn')) return;
            if(winEl.classList.contains('maximized')) return;
            
            let startX = e.clientX;
            let startY = e.clientY;
            let initialX = winEl.offsetLeft;
            let initialY = winEl.offsetTop;

            const onMouseMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                winEl.style.left = `${initialX + dx}px`;
                winEl.style.top = `${Math.max(0, initialY + dy)}px`;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
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
        
        // Populate pinned apps
        const pinnedContainer = this.menuEl.querySelector('.pinned-apps');
        const pinnedList = [
            {icon: Icons.computer, name: 'This PC'},
            {icon: Icons.network, name: 'GitHub'},
            {icon: Icons.folder, name: 'Projects'},
            {icon: Icons.pdf, name: 'Resume'},
            {icon: Icons.trash, name: 'Recycle Bin'},
            {icon: Icons.folder, name: 'Certificates'}
        ];
        
        pinnedList.forEach(app => {
            pinnedContainer.innerHTML += `
                <div class="pinned-app">
                    <img src="${app.icon}">
                    <span>${app.name}</span>
                </div>
            `;
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menuEl.contains(e.target) && !el('start-btn').contains(e.target)) {
                this.hide();
            }
        });
    },

    toggle() {
        if(this.isOpen) this.hide();
        else this.show();
    },

    show() {
        this.menuEl.classList.remove('hidden');
        this.isOpen = true;
        ContextMenuManager.hide();
    },

    hide() {
        this.menuEl.classList.add('hidden');
        this.isOpen = false;
    }
};

// --- Context Menu ---
const ContextMenuManager = {
    menuEl: null,

    init() {
        this.menuEl = el('context-menu');
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.show(e.clientX, e.clientY);
        });

        document.addEventListener('click', () => this.hide());
    },

    show(x, y) {
        StartMenuManager.hide();
        this.menuEl.classList.remove('hidden');
        
        // Ensure menu doesn't go off-screen
        const rect = this.menuEl.getBoundingClientRect();
        let posX = x;
        let posY = y;
        
        if (x + rect.width > window.innerWidth) posX = window.innerWidth - rect.width;
        if (y + rect.height > window.innerHeight) posY = window.innerHeight - rect.height;
        
        this.menuEl.style.left = `${posX}px`;
        this.menuEl.style.top = `${posY}px`;
    },

    hide() {
        this.menuEl.classList.add('hidden');
    }
};

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