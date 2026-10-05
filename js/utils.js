/**
 * Windows 11 UI Engine
 * Modular Vanilla JS implementation
 */

// --- Icons ---
const Icons = {
    computer: 'assets/images/icons/this-pc.png',
    network: 'assets/images/icons/network.png',
    trash: 'assets/images/icons/recycle-bin.png',
    folder: 'assets/images/icons/certificate.png',
    pdf: 'assets/images/icons/resume.png'
};

// --- Built-in desktop app icons (inline SVG data URIs, no image assets needed) ---
const AppIcons = {
    notepad: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='3' y='2' width='18' height='20' rx='2.5' fill='%231E6F9F'/><path d='M6 7h12v2H6zm0 4h12v2H6zm0 4h8v2H6z' fill='%23fff' opacity='.85'/></svg>",
    calc: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='4' y='2' width='16' height='20' rx='2.5' fill='%232D6A4F'/><rect x='8' y='4.5' width='8' height='3.5' fill='%23fff' rx='.6'/><g fill='%23fff'><circle cx='8.5' cy='11.5' r='1.2'/><circle cx='12' cy='11.5' r='1.2'/><circle cx='15.5' cy='11.5' r='1.2'/><circle cx='8.5' cy='15.5' r='1.2'/><circle cx='12' cy='15.5' r='1.2'/><circle cx='15.5' cy='15.5' r='1.2'/><circle cx='8.5' cy='19.5' r='1.2'/><circle cx='12' cy='19.5' r='1.2'/><circle cx='15.5' cy='19.5' r='1.2'/></g></svg>",
    taskmgr: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='3' width='20' height='18' rx='2' fill='%230067C0'/><rect x='5' y='6' width='14' height='2' fill='%23fff' opacity='.7'/><path d='M6 16l3.2-4 2.6 2.4L17 8' fill='none' stroke='%23fff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    settings: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M19.4 13c.04-.33.06-.66.06-1s-.02-.67-.06-1l2.06-1.6-2-3.46-2.43 1a7.6 7.6 0 0 0-2.93-1.7L13.5 2h-3l-.6 3.24a7.6 7.6 0 0 0-2.93 1.7l-2.43-1-2 3.46L4.6 11c-.04.33-.06.66-.06 1s.02.67.06 1l-2.06 1.6 2 3.46 2.43-1a7.6 7.6 0 0 0 2.93 1.7L10.5 22h3l.6-3.24a7.6 7.6 0 0 0 2.93-1.7l2.43 1 2-3.46L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z' fill='%23F2F2F2'/></svg>",
    about: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='12' fill='%232563EB'/><circle cx='12' cy='9.2' r='3.4' fill='%23fff'/><path d='M5.5 20.4c1.5-3.4 4.4-5 6.5-5s5 1.6 6.5 5' fill='none' stroke='%23fff' stroke-width='1.7' stroke-linecap='round'/></svg>"
};

// --- Uploaded documents (resume + certificates) ---
const RESUME_FILE = 'assets/documents/resume.pdf';

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
        { id: 'about', title: 'About Me', type: 'app', icon: AppIcons.about, initialX: 0, initialY: 5, keywords: 'about me profile bio who is summary skills contact introduction' },
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

