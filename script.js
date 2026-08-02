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
    desktopIcons: [
        { id: 'this-pc', title: 'This PC', type: 'explorer', icon: Icons.computer, initialX: 0, initialY: 0, keywords: 'my pc computer file explorer files folders' },
        { id: 'network', title: 'Network', type: 'explorer', icon: Icons.network, initialX: 0, initialY: 1, keywords: 'links' },
        { id: 'recycle', title: 'Recycle Bin', type: 'explorer', icon: Icons.trash, initialX: 0, initialY: 2, keywords: 'trash deleted' },
        { id: 'cert', title: 'Certificate', type: 'folder', icon: Icons.folder, initialX: 0, initialY: 3, keywords: 'certificates courses coursera aws linux' },
        { id: 'resume', title: 'Resume.pdf', type: 'pdf', icon: Icons.pdf, pdf: RESUME_FILE, initialX: 0, initialY: 4, keywords: 'cv resume download document' },
        { id: 'projects', title: 'Projects', type: 'folder', icon: Icons.folder, pinnedOnly: true, keywords: 'nova ai chatbot object detection eighth wonder' },
        { id: 'github', title: 'GitHub', type: 'explorer', icon: Icons.network, pinnedOnly: true, keywords: 'git profile repository' }
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
            if (icon.pinnedOnly) return;
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
        } else if (appData.type === 'folder') {
            contentArea.innerHTML = this.renderExplorerFrame(appData, this.renderCertGrid());
        } else {
            contentArea.innerHTML = this.renderExplorerFrame(
                appData,
                '<div style="color: var(--text-secondary); font-size: 13px;">This folder is empty.</div>'
            );
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
        const isMaximized = winEl.classList.toggle('maximized');
        const btn = winEl.querySelector('.maximize');
        if (btn) {
            btn.innerHTML = isMaximized
                ? '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1.5 3.5h5v5h-5z M3.5 1.5h5v5h-5z" fill="none" stroke="currentColor" stroke-width="1"/></svg>'
                : '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" stroke="currentColor" stroke-width="1" fill="none"/></svg>';
            btn.setAttribute('aria-label', isMaximized ? 'Restore' : 'Maximize');
        }
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
            this.toggleMaximize(winEl.id);
        });
        
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
                return [
                    { kind: 'folder', nav: 'documents', title: 'Documents', icon: Icons.folder },
                    { kind: 'folder', nav: 'certificates', title: 'Certificates', icon: Icons.folder },
                    { kind: 'folder', nav: 'projects', title: 'Projects', icon: Icons.folder },
                    { kind: 'app', appId: 'network', title: 'Network', icon: Icons.network },
                    { kind: 'app', appId: 'recycle', title: 'Recycle Bin', icon: Icons.trash },
                    { kind: 'app', appId: 'github', title: 'GitHub', icon: Icons.network }
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
        
        // Populate pinned apps from the shared app registry (same apps as the desktop).
        const pinnedContainer = this.menuEl.querySelector('.pinned-apps');
        const pinnedList = [
            { appId: 'this-pc', name: 'This PC' },
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
        this.menuEl.classList.remove('hidden');
        this.isOpen = true;
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