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

