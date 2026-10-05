// --- Start Menu ---
const StartMenuManager = {
    menuEl: null,
    isOpen: false,

    init() {
        this.menuEl = el('start-menu');
        
        // Populate pinned apps from the shared app registry (same apps as the desktop).
        const pinnedContainer = this.menuEl.querySelector('.pinned-apps');
        const pinnedList = [
            { appId: 'about', name: 'About Me' },
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

