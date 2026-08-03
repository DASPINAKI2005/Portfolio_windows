/**
 * Mobile Home
 * Renders the Android home screen: search pill, paged app grid, page
 * indicators and the dock. Grid and dock apps come from the app registry.
 *
 * T-009: long-press drag on grid icons to reorder, create folders, drop on
 * folders, or remove apps; folders open in an overlay (rename + launch);
 * removed apps can be restored from the drag edit bar. Layout persists to
 * localStorage (android_home_layout).
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const U = Android.Utils;
    const I = Android.Icons;
    const esc = U.esc;

    const APPS_PER_PAGE = 20;
    const LONG_PRESS_MS = 450;
    const MOVE_CANCEL = 14;

    function appCell(app) {
        return (
            '<button class="android-app-icon android-ripple-target" data-action="open-app" data-app="' +
            esc(app.id) + '" aria-label="Open ' + esc(app.name) + '">' +
            '<span class="android-app-icon__glyph">' + app.icon + '</span>' +
            '<span class="android-app-icon__label">' + esc(app.name) + '</span>' +
            '</button>'
        );
    }

    const Home = (Android.Home = {
        mount: null,
        pages: null,
        indicators: null,
        pageIndex: 0,

        layout: [],
        removed: [],
        drag: null,
        overlay: null,
        currentFolder: null,
        dropKind: null,
        dropTargetId: null,
        _suppressClick: false,

        STORE: 'android_home_layout',

        build: function () {
            const root = Android.Shell.root;
            this.mount = root.querySelector('.android-home');
            if (!this.mount || this.mount.childElementCount > 0) return;

            this.loadLayout();

            this.mount.innerHTML =
                '<button class="android-home__search android-ripple-target" data-action="open-app" data-app="google" aria-label="Open Google search">' +
                '<span class="android-home__search-ico">' + I.google + '</span>' +
                '<span class="android-home__search-text">Search</span>' +
                '<span class="android-home__mic" aria-hidden="true">' + I.mic + '</span>' +
                '</button>' +
                '<div class="android-home__pages" aria-label="Home screen apps"></div>' +
                '<div class="android-home__indicators" aria-hidden="true"></div>' +
                '<div class="android-home__dock" aria-label="App dock"></div>' +
                '<div class="android-editbar">' +
                '<div class="android-editbar__zone" data-drop-remove>' +
                '<span class="android-editbar__trash" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM8 9h8v10H8V9zm3.5-5h1l.5.5H18v2H6v-2h5l.5-.5z"/></svg></span>' +
                '<span>Drop to remove</span>' +
                '</div>' +
                '<div class="android-editbar__restore" data-restore-chips></div>' +
                '</div>';

            this.pages = this.mount.querySelector('.android-home__pages');
            this.indicators = this.mount.querySelector('.android-home__indicators');
            this.editBar = this.mount.querySelector('.android-editbar');

            this.renderPages();
            this.renderDock();
            this.bindPagination();
            this.bindKeyboard();
            this.bindDrag();
            this.bindEditBar();
        },

        /* ---------------------------------------------------------- */
        /* Layout persistence                                          */
        /* ---------------------------------------------------------- */

        defaultLayout: function () {
            return Android.Apps.gridApps.map(function (a) {
                return { type: 'app', id: a.id };
            });
        },

        loadLayout: function () {
            let saved = null;
            try { saved = JSON.parse(localStorage.getItem(this.STORE)); } catch (e) {}
            if (saved && Array.isArray(saved.layout)) {
                this.removed = Array.isArray(saved.removed) ? saved.removed : [];
                this.layout = [];
                saved.layout.forEach(function (entry) {
                    if (entry.type === 'folder') {
                        if (Array.isArray(entry.apps)) {
                            entry.apps = entry.apps.filter(function (id) { return Android.Apps.get(id); });
                            if (entry.apps.length) this.layout.push(entry);
                        }
                    } else if (Android.Apps.get(entry.id) && this.removed.indexOf(entry.id) === -1) {
                        this.layout.push(entry);
                    }
                }, this);
                const seen = {};
                this.layout.forEach(function (e) {
                    if (e.type === 'app') seen[e.id] = true;
                    else if (Array.isArray(e.apps)) e.apps.forEach(function (id) { seen[id] = true; });
                });
                Android.Apps.gridApps.forEach(function (a) {
                    if (!seen[a.id] && this.removed.indexOf(a.id) === -1) {
                        this.layout.push({ type: 'app', id: a.id });
                    }
                }, this);
                return;
            }
            this.removed = [];
            this.layout = this.defaultLayout();
        },

        saveLayout: function () {
            try {
                localStorage.setItem(this.STORE, JSON.stringify({
                    layout: this.layout,
                    removed: this.removed
                }));
            } catch (e) {}
        },

        folderById: function (id) {
            for (let i = 0; i < this.layout.length; i++) {
                if (this.layout[i].type === 'folder' && this.layout[i].id === id) return this.layout[i];
            }
            return null;
        },

        /* ---------------------------------------------------------- */
        /* Rendering                                                   */
        /* ---------------------------------------------------------- */

        renderPages: function () {
            const layout = this.layout;
            let pagesHtml = '';
            let dotsHtml = '';
            for (let i = 0; i < layout.length; i += APPS_PER_PAGE) {
                const slice = layout.slice(i, i + APPS_PER_PAGE);
                pagesHtml += '<div class="android-home__page">' + slice.map(this.renderCell, this).join('') + '</div>';
                dotsHtml += '<span class="android-dot' + (i === 0 ? ' is-active' : '') + '"></span>';
            }
            this.pages.innerHTML = pagesHtml;
            this.indicators.innerHTML = dotsHtml;
        },

        renderCell: function (entry) {
            if (entry.type === 'folder') return this.folderCell(entry);
            const app = Android.Apps.get(entry.id);
            return app ? appCell(app) : '';
        },

        folderCell: function (folder) {
            const mini = folder.apps.slice(0, 4).map(function (id) {
                const a = Android.Apps.get(id);
                return a ? '<span class="android-folder__mini">' + a.icon + '</span>' : '';
            }).join('');
            const more = folder.apps.length > 4
                ? '<span class="android-folder__more">+' + (folder.apps.length - 4) + '</span>'
                : '';
            return (
                '<button class="android-app-icon android-folder android-ripple-target" data-folder="' + esc(folder.id) +
                '" aria-label="Open folder ' + esc(folder.name) + '">' +
                '<span class="android-folder__stack">' + mini + more + '</span>' +
                '<span class="android-app-icon__label">' + esc(folder.name) + '</span>' +
                '</button>'
            );
        },

        renderDock: function () {
            const dock = this.mount.querySelector('.android-home__dock');
            dock.innerHTML = Android.Apps.dockApps.map(appCell).join('');
        },

        bindPagination: function () {
            this.pages.addEventListener(
                'scroll',
                U.throttle(
                    function () {
                        const width = this.pages.clientWidth || 1;
                        const idx = Math.round(this.pages.scrollLeft / width);
                        if (idx !== this.pageIndex) {
                            this.pageIndex = idx;
                            this.updateIndicators();
                        }
                    }.bind(this),
                    80
                ),
                { passive: true }
            );
        },

        updateIndicators: function () {
            const dots = this.indicators.children;
            for (let i = 0; i < dots.length; i++) {
                dots[i].classList.toggle('is-active', i === this.pageIndex);
            }
        },

        /** Grid columns used for vertical arrow-key navigation. */
        columns: function () {
            const width = (this.pages && this.pages.clientWidth) || 320;
            if (width >= 800) return 6;
            if (width >= 500) return 5;
            return 4;
        },

        bindKeyboard: function () {
            this.pages.addEventListener('keydown', function (e) {
                const cells = Array.prototype.slice.call(this.pages.querySelectorAll('.android-app-icon'));
                const current = cells.indexOf(document.activeElement);
                if (current === -1) return;
                const cols = this.columns();
                let next = -1;
                if (e.key === 'ArrowRight') next = current + 1;
                else if (e.key === 'ArrowLeft') next = current - 1;
                else if (e.key === 'ArrowDown') next = current + cols;
                else if (e.key === 'ArrowUp') next = current - cols;
                else return;
                e.preventDefault();
                if (next >= 0 && next < cells.length) cells[next].focus();
            }.bind(this));
        },

        /** Returns to the first page when the user presses Home. */
        reset: function () {
            if (this.pageIndex !== 0 && this.pages) {
                this.pages.scrollTo({ left: 0, behavior: U.reducedMotion() ? 'auto' : 'smooth' });
            }
        },

        /* ---------------------------------------------------------- */
        /* Long-press drag (grid only; dock stays pinned)              */
        /* ---------------------------------------------------------- */

        bindDrag: function () {
            this.pages.addEventListener('pointerdown', function (e) { this.startPress(e); }.bind(this));
            this.pages.addEventListener('pointermove', function (e) { this.moveDrag(e); }.bind(this));
            this.pages.addEventListener('pointerup', function (e) { this.endDrag(e); }.bind(this));
            this.pages.addEventListener('pointercancel', function (e) { this.endDrag(e); }.bind(this));
            this.pages.addEventListener('click', function (e) { this.onCellClick(e); }.bind(this), true);
        },

        bindEditBar: function () {
            this.editBar.addEventListener('click', function (e) {
                const chip = e.target.closest('[data-restore]');
                if (!chip) return;
                e.stopPropagation();
                this.restoreApp(chip.dataset.restore);
            }.bind(this));
        },

        cellInfo: function (cell) {
            let entry = null;
            if (cell.dataset.folder) {
                entry = this.folderById(cell.dataset.folder);
                return entry ? { index: this.layout.indexOf(entry), entry: entry } : null;
            }
            if (cell.dataset.app) {
                for (let i = 0; i < this.layout.length; i++) {
                    if (this.layout[i].type === 'app' && this.layout[i].id === cell.dataset.app) {
                        return { index: i, entry: this.layout[i] };
                    }
                }
            }
            return null;
        },

        startPress: function (e) {
            if (this.drag) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const cell = e.target.closest('.android-app-icon');
            if (!cell) return;
            const info = this.cellInfo(cell);
            if (!info) return;
            const d = {
                cell: cell,
                entryIndex: info.index,
                entry: info.entry,
                startX: e.clientX,
                startY: e.clientY,
                grabX: 0,
                grabY: 0,
                baseLeft: 0,
                baseTop: 0,
                active: false,
                timer: null
            };
            d.timer = setTimeout(function () {
                if (this.drag === d) this.activateDrag(d);
            }.bind(this), LONG_PRESS_MS);
            this.drag = d;
        },

        activateDrag: function (d) {
            d.active = true;
            const r = d.cell.getBoundingClientRect();
            d.grabX = d.startX - r.left;
            d.grabY = d.startY - r.top;
            d.baseLeft = r.left;
            d.baseTop = r.top;
            d.cell.classList.add('is-dragging');
            d.cell.style.touchAction = 'none';
            this.pages.classList.add('is-dragging');
            this.pages.querySelectorAll('.android-app-icon').forEach(function (c) {
                if (c !== d.cell) c.classList.add('is-wiggling');
            });
            this.showEditBar();
            this._suppressClick = true;
            if (navigator.vibrate) navigator.vibrate(15);
        },

        moveDrag: function (e) {
            const d = this.drag;
            if (!d) return;
            if (!d.active) {
                const dx = e.clientX - d.startX;
                const dy = e.clientY - d.startY;
                if (Math.abs(dx) + Math.abs(dy) > MOVE_CANCEL) {
                    clearTimeout(d.timer);
                    this.drag = null;
                }
                return;
            }
            d.cell.style.transform =
                'translate(' + (e.clientX - d.grabX - d.baseLeft) + 'px,' + (e.clientY - d.grabY - d.baseTop) + 'px) scale(1.12)';
            this.highlightDrop(e.clientX, e.clientY);
        },

        highlightDrop: function (x, y) {
            this.mount.querySelectorAll('.is-drop-target').forEach(function (n) {
                n.classList.remove('is-drop-target');
            });
            this.dropKind = null;
            this.dropTargetId = null;
            // The dragged cell rides under the cursor - hide it so the
            // real element at the point is found.
            const dragged = this.drag ? this.drag.cell : null;
            if (dragged) dragged.style.visibility = 'hidden';
            const hit = document.elementFromPoint(x, y);
            if (dragged) dragged.style.visibility = '';
            if (!hit) return;
            const rm = hit.closest('[data-drop-remove]');
            if (rm) {
                rm.classList.add('is-drop-target');
                this.dropKind = 'remove';
                return;
            }
            const folder = hit.closest('.android-folder');
            if (folder) {
                folder.classList.add('is-drop-target');
                this.dropKind = 'folder';
                this.dropTargetId = folder.dataset.folder;
                return;
            }
            const other = hit.closest('.android-app-icon');
            if (other) {
                other.classList.add('is-drop-target');
                this.dropKind = 'app';
                this.dropTargetId = other.dataset.app || null;
            }
        },

        endDrag: function (e) {
            const d = this.drag;
            if (!d) return;
            this.drag = null;
            if (d.active && e) {
                this.highlightDrop(e.clientX, e.clientY);
                const kind = this.dropKind;
                if (kind === 'remove') {
                    this.removeFromHome(d.entry);
                } else if (kind === 'folder') {
                    this.addToFolder(this.dropTargetId, d.entry);
                } else if (kind === 'app') {
                    this.createFolder(d.entry, this.dropTargetId);
                } else {
                    this.reorder(d.entryIndex, e.clientX, e.clientY);
                }
            }
            this.pages.classList.remove('is-dragging');
            this.hideEditBar();
            this.pages.querySelectorAll('.is-dragging, .is-wiggling, .is-drop-target').forEach(function (n) {
                n.classList.remove('is-dragging', 'is-wiggling', 'is-drop-target');
            });
            this.renderPages();
            this.saveLayout();
        },

        onCellClick: function (e) {
            if (this._suppressClick) {
                e.stopPropagation();
                this._suppressClick = false;
                return;
            }
            const folder = e.target.closest('[data-folder]');
            if (folder) {
                e.stopPropagation();
                this.openFolder(folder.dataset.folder);
            }
        },

        nearestIndex: function (x, y) {
            const cells = this.pages.querySelectorAll('.android-home__page .android-app-icon');
            let best = null;
            let bestDist = Infinity;
            cells.forEach(function (c, i) {
                const r = c.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const d = (cx - x) * (cx - x) + (cy - y) * (cy - y);
                if (d < bestDist) {
                    bestDist = d;
                    best = i;
                }
            });
            return best;
        },

        /* ---------------------------------------------------------- */
        /* Layout mutations                                            */
        /* ---------------------------------------------------------- */

        removeFromHome: function (entry) {
            const idx = this.layout.indexOf(entry);
            if (idx === -1) return;
            if (entry.type === 'folder') {
                const apps = entry.apps.slice();
                this.layout.splice(idx, 1);
                apps.reverse().forEach(function (id) {
                    this.layout.splice(idx, 0, { type: 'app', id: id });
                }, this);
                U.toast('Folder removed');
                return;
            }
            this.layout.splice(idx, 1);
            this.removed.push(entry.id);
            const app = Android.Apps.get(entry.id);
            U.toast('Removed ' + (app ? app.name : 'app') + ' — drag the icon to restore');
        },

        restoreApp: function (id) {
            this.removed = this.removed.filter(function (x) { return x !== id; });
            this.layout.push({ type: 'app', id: id });
            const app = Android.Apps.get(id);
            U.toast('Restored ' + (app ? app.name : 'app'));
            this.renderPages();
            this.saveLayout();
        },

        createFolder: function (entry, otherAppId) {
            const other = this.layout.find(function (e) { return e.type === 'app' && e.id === otherAppId; });
            if (!other || other === entry) return;
            const apps = [];
            if (entry.type === 'app') apps.push(entry.id);
            else entry.apps.forEach(function (id) { apps.push(id); });
            apps.push(otherAppId);
            const folder = {
                type: 'folder',
                id: 'f_' + Date.now().toString(36) + Math.floor(Math.random() * 999),
                name: 'Folder',
                apps: Array.from(new Set(apps))
            };
            const a = this.layout.indexOf(entry);
            const b = this.layout.indexOf(other);
            this.layout.splice(Math.min(a, b), 2, folder);
            U.toast('Folder created');
        },

        addToFolder: function (folderId, entry) {
            const folder = this.folderById(folderId);
            if (!folder) return;
            if (entry.type === 'app') {
                if (folder.apps.indexOf(entry.id) !== -1) return;
                folder.apps.push(entry.id);
            } else {
                entry.apps.forEach(function (id) {
                    if (folder.apps.indexOf(id) === -1) folder.apps.push(id);
                });
            }
            this.layout.splice(this.layout.indexOf(entry), 1);
            U.toast('Added to ' + folder.name);
        },

        reorder: function (fromIndex, x, y) {
            const target = this.nearestIndex(x, y);
            if (target === null) return;
            const entry = this.layout.splice(fromIndex, 1)[0];
            if (!entry) return;
            let to = target;
            if (to > fromIndex) to -= 1;
            to = Math.max(0, Math.min(to, this.layout.length));
            this.layout.splice(to, 0, entry);
        },

        /* ---------------------------------------------------------- */
        /* Folder overlay                                              */
        /* ---------------------------------------------------------- */

        openFolder: function (folderId) {
            const folder = this.folderById(folderId);
            if (!folder) return;
            this.currentFolder = folder;
            this.getOverlay();
            this.renderOverlay(folder);
            this.overlay.classList.remove('is-hidden');
        },

        closeFolder: function () {
            if (this.overlay) this.overlay.classList.add('is-hidden');
            this.currentFolder = null;
        },

        getOverlay: function () {
            if (this.overlay) return this.overlay;
            const overlay = U.create('div', { class: 'android-folder-overlay is-hidden' });
            overlay.innerHTML =
                '<div class="android-folder__sheet">' +
                '<div class="android-folder__head">' +
                '<span class="android-folder__name" data-folder-name></span>' +
                '<input class="android-folder__rename" data-folder-input aria-label="Folder name" hidden>' +
                '<button type="button" class="android-folder__btn" data-folder-rename>Rename</button>' +
                '<button type="button" class="android-folder__btn" data-folder-close aria-label="Close folder">Close</button>' +
                '</div>' +
                '<div class="android-folder__grid" data-folder-grid></div>' +
                '<div class="android-folder__foot">Hold an app icon to remove it</div>' +
                '</div>';

            overlay.addEventListener('pointerdown', function (e) {
                if (e.target === overlay) Home.closeFolder();
            });
            overlay.addEventListener('click', function (e) {
                const app = e.target.closest('[data-action="open-app"]');
                if (app) { Home.closeFolder(); return; }
                const rm = e.target.closest('[data-remove-from-folder]');
                if (rm) { Home.removeFromFolder(rm.dataset.removeFromFolder); return; }
                const rename = e.target.closest('[data-folder-rename]');
                if (rename) { Home.enableRename(); return; }
                const done = e.target.closest('[data-folder-done]');
                if (done) { Home.commitRename(); return; }
                if (e.target.closest('[data-folder-close]')) Home.closeFolder();
            });
            overlay.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') Home.closeFolder();
            });
            overlay.addEventListener('pointerdown', function (e) {
                const app = e.target.closest('.android-app-icon');
                if (!app || !app.dataset.app) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                const timer = setTimeout(function () {
                    Home.removeFromFolder(app.dataset.app);
                }, LONG_PRESS_MS);
                const cancel = function () {
                    clearTimeout(timer);
                    overlay.removeEventListener('pointerup', cancel);
                    overlay.removeEventListener('pointercancel', cancel);
                };
                overlay.addEventListener('pointerup', cancel);
                overlay.addEventListener('pointercancel', cancel);
            });
            Android.Shell.screen.appendChild(overlay);
            this.overlay = overlay;
            return overlay;
        },

        renderOverlay: function (folder) {
            const nameEl = this.overlay.querySelector('[data-folder-name]');
            const input = this.overlay.querySelector('[data-folder-input]');
            const grid = this.overlay.querySelector('[data-folder-grid]');
            nameEl.textContent = folder.name;
            nameEl.hidden = false;
            input.hidden = true;
            grid.innerHTML = folder.apps.map(function (id) {
                const a = Android.Apps.get(id);
                return a ? appCell(a) : '';
            }).join('');
        },

        removeFromFolder: function (appId) {
            const folder = this.currentFolder;
            if (!folder) return;
            folder.apps = folder.apps.filter(function (id) { return id !== appId; });
            if (folder.apps.length === 0) {
                this.layout = this.layout.filter(function (e) { return e !== folder; });
                U.toast('Folder removed');
                this.closeFolder();
            } else {
                this.renderOverlay(folder);
                U.toast('Removed from folder');
            }
            this.saveLayout();
            this.renderPages();
        },

        enableRename: function () {
            if (!this.currentFolder || !this.overlay) return;
            const nameEl = this.overlay.querySelector('[data-folder-name]');
            const input = this.overlay.querySelector('[data-folder-input]');
            nameEl.hidden = true;
            input.hidden = false;
            input.value = this.currentFolder.name;
            input.focus();
            input.select();
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') Home.commitRename();
            });
        },

        commitRename: function () {
            if (!this.currentFolder || !this.overlay) return;
            const nameEl = this.overlay.querySelector('[data-folder-name]');
            const input = this.overlay.querySelector('[data-folder-input]');
            const value = (input.value || '').trim().slice(0, 24);
            if (value) this.currentFolder.name = value;
            nameEl.textContent = this.currentFolder.name;
            nameEl.hidden = false;
            input.hidden = true;
            this.saveLayout();
            this.renderPages();
        },

        /* ---------------------------------------------------------- */
        /* Edit bar (drag targets)                                     */
        /* ---------------------------------------------------------- */

        showEditBar: function () {
            this.editBar.classList.add('is-visible');
            const chips = this.editBar.querySelector('[data-restore-chips]');
            chips.innerHTML = this.removed.map(function (id) {
                const a = Android.Apps.get(id);
                return a
                    ? '<button type="button" class="android-editbar__chip" data-restore="' + esc(id) + '">' +
                      a.icon + '<span>' + esc(a.name) + '</span></button>'
                    : '';
            }).join('');
        },

        hideEditBar: function () {
            this.editBar.classList.remove('is-visible');
        }
    });
})(window);
