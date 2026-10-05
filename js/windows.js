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
                const projItem = e.target.closest('[data-project]');
                if (projItem) {
                    this.openProject(parseInt(projItem.dataset.project, 10));
                    return;
                }
                const pjGitHub = e.target.closest('[data-pj-github]');
                if (pjGitHub) {
                    window.open(pjGitHub.dataset.pjGithub, '_blank', 'noopener');
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

            // Keyboard activation for explorer items (Enter / Space), so the
            // file system stays fully usable without a mouse.
            this.container.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const t = e.target.closest('[data-project], [data-cert], [data-open-app], [data-nav-folder], [data-restore]');
                if (!t) return;
                e.preventDefault();
                t.click();
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
            contentArea.innerHTML = this.renderExplorerFrame(appData, this.renderFsItems(this.fsDirs.projects.items()), null, false, 'explorer-main--projects');
        } else if (appData.type === 'project') {
            contentArea.innerHTML = this.renderProjectDetail(appData);
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
        const SIZES = { notepad: [640, 480], calc: [340, 540], taskmgr: [680, 500], settings: [740, 520], about: [880, 560] };
        if (SIZES[appData.id]) {
            winEl.style.width = SIZES[appData.id][0] + 'px';
            winEl.style.height = SIZES[appData.id][1] + 'px';
        } else if (appData.type === 'project') {
            winEl.style.width = '880px';
            winEl.style.height = '600px';
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

    /** Opens the Settings app (focusing the existing window if open) at a page. */
    openSettingsPage(page) {
        const app = appById('settings');
        if (!app) return;
        const existing = STATE.windows.get('settings');
        if (existing) {
            this.focus(existing.id);
            const btn = existing.querySelector('[data-set-page="' + page + '"]');
            if (btn) btn.click();
            return;
        }
        this.open(Object.assign({}, app, { setPage: page || 'system' }));
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
        const android = window.Android;
        return (android && android.Apps && android.Apps.data)
            ? android.Apps.data
            : { profile: {}, certs: [], resume: {} };
    },

    renderExplorerFrame(appData, bodyHtml, path, backable, mainClass) {
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
                    <div class="explorer-main ${mainClass || ''}">
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

    /** Opens the rich detail window for a portfolio project. */
    openProject(index) {
        const proj = (this.portfolioData().projects || [])[parseInt(index, 10)];
        if (!proj) return;
        this.open({ id: 'project-' + index, title: proj.title, type: 'project', index });
    },

    renderProjectDetail(appData) {
        const p = (this.portfolioData().projects || [])[parseInt(appData.index, 10)] || {};
        const stack = (p.stack || []).map(s => `<span class="pj-chip">${esc(s)}</span>`).join('');
        const points = (p.points || []).map(pt => `<li>${esc(pt)}</li>`).join('');
        return `
            <div class="pj-page">
                <div class="pj-hero" style="--pj-a:${p.c1 || '#60c8ff'};--pj-b:${p.c2 || '#0078d4'}">
                    <div class="pj-hero__inner">
                        <span class="pj-eyebrow">Featured project${p.views ? ' · ' + esc(p.views) + ' views' : ''}${p.time ? ' · ' + esc(p.time) : ''}</span>
                        <h2 class="pj-title">${esc(p.title)}</h2>
                        ${p.tagline ? `<p class="pj-tag">${esc(p.tagline)}</p>` : ''}
                        ${p.repo ? `<div class="pj-actions"><button type="button" class="pj-btn pj-btn--primary" data-pj-github="${esc(p.repo)}">View on GitHub</button></div>` : ''}
                    </div>
                </div>
                <div class="pj-body">
                    ${p.desc ? `<section class="pj-sec"><h3>About this project</h3><p>${esc(p.desc)}</p></section>` : ''}
                    ${stack ? `<section class="pj-sec"><h3>Tech stack</h3><div class="pj-chips">${stack}</div></section>` : ''}
                    ${points ? `<section class="pj-sec"><h3>Key highlights</h3><ul class="pj-points">${points}</ul></section>` : ''}
                </div>
            </div>`;
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
                return (WindowManager.portfolioData().projects || []).map((p, i) => ({
                    kind: 'project', index: i, title: p.title,
                    sub: p.tagline || (p.views + ' views · ' + p.time),
                    color1: p.c1, color2: p.c2, stack: p.stack || []
                }));
            }
        }
    },

    renderMyPc(appData) {
        return this.renderExplorerFrame(appData, this.renderFsItems(this.fsDirs.root.items()), 'This PC', true);
    },

    renderFsItems(items) {
        return items.map((item) => {
            if (item.kind === 'project') {
                const chips = (item.stack || []).slice(0, 4)
                    .map(s => `<span class="pj-mini-chip">${esc(s)}</span>`).join('');
                return `
                    <div class="explorer-item explorer-item--project" data-project="${item.index}" role="button" tabindex="0" aria-label="Open project: ${esc(item.title)}">
                        <div class="pj-card-thumb" style="--pj-a:${item.color1};--pj-b:${item.color2}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v12"/><path d="M12 14l-5-3v4.2A6 6 0 0 0 12 21a6 6 0 0 0 5-2.8V11z"/><circle cx="12" cy="2" r="2.2" fill="#fff" stroke="none"/></svg>
                        </div>
                        <div class="pj-card-body">
                            <div class="explorer-item-name">${esc(item.title)}</div>
                            ${item.sub ? `<div class="explorer-item-sub">${esc(item.sub)}</div>` : ''}
                            ${chips ? `<div class="pj-card-chips">${chips}</div>` : ''}
                        </div>
                        <span class="pj-card-open">Open project</span>
                    </div>`;
            }
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
        if (main) {
            main.innerHTML = this.renderFsItems(dir.items());
            main.classList.toggle('explorer-main--projects', dirId === 'projects');
        }
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
            case 'about': return this.renderAbout(appData);
            default: return '<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">App not available.</div>';
        }
    },

    renderAbout(appData) {
        const data = this.portfolioData();
        const profile = data.profile || {};
        const resume = data.resume || {};
        const skills = (data.skills || []).slice(0, 6);
        const skillChips = skills.map(s => `
            <div class="about-skill" style="--sk-g:${s.grad || 'linear-gradient(135deg,#60a5fa,#818cf8)'}">
                <span class="about-skill__name">${esc(s.name)}</span>
                <span class="about-skill__cat">${esc(s.cat)}</span>
                <span class="about-skill__rate">${esc(s.rating || '')}</span>
            </div>`).join('');
        const contacts = [
            { label: 'Email', value: profile.email, href: profile.email ? 'mailto:' + profile.email : null },
            { label: 'Phone', value: profile.phone, href: profile.phone ? 'tel:' + profile.phone : null },
            { label: 'Location', value: profile.location, href: null },
            { label: 'GitHub', value: profile.github, href: profile.github ? 'https://' + profile.github : null },
            { label: 'LinkedIn', value: profile.linkedin, href: profile.linkedin ? 'https://' + profile.linkedin : null }
        ].map(c => c.href
            ? `<a class="about-contact" href="${esc(c.href)}" target="_blank" rel="noopener"><span class="about-contact__label">${esc(c.label)}</span><span class="about-contact__value">${esc(c.value)}</span></a>`
            : `<div class="about-contact"><span class="about-contact__label">${esc(c.label)}</span><span class="about-contact__value">${esc(c.value)}</span></div>`).join('');
        const expItems = (resume.experience || []).map(e => `
            <li class="about-list-item"><strong>${esc(e.role)}</strong><span>${esc(e.org)} · ${esc(e.years)}</span></li>`).join('');
        const eduItems = (resume.education || []).slice(0, 2).map(e => `
            <li class="about-list-item"><strong>${esc(e.degree)}</strong><span>${esc(e.org)} · ${esc(e.years)}</span></li>`).join('');
        return `
            <div class="about-page">
                <aside class="about-rail">
                    <div class="about-avatar" aria-hidden="true">${esc((profile.name || 'P').charAt(0))}</div>
                    <h2 class="about-name">${esc(profile.name || 'Pinaki Das')}</h2>
                    <p class="about-headline">${esc(profile.headline || '')}</p>
                    <p class="about-tagline">${esc(profile.tagline || '')}</p>
                    <div class="about-contacts">${contacts}</div>
                    <div class="about-cta">
                        <a class="about-btn" href="${esc(RESUME_FILE)}" download>Download Resume</a>
                    </div>
                </aside>
                <div class="about-main">
                    <section class="about-sec">
                        <h3>About me</h3>
                        <p class="about-bio">${esc(profile.bio || '')}</p>
                    </section>
                    <section class="about-sec">
                        <h3>Skills</h3>
                        <div class="about-skills">${skillChips}</div>
                    </section>
                    <section class="about-sec about-sec--split">
                        <div>
                            <h3>Experience</h3>
                            <ul class="about-list">${expItems}</ul>
                        </div>
                        <div>
                            <h3>Education</h3>
                            <ul class="about-list">${eduItems}</ul>
                        </div>
                    </section>
                </div>
            </div>`;
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
        const active = appData.setPage && this.SET_PAGES.indexOf(appData.setPage) !== -1 ? appData.setPage : 'system';
        const nav = this.SET_PAGES.map((p, i) => `
            <button type="button" class="set-nav-item${p === active ? ' is-active' : ''}" data-set-page="${p}">
                ${esc(this.SET_NAV[p])}
            </button>`).join('');
        return `
            <div class="app-settings">
                <div class="set-layout">
                    <nav class="set-nav" aria-label="Settings categories">${nav}</nav>
                    <main class="set-body" data-set-body>
                        ${this.renderSetPage(active)}
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

