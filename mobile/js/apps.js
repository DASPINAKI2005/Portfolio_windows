/**
 * Mobile Apps
 * App registry, portfolio content data, screen renderers, and delegated
 * action handling. This is the "content layer" of the Android simulation.
 *
 * All content below is real portfolio data for Pinaki Das - edit the PROFILE,
 * PROJECTS, SKILLS, CERTS, EMAILS, CHATS and FILES arrays to customize.
 */
(function (global) {
    'use strict';

    const Android = (global.Android = global.Android || {});
    const I = Android.Icons;
    const esc = Android.Utils.esc;

    /* ============================================================
     * EDITABLE PORTFOLIO DATA
     * ============================================================ */

    // TODO: Replace the letter-initial avatars below with a real profile photo
    //       (e.g. mobile/media/profile.jpg) once one is available.
    const PROFILE = {
        name: 'Pinaki Das',
        headline: 'Aspiring AI Engineer | Python Developer | Generative AI Developer',
        tagline: 'Building intelligent AI applications with Python, LLMs and RAG.',
        role: 'Aspiring AI Engineer',
        location: 'Kolkata, West Bengal, India',
        email: 'daspinaki2005@gmail.com',
        phone: '9800167772',
        website: 'github.com/DASPINAKI2005',
        github: 'github.com/DASPINAKI2005',
        linkedin: 'linkedin.com/in/pinaki-das-9a2860281',
        handle: 'DASPINAKI2005',
        subs: '1.4K',
        ytDesc: 'AI projects, experiments and builds — one commit at a time.',
        instaBio: 'Aspiring AI Engineer • Python • LLMs & RAG • Building in public',
        bio: 'Aspiring AI Engineer and Computer Science undergraduate with a strong project-driven foundation in Python, LLMs, Prompt Engineering, and Retrieval-Augmented Generation (RAG). Experienced in building production-ready AI applications with FastAPI and React, covering everything from REST APIs to responsive UIs with clean, maintainable code.'
    };

    const PROJECTS = [
        { title: 'Nova — Local AI Chatbot', views: '4.2K', time: '2 days ago', dur: '3:24', c1: '#34d399', c2: '#0ea5e9' },
        { title: 'Real-Time Object Detection Web App', views: '12K', time: '1 week ago', dur: '4:58', c1: '#60a5fa', c2: '#a78bfa' },
        { title: 'The Eighth Wonder — AI Project Idea Generator', views: '2.1K', time: '3 weeks ago', dur: '6:12', c1: '#f472b6', c2: '#fb923c' }
    ];

    const SKILLS = [
        { name: 'Python', letter: 'Py', cat: 'Language', rating: '4.9', grad: 'linear-gradient(135deg,#f7df1e,#d4a017)' },
        { name: 'JavaScript', letter: 'JS', cat: 'Language', rating: '4.8', grad: 'linear-gradient(135deg,#61dafb,#2563eb)' },
        { name: 'SQL', letter: 'SQL', cat: 'Language', rating: '4.7', grad: 'linear-gradient(135deg,#3c873a,#1e8449)' },
        { name: 'FastAPI', letter: 'F', cat: 'Backend', rating: '4.8', grad: 'linear-gradient(135deg,#3178c6,#1d4ed8)' },
        { name: 'Flask', letter: 'Fl', cat: 'Backend', rating: '5.0', grad: 'linear-gradient(135deg,#e34f26,#1572b6)' },
        { name: 'PostgreSQL', letter: 'PG', cat: 'Database', rating: '4.6', grad: 'linear-gradient(135deg,#3776ab,#f5d547)' },
        { name: 'Prompt Engineering', letter: 'PE', cat: 'AI', rating: '4.9', grad: 'linear-gradient(135deg,#a259ff,#ff7262)' },
        { name: 'RAG & LLMs', letter: 'R', cat: 'AI', rating: '4.7', grad: 'linear-gradient(135deg,#f05033,#b3202c)' }
    ];

    const CERTS = [
        { name: 'Introduction to AI', org: 'Google · Coursera', color1: '#60a5fa', color2: '#818cf8', pdf: 'assets/certificates/coursera-introduction-to-ai.pdf' },
        { name: 'Maximize Productivity with AI Tools', org: 'Google · Coursera', color1: '#fbbf24', color2: '#f59e0b', pdf: 'assets/certificates/coursera-maximize-productivity-ai-tools.pdf' },
        { name: 'AWS Power Hour: Generative AI for Developers', org: 'AWS', color1: '#34d399', color2: '#0ea5e9', pdf: 'assets/certificates/aws-power-hour-generative-ai.pdf' },
        { name: 'PyTorch & DL for Decision Makers (LFS116)', org: 'Linux Foundation', color1: '#f472b6', color2: '#fb923c', pdf: 'assets/certificates/linux-foundation-pytorch-lfs116.pdf' },
        { name: 'Planning a Generative AI Project', org: 'AWS', color1: '#a78bfa', color2: '#ec4899', pdf: 'assets/certificates/aws-planning-generative-ai-project.pdf' }
    ];

    const EMAILS = [
        { sender: 'GitHub', subject: '[GitHub] New stars on your repositories', snippet: 'Your repository "nova-ai-chatbot" received 2 new stars this week.', time: '09:12', grad: 'linear-gradient(135deg,#18181b,#3f3f46)', read: false },
        { sender: 'Coursera', subject: 'Congratulations! You earned "Introduction to AI"', snippet: 'Your Google certificate is ready to view and download.', time: '08:30', grad: 'linear-gradient(135deg,#0ea5e9,#2563eb)', read: false },
        { sender: 'LinkedIn', subject: 'You appeared in X searches this week', snippet: 'Recruiters found you for roles matching Python and AI development.', time: 'Yesterday', grad: 'linear-gradient(135deg,#0072b1,#004182)', read: false },
        { sender: 'AWS', subject: 'Your Generative AI training progress', snippet: 'Complete "Planning a Generative AI Project" to unlock the next badge.', time: 'Yesterday', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', read: true },
        { sender: 'University', subject: 'Academic reminder — project submission', snippet: 'Final year project report drafts are due before the end of the month.', time: 'Mon', grad: 'linear-gradient(135deg,#10b981,#0d9488)', read: true }
    ];

    const WHATSAPP_CHATS = [
        { name: 'Recruiter', initials: 'RC', last: 'Thanks for applying!', time: '09:41', unread: 2, grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
        { name: 'Nova Dev Team', initials: 'ND', last: 'Great demo today', time: '08:12', unread: 0, grad: 'linear-gradient(135deg,#60a5fa,#a78bfa)' },
        { name: 'University', initials: 'UN', last: 'Reminder: project submission Friday', time: 'Yesterday', unread: 0, grad: 'linear-gradient(135deg,#f472b6,#fb923c)' },
        { name: 'Mentor', initials: 'ME', last: 'Keep building!', time: 'Mon', unread: 0, grad: 'linear-gradient(135deg,#fbbf24,#f43f5e)' }
    ];

    const WHATSAPP_MESSAGES = {
        0: [
            { from: 'them', text: 'Hi! We received your portfolio.', time: '09:38' },
            { from: 'me', text: 'Thanks so much, glad it arrived!', time: '09:39' },
            { from: 'them', text: 'The Nova chatbot project impressed the team.', time: '09:40' }
        ],
        1: [
            { from: 'them', text: 'Merged your PR - nice work.', time: '08:05' },
            { from: 'me', text: 'Thank you! Happy to help.', time: '08:10' },
            { from: 'them', text: 'Great demo today', time: '08:12' }
        ],
        2: [
            { from: 'them', text: 'Reminder: project submission is due Friday.', time: 'Yesterday' },
            { from: 'them', text: 'Make sure the report draft is uploaded.', time: 'Yesterday' }
        ],
        3: [
            { from: 'me', text: 'Shipped the portfolio update!', time: 'Mon' },
            { from: 'them', text: 'Keep building!', time: 'Mon' }
        ]
    };

    // TODO: Replace the simulated Resume.pdf preview with the real resume file
    //       (e.g. mobile/media/Resume.pdf) when it is ready.
    const DRIVE_FILES = [
        { name: 'Resume.pdf', kind: 'pdf', meta: 'PDF · Updated today', src: 'assets/resume/Pinaki_Das_CV.pdf' },
        { name: 'Certificates', kind: 'folder', meta: 'Folder · 5 items' },
        { name: 'Projects', kind: 'folder', meta: 'Folder · 3 items' },
        { name: 'CoverLetter.docx', kind: 'doc', meta: 'DOCX · 45 KB' },
        { name: 'Projects-2026.md', kind: 'doc', meta: 'MD · 8 KB' }
    ];

    const RESUME = {
        summary: 'Aspiring AI Engineer and Computer Science undergraduate with a strong project-driven foundation in Python, LLMs, Prompt Engineering, and Retrieval-Augmented Generation (RAG).',
        experience: [
            { role: 'AI Project Developer', org: 'Self-Initiated Projects', years: '2024 - Present' },
            { role: 'B.Tech Student (CSE)', org: 'Swami Vivekananda University', years: '2023 - 2027' }
        ],
        education: [
            { degree: 'B.Tech, Computer Science & Engineering', org: 'Swami Vivekananda University', years: 'Expected 2027' },
            { degree: 'Higher Secondary (WBCHSE)', org: 'West Bengal Council', years: '2023 · 71.6%' },
            { degree: 'Secondary (WBBSE)', org: 'West Bengal Board', years: '2021 · 91%' }
        ]
    };

    const INSTA_STORIES = [
        { name: 'AI', initials: 'AI', grad: 'linear-gradient(135deg,#f58529,#dd2a7b)' },
        { name: 'Python', initials: 'Py', grad: 'linear-gradient(135deg,#8134af,#515bd4)' },
        { name: 'Projects', initials: 'P', grad: 'linear-gradient(135deg,#f09433,#e6683c)' },
        { name: 'Code', initials: 'C', grad: 'linear-gradient(135deg,#17e9b6,#0ea5e9)' },
        { name: 'Design', initials: 'D', grad: 'linear-gradient(135deg,#a259ff,#ff7262)' }
    ];

    // TODO: Replace these gradient tiles with real project/photo screenshots.
    const INSTA_POSTS = [
        { grad: 'linear-gradient(135deg,#60a5fa,#818cf8)' },
        { grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
        { grad: 'linear-gradient(135deg,#fbbf24,#f43f5e)' },
        { grad: 'linear-gradient(135deg,#a78bfa,#ec4899)' },
        { grad: 'linear-gradient(135deg,#f472b6,#fb923c)' },
        { grad: 'linear-gradient(135deg,#38bdf8,#10b981)' }
    ];

    // TODO: Replace these gradient tiles with real certificate scans and
    //       project screenshots (e.g. assets/icons/* or a photos/ folder).
    const PHOTOS = [
        { name: 'Introduction to AI', grad: 'linear-gradient(135deg,#60a5fa,#818cf8)' },
        { name: 'Productivity with AI Tools', grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
        { name: 'AWS Power Hour: GenAI', grad: 'linear-gradient(135deg,#f472b6,#fb923c)' },
        { name: 'PyTorch & DL (LFS116)', grad: 'linear-gradient(135deg,#a78bfa,#ec4899)' },
        { name: 'Planning a GenAI Project', grad: 'linear-gradient(135deg,#fbbf24,#f59e0b)' },
        { name: 'Nova — AI Chatbot', grad: 'linear-gradient(135deg,#38bdf8,#10b981)' },
        { name: 'Object Detection App', grad: 'linear-gradient(135deg,#2dd4bf,#6366f1)' },
        { name: 'Eighth Wonder Generator', grad: 'linear-gradient(135deg,#fb7185,#f59e0b)' },
        { name: 'Profile Photo', grad: 'linear-gradient(135deg,#64748b,#0f172a)' }
    ];

    const ALBUMS = [
        { name: 'Certificates', count: 5, grad: 'linear-gradient(135deg,#60a5fa,#818cf8)' },
        { name: 'Projects', count: 3, grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
        { name: 'About Me', count: 4, grad: 'linear-gradient(135deg,#a78bfa,#ec4899)' }
    ];

    const FB_POSTS = [
        { who: 'Pinaki Das', time: '2h', grad: 'linear-gradient(135deg,#60a5fa,#a78bfa)', text: 'Just shipped Nova, a local AI chatbot with streaming conversations, file analysis, web search and deep research, built with FastAPI and the Groq API.', likes: '48', comments: '7', photo: true },
        { who: 'Pinaki Das', time: '1d', grad: 'linear-gradient(135deg,#f472b6,#fb923c)', text: 'Exploring RAG pipelines with Ollama and Llama 3.2 - building a project idea generator for aspiring developers.', likes: '31', comments: '4', photo: false }
    ];

    /* ============================================================
     * CONTENT BUILDERS
     * ============================================================ */

    /** Wraps app content in the standard app chrome (topbar + scroll area). */
    function appShell(opts) {
        const theme = opts.theme === 'dark' ? 'android-app--dark' : 'android-app--light';
        const accent = opts.accent ? ' style="--android-accent:' + esc(opts.accent) + '"' : '';
        const defaultTopbar =
            '<header class="android-app__topbar">' +
            '<button class="android-app__topbtn android-ripple-target" data-action="app-back" aria-label="Back">' + I.arrowBack + '</button>' +
            '<h2 class="android-app__title" data-chat-title>' + esc(opts.title) + '</h2>' +
            '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="More options">' + I.more + '</button>' +
            '</header>';
        return (
            '<section class="android-app ' + theme + '" role="dialog" aria-label="' + esc(opts.title) + '" tabindex="-1"' +
            ' data-app="' + esc(opts.appId) + '"' + accent + '>' +
            (opts.topbar || defaultTopbar) +
            '<div class="android-app__content">' + opts.content + '</div>' +
            '</section>'
        );
    }

    function sectionTitle(text, extra) {
        return '<h3 class="android-section-title">' + esc(text) + (extra || '') + '</h3>';
    }

    function avatar(initials, size, grad) {
        return '<span class="android-avatar' + (size ? ' android-avatar--' + size : '') + '" style="--g:' + grad + '">' + esc(initials) + '</span>';
    }

    /* ============================================================
     * SCREEN RENDERERS
     * ============================================================ */

    function renderYouTube() {
        const cards = PROJECTS.map(function (v, i) {
            return (
                '<article class="youtube__card android-ripple-target" data-action="play-video" data-idx="' + i + '" tabindex="0" role="button" aria-label="Play video: ' + esc(v.title) + '">' +
                '<div class="youtube__thumb" style="--g:linear-gradient(135deg,' + v.c1 + ',' + v.c2 + ')">' +
                '<span class="youtube__play">' + I.play + '</span>' +
                '<span class="youtube__dur">' + esc(v.dur) + '</span>' +
                '</div>' +
                '<div class="youtube__info">' +
                '<span class="youtube__title">' + esc(v.title) + '</span>' +
                '<span class="youtube__meta">' + esc(v.views) + ' views · ' + esc(v.time) + '</span>' +
                '</div>' +
                '</article>'
            );
        }).join('');

        return appShell({
            appId: 'youtube',
            title: 'YouTube',
            theme: 'dark',
            accent: '#FF0000',
            content:
                '<div class="youtube__channel">' +
                '<div class="youtube__banner"></div>' +
                '<div class="youtube__row">' +
                avatar(PROFILE.name.charAt(0), 'lg', 'linear-gradient(135deg,#f43f5e,#f97316)') +
                '<div class="youtube__who"><strong>' + esc(PROFILE.name) + '</strong>' +
                '<span>@' + esc(PROFILE.handle) + ' · ' + esc(PROFILE.subs) + ' subscribers</span></div>' +
                '</div>' +
                '<p class="youtube__desc">' + esc(PROFILE.ytDesc) + '</p>' +
                '<button class="android-btn android-btn--subscribe android-ripple-target" data-action="youtube-sub">Subscribe</button>' +
                '</div>' +
                '<nav class="youtube__tabs" aria-label="YouTube sections">' +
                '<button class="youtube__tab is-active" aria-selected="true">Home</button>' +
                '<button class="youtube__tab" aria-selected="false">Shorts</button>' +
                '<button class="youtube__tab" aria-selected="false">Subscriptions</button>' +
                '</nav>' +
                '<div class="youtube__grid">' + cards + '</div>' +
                '<div class="youtube__player" hidden>' +
                '<button class="youtube__player-close android-ripple-target" data-action="close-video" aria-label="Close player">' + I.close + '</button>' +
                '<div class="youtube__stage" style="--g:linear-gradient(135deg,#f43f5e,#f97316)">' +
                '<button class="youtube__bigplay android-ripple-target" aria-label="Play">' + I.play + '</button>' +
                '</div>' +
                '<div class="youtube__player-info">' +
                '<strong class="youtube__player-title"></strong>' +
                '<span class="youtube__player-meta"></span>' +
                '</div>' +
                '<div class="youtube__controls"><div class="youtube__bar"><span></span></div></div>' +
                '</div>'
        });
    }

    function renderContacts() {
        const items = [
            { icon: I.phone, title: 'Phone', sub: PROFILE.phone },
            { icon: I.email, title: 'Email', sub: PROFILE.email },
            { icon: I.globe, title: 'Website', sub: PROFILE.website },
            { icon: I.location, title: 'Location', sub: PROFILE.location },
            { icon: I.github, title: 'GitHub', sub: PROFILE.github },
            { icon: I.linkedin, title: 'LinkedIn', sub: PROFILE.linkedin }
        ].map(function (item, i) {
            return (
                '<li class="android-list__item android-ripple-target" data-action="contact-copy" data-label="' + esc(item.title) + '" tabindex="0" role="button" aria-label="Copy ' + esc(item.title) + '">' +
                '<span class="android-list__icon" style="--g:linear-gradient(135deg,#0ea5e9,#2563eb)">' + item.icon + '</span>' +
                '<div class="android-list__body"><span class="android-list__title">' + esc(item.title) + '</span>' +
                '<span class="android-list__sub">' + esc(item.sub) + '</span></div>' +
                '<span class="android-list__meta">Copy</span>' +
                '</li>'
            );
        }).join('');

        return appShell({
            appId: 'contacts',
            title: 'Contacts',
            theme: 'light',
            accent: '#0F6CBD',
            content:
                '<div class="contacts__hero">' +
                avatar(PROFILE.name.charAt(0), 'xl', 'linear-gradient(135deg,#0ea5e9,#2563eb)') +
                '<h1>' + esc(PROFILE.name) + '</h1>' +
                '<p>' + esc(PROFILE.headline) + '</p>' +
                '<div class="contacts__actions">' +
                '<button class="android-btn android-btn--round android-ripple-target" data-action="contact-call" aria-label="Call">' + I.phone + '</button>' +
                '<button class="android-btn android-btn--round android-ripple-target" data-action="contact-sms" aria-label="Message">' + I.message + '</button>' +
                '<button class="android-btn android-btn--round android-ripple-target" data-action="contact-mail" aria-label="Email">' + I.email + '</button>' +
                '</div>' +
                '</div>' +
                '<ul class="android-list">' + items + '</ul>'
        });
    }

    function renderWhatsApp() {
        const chats = WHATSAPP_CHATS.map(function (c, i) {
            return (
                '<li class="whatsapp__chat android-ripple-target" data-action="open-chat" data-idx="' + i + '" tabindex="0" role="button" aria-label="Open chat with ' + esc(c.name) + '">' +
                avatar(c.initials, null, c.grad) +
                '<div class="whatsapp__who"><strong>' + esc(c.name) + '</strong><span>' + esc(c.last) + '</span></div>' +
                '<div class="whatsapp__time"><time>' + esc(c.time) + '</time>' +
                (c.unread ? '<span class="whatsapp__badge">' + c.unread + '</span>' : '') +
                '</div>' +
                '</li>'
            );
        }).join('');

        const threads = WHATSAPP_CHATS.map(function (c, i) {
            const msgs = (WHATSAPP_MESSAGES[i] || []).map(function (m) {
                return (
                    '<div class="whatsapp__msg ' + (m.from === 'me' ? 'is-me' : '') + '">' +
                    '<div class="whatsapp__bubble">' + esc(m.text) +
                    '<time>' + esc(m.time) + '</time></div></div>'
                );
            }).join('');
            return (
                '<div class="whatsapp__thread" data-thread="' + i + '" hidden>' +
                '<div class="whatsapp__msgs">' + msgs + '</div>' +
                '<form class="whatsapp__input" data-form="whatsapp" data-thread="' + i + '">' +
                '<button type="button" class="whatsapp__ico" aria-label="Emoji">' + I.smile + '</button>' +
                '<input type="text" placeholder="Message" aria-label="Message" autocomplete="off">' +
                '<button type="submit" class="whatsapp__send" aria-label="Send">' + I.send + '</button>' +
                '</form></div>'
            );
        }).join('');

        return appShell({
            appId: 'whatsapp',
            title: 'WhatsApp',
            theme: 'light',
            accent: '#25D366',
            topbar:
                '<header class="android-app__topbar">' +
                '<button class="android-app__topbtn android-ripple-target" data-action="whatsapp-back" aria-label="Back">' + I.arrowBack + '</button>' +
                '<h2 class="android-app__title" data-chat-title>WhatsApp</h2>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="More options">' + I.more + '</button>' +
                '</header>',
            content:
                '<div class="whatsapp__search"><span>' + I.search + '</span><input type="text" placeholder="Search chats" aria-label="Search chats"></div>' +
                '<ul class="whatsapp__chats" data-chat-list>' + chats + '</ul>' +
                threads
        });
    }

    function renderChrome() {
        return appShell({
            appId: 'chrome',
            title: 'Chrome',
            theme: 'light',
            accent: '#4285F4',
            topbar:
                '<header class="chrome__topbar">' +
                '<span class="chrome__tab"><span class="chrome__favicon">' + I.chrome + '</span>Portfolio</span>' +
                '<div class="chrome__url"><span>' + I.lock + '</span><span class="chrome__url-text">github.com/DASPINAKI2005</span></div>' +
                '<div class="chrome__tools">' +
                '<button class="android-app__topbtn android-ripple-target" data-action="chrome-refresh" aria-label="Refresh page">' + I.refresh + '</button>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-back" aria-label="Close browser">' + I.close + '</button>' +
                '</div>' +
                '</header>',
            content:
                '<div class="chrome__page">' +
                '<header class="chrome__hero">' +
                avatar(PROFILE.name.charAt(0), 'xl', 'linear-gradient(135deg,#818cf8,#ec4899)') +
                '<h1>' + esc(PROFILE.name) + '</h1>' +
                '<p>' + esc(PROFILE.role) + ' · ' + esc(PROFILE.location) + '</p>' +
                '<div class="chrome__herobtns">' +
                '<button class="android-btn android-ripple-target" data-action="open-app" data-app="drive">Resume</button>' +
                '<button class="android-btn android-btn--outline android-ripple-target" data-action="open-app" data-app="youtube">Projects</button>' +
                '</div>' +
                '</header>' +
                '<section class="chrome__section">' + sectionTitle('Highlights') +
                '<div class="chrome__cards">' +
                '<button class="chrome__card android-ripple-target" data-action="open-app" data-app="gmail"><span class="chrome__card-ico">' + I.email + '</span><div><strong>Get in touch</strong><span>Open my inbox</span></div>' + I.arrowBack + '</button>' +
                '<button class="chrome__card android-ripple-target" data-action="open-app" data-app="playstore"><span class="chrome__card-ico">' + I.playstore + '</span><div><strong>My toolbox</strong><span>Skills & technologies</span></div>' + I.arrowBack + '</button>' +
                '<button class="chrome__card android-ripple-target" data-action="open-app" data-app="photos"><span class="chrome__card-ico">' + I.photos + '</span><div><strong>Certificates</strong><span>View gallery</span></div>' + I.arrowBack + '</button>' +
                '<button class="chrome__card android-ripple-target" data-action="open-app" data-app="chatgpt"><span class="chrome__card-ico">' + I.chatgpt + '</span><div><strong>Ask the assistant</strong><span>Chat with my AI</span></div>' + I.arrowBack + '</button>' +
                '</div></section>' +
                '<footer class="chrome__foot">© 2026 ' + esc(PROFILE.name) + ' · Built with a phone simulation</footer>' +
                '</div>'
        });
    }

    function renderGmail() {
        const rows = EMAILS.map(function (m, i) {
            return (
                '<li class="gmail__row android-ripple-target" data-action="gmail-open" data-idx="' + i + '" tabindex="0" role="button" aria-label="Open email from ' + esc(m.sender) + '">' +
                '<span class="gmail__sender" style="--g:' + m.grad + '">' + esc(m.sender.charAt(0)) + '</span>' +
                '<div class="gmail__body">' +
                '<div class="gmail__line"><strong>' + esc(m.sender) + '</strong><time>' + esc(m.time) + '</time></div>' +
                '<div class="gmail__subject">' + esc(m.subject) + '</div>' +
                '<div class="gmail__snippet">' + esc(m.snippet) + '</div>' +
                '</div>' +
                '</li>'
            );
        }).join('');

        const detail = EMAILS.map(function (m, i) {
            return (
                '<article class="gmail__detail" data-detail="' + i + '" hidden>' +
                '<header class="gmail__detail-head">' +
                '<span class="gmail__sender gmail__sender--lg" style="--g:' + m.grad + '">' + esc(m.sender.charAt(0)) + '</span>' +
                '<div><strong>' + esc(m.sender) + '</strong><span>to me · ' + esc(m.time) + '</span></div>' +
                '</header>' +
                '<h2 class="gmail__detail-subject">' + esc(m.subject) + '</h2>' +
                '<p class="gmail__detail-body">' + esc(m.snippet) + ' This is a simulated inbox inside the portfolio. In a real build this would open the actual message thread.</p>' +
                '</article>'
            );
        }).join('');

        return appShell({
            appId: 'gmail',
            title: 'Gmail',
            theme: 'light',
            accent: '#EA4335',
            content:
                '<div class="gmail__toolbar">' +
                '<button class="android-app__topbtn android-ripple-target" data-action="gmail-menu" aria-label="Menu">' + I.more + '</button>' +
                '<span class="gmail__search">' + I.search + '<input type="text" placeholder="Search mail" aria-label="Search mail"></span>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Account">' + I.account + '</button>' +
                '</div>' +
                '<div class="gmail__tabs">' +
                '<button class="gmail__tab is-active" aria-selected="true">Primary</button>' +
                '<button class="gmail__tab" aria-selected="false">Social</button>' +
                '<button class="gmail__tab" aria-selected="false">Promotions</button>' +
                '</div>' +
                '<ul class="gmail__list">' + rows + '</ul>' +
                detail +
                '<div class="gmail__compose" hidden>' +
                '<div class="gmail__compose-head"><strong>New message</strong>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="gmail-close-compose" aria-label="Close compose">' + I.close + '</button></div>' +
                '<form data-form="gmail-compose">' +
                '<input class="gmail__field" type="text" placeholder="To" aria-label="To">' +
                '<input class="gmail__field" type="text" placeholder="Subject" aria-label="Subject">' +
                '<textarea class="gmail__field gmail__field--area" placeholder="Write your message..." aria-label="Message body"></textarea>' +
                '<div class="gmail__compose-foot">' +
                '<button type="submit" class="android-btn android-ripple-target">Send</button>' +
                '<button type="button" class="android-btn android-btn--outline android-ripple-target" data-action="gmail-close-compose">Discard</button>' +
                '</div>' +
                '</form></div>' +
                '<button class="android-fab android-ripple-target" data-action="gmail-compose" aria-label="Compose email">' + I.edit + '</button>'
        });
    }

    function renderMaps() {
        const roads =
            '<svg class="maps__roads" viewBox="0 0 400 640" preserveAspectRatio="none" aria-hidden="true">' +
            '<path class="maps__road maps__road--h" d="M0 120h400M0 260h400M0 430h400M0 560h400"/>' +
            '<path class="maps__road maps__road--v" d="M90 0v640M210 0v640M320 0v640"/>' +
            '<path class="maps__road maps__road--a" d="M0 80 L400 320 M0 500 L340 640"/>' +
            '<rect class="maps__blk" x="120" y="140" width="60" height="60" rx="8"/><rect class="maps__blk" x="330" y="150" width="50" height="70" rx="8"/>' +
            '<rect class="maps__blk" x="100" y="450" width="80" height="50" rx="8"/><rect class="maps__blk" x="240" y="470" width="60" height="60" rx="8"/>' +
            '<rect class="maps__blk" x="130" y="280" width="50" height="70" rx="8"/>' +
            '</svg>';

        return appShell({
            appId: 'maps',
            title: 'Maps',
            theme: 'light',
            accent: '#EA4335',
            content:
                '<div class="maps__canvas">' +
                '<div class="maps__terrain"></div>' +
                roads +
                '<div class="maps__pin"><span class="maps__pin-pulse"></span><span class="maps__pin-dot"></span></div>' +
                '<button class="android-fab maps__fab android-ripple-target" data-action="maps-locate" aria-label="Center on my location">' + I.location + '</button>' +
                '<div class="maps__search">' + I.search + '<span>' + esc(PROFILE.location) + '</span></div>' +
                '<div class="maps__card">' +
                avatar(PROFILE.name.charAt(0), null, 'linear-gradient(135deg,#34d399,#0ea5e9)') +
                '<div class="maps__info"><strong>' + esc(PROFILE.name) + '</strong><span>' + esc(PROFILE.location) + ' · work</span></div>' +
                '<button class="android-btn android-ripple-target" data-action="maps-directions">Directions</button>' +
                '</div>' +
                '</div>'
        });
    }

    function renderInstagram() {
        const posts = INSTA_POSTS.map(function (p, i) {
            return '<div class="insta__tile android-ripple-target" data-action="open-viewer" data-idx="' + i + '" style="--g:' + p.grad + '" role="button" tabindex="0" aria-label="Open photo ' + (i + 1) + '"></div>';
        }).join('');

        const stories = INSTA_STORIES.map(function (s) {
            return (
                '<span class="insta__story">' +
                '<span class="insta__story-ring">' + avatar(s.initials, null, s.grad) + '</span>' +
                '<em>' + esc(s.name) + '</em>' +
                '</span>'
            );
        }).join('');

        return appShell({
            appId: 'instagram',
            title: 'Instagram',
            theme: 'light',
            accent: '#DD2A7B',
            content:
                '<div class="insta__profile">' +
                '<div class="insta__head">' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-back" aria-label="Back">' + I.arrowBack + '</button>' +
                '<strong>' + esc(PROFILE.handle) + '</strong>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Options">' + I.more + '</button>' +
                '</div>' +
                '<div class="insta__stats">' +
                '<span class="insta__ring"><span class="android-avatar android-avatar--xl" style="--g:linear-gradient(135deg,#f58529,#dd2a7b,#8134af)">' + esc(PROFILE.name.charAt(0)) + '</span></span>' +
                '<div class="insta__nums">' +
                '<div><strong>42</strong><span>posts</span></div>' +
                '<div><strong>1.2K</strong><span>followers</span></div>' +
                '<div><strong>310</strong><span>following</span></div>' +
                '</div>' +
                '</div>' +
                '<div class="insta__bio"><strong>' + esc(PROFILE.name) + '</strong><span>' + esc(PROFILE.instaBio) + '</span></div>' +
                '<div class="insta__actions">' +
                '<button class="insta__edit android-ripple-target" data-action="insta-edit">Edit profile</button>' +
                '<button class="insta__edit android-ripple-target" data-action="insta-share">Share profile</button>' +
                '</div>' +
                '<div class="insta__stories">' + stories + '</div>' +
                '</div>' +
                '<div class="insta__grid">' + posts + '</div>' +
                '<div class="insta__viewer" hidden>' +
                '<button class="insta__viewer-close android-ripple-target" data-action="close-viewer" aria-label="Close photo">' + I.close + '</button>' +
                '<div class="insta__viewer-stage" style="--g:linear-gradient(135deg,#60a5fa,#818cf8)"></div>' +
                '<div class="insta__viewer-actions">' +
                '<button class="insta__viewer-btn android-ripple-target" data-action="viewer-like" aria-label="Like">' + I.heart + '</button>' +
                '<button class="insta__viewer-btn android-ripple-target" data-action="app-more" aria-label="Comment">' + I.comment + '</button>' +
                '<button class="insta__viewer-btn android-ripple-target" data-action="app-more" aria-label="Share">' + I.share + '</button>' +
                '</div>' +
                '</div>'
        });
    }

    function renderFacebook() {
        const posts = FB_POSTS.map(function (p) {
            return (
                '<article class="fb__post">' +
                '<div class="fb__post-head">' + avatar(p.who.charAt(0), null, p.grad) +
                '<div><strong>' + esc(p.who) + '</strong><span>' + esc(p.time) + ' · Public</span></div>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Post options">' + I.more + '</button>' +
                '</div>' +
                '<p class="fb__post-text">' + esc(p.text) + '</p>' +
                (p.photo ? '<div class="fb__post-photo" style="--g:' + p.grad + '"></div>' : '') +
                '<div class="fb__post-stats"><span>' + esc(p.likes) + ' likes</span><span>' + esc(p.comments) + ' comments · 2 shares</span></div>' +
                '<div class="fb__post-actions">' +
                '<button class="android-ripple-target" data-action="fb-like" data-count="' + p.likes + '">' + I.thumb + '<span>Like</span></button>' +
                '<button class="android-ripple-target" data-action="app-more">' + I.comment + '<span>Comment</span></button>' +
                '<button class="android-ripple-target" data-action="app-more">' + I.share + '<span>Share</span></button>' +
                '</div>' +
                '</article>'
            );
        }).join('');

        return appShell({
            appId: 'facebook',
            title: 'Facebook',
            theme: 'light',
            accent: '#1877F2',
            content:
                '<div class="fb__cover"></div>' +
                '<div class="fb__profile">' +
                avatar(PROFILE.name.charAt(0), 'xl', 'linear-gradient(135deg,#1877F2,#6db3ff)') +
                '<h1>' + esc(PROFILE.name) + '</h1>' +
                '<p>' + esc(PROFILE.headline) + '</p>' +
                '<div class="fb__actions">' +
                '<button class="android-btn android-ripple-target" data-action="fb-add" data-count="1568">' + I.personAdd + '<span>Friend</span></button>' +
                '<button class="android-btn android-btn--outline android-ripple-target" data-action="fb-message">' + I.message + '<span>Message</span></button>' +
                '</div>' +
                '</div>' +
                '<div class="fb__feed">' + sectionTitle('Posts') + posts + '</div>'
        });
    }

    function renderPhotos() {
        const tiles = PHOTOS.map(function (p, i) {
            return '<div class="photos__tile android-ripple-target" data-action="open-photo" data-idx="' + i + '" style="--g:' + p.grad + '" role="button" tabindex="0" aria-label="Open ' + esc(p.name) + '"></div>';
        }).join('');

        const albums = ALBUMS.map(function (a) {
            return (
                '<div class="photos__album">' +
                '<div class="photos__album-thumb" style="--g:' + a.grad + '">' + I.award + '</div>' +
                '<strong>' + esc(a.name) + '</strong><span>' + a.count + ' items</span>' +
                '</div>'
            );
        }).join('');

        const memories = CERTS.slice(0, 4).map(function (c, i) {
            return '<div class="photos__memory android-ripple-target" data-action="open-photo" data-idx="' + i + '" style="--g:linear-gradient(135deg,' + c.color1 + ',' + c.color2 + ')" role="button" tabindex="0" aria-label="Open memory"></div>';
        }).join('');

        return appShell({
            appId: 'photos',
            title: 'Photos',
            theme: 'light',
            accent: '#4285F4',
            content:
                '<div class="photos__toolbar">' +
                '<h2 class="android-app__title">' + esc(PROFILE.name) + '\'s photos</h2>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Search photos">' + I.search + '</button>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Account">' + I.account + '</button>' +
                '</div>' +
                '<div class="photos__memories">' + memories + '</div>' +
                '<div class="photos__albums">' + sectionTitle('Albums') + '<div class="photos__album-grid">' + albums + '</div></div>' +
                '<div class="photos__grid">' + sectionTitle('All photos') + '<div class="photos__tile-grid">' + tiles + '</div></div>' +
                '<div class="insta__viewer" hidden>' +
                '<button class="insta__viewer-close android-ripple-target" data-action="close-viewer" aria-label="Close photo">' + I.close + '</button>' +
                '<div class="insta__viewer-stage" style="--g:linear-gradient(135deg,#60a5fa,#818cf8)"></div>' +
                '</div>'
        });
    }

    function renderDrive() {
        const files = DRIVE_FILES.map(function (f, i) {
            const icon = f.kind === 'folder' ? I.folder : f.kind === 'pdf' ? I.drivePdf : I.doc;
            return (
                '<li class="drive__file android-ripple-target" data-action="open-drive" data-idx="' + i + '" tabindex="0" role="button" aria-label="Open ' + esc(f.name) + '">' +
                '<span class="drive__file-ico drive__file-ico--' + f.kind + '">' + icon + '</span>' +
                '<div class="drive__file-body"><strong>' + esc(f.name) + '</strong><span>' + esc(f.meta) + '</span></div>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="File options">' + I.more + '</button>' +
                '</li>'
            );
        }).join('');

        return appShell({
            appId: 'drive',
            title: 'Drive',
            theme: 'light',
            accent: '#34A853',
            content:
                '<div class="drive__toolbar">' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Menu">' + I.more + '</button>' +
                '<span class="gmail__search">' + I.search + '<input type="text" placeholder="Search Drive" aria-label="Search Drive"></span>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="View options">' + I.grid + '</button>' +
                '</div>' +
                '<div class="drive__summary">' +
                '<div class="drive__summary-chart"><span></span></div>' +
                '<div><strong>8.2 GB of 15 GB used</strong><span>Manage storage</span></div>' +
                '</div>' +
                sectionTitle('Recent') +
                '<ul class="drive__list">' + files + '</ul>' +
                '<div class="drive__preview" hidden>' +
                '<div class="drive__preview-bar">' +
                '<button class="android-app__topbtn android-ripple-target" data-action="drive-close" aria-label="Back">' + I.arrowBack + '</button>' +
                '<span>Resume.pdf</span>' +
                '<button class="android-btn android-btn--sm android-ripple-target" data-action="drive-download">' + I.download + '<span>Download</span></button>' +
                '</div>' +
                '<div class="drive__page">' +
                '<div class="drive__page-head"><div class="drive__page-avatar"></div><div><strong>' + esc(PROFILE.name) + '</strong><span>' + esc(PROFILE.headline) + '</span></div></div>' +
                '<div class="drive__page-line drive__page-line--w40"></div>' +
                '<div class="drive__page-line drive__page-line--w70"></div>' +
                '<div class="drive__page-line drive__page-line--w55"></div>' +
                '<div class="drive__page-line"></div>' +
                '<div class="drive__page-line drive__page-line--w35"></div>' +
                '<div class="drive__page-sep"></div>' +
                '<div class="drive__page-line drive__page-line--w60"></div>' +
                '<div class="drive__page-line drive__page-line--w45"></div>' +
                '<div class="drive__page-line"></div>' +
                '<div class="drive__page-line drive__page-line--w50"></div>' +
                '<div class="drive__page-line drive__page-line--w65"></div>' +
                '<div class="drive__page-line drive__page-line--w40"></div>' +
                '</div>' +
                '</div>'
        });
    }

    function renderPlayStore() {
        const cards = SKILLS.map(function (s, i) {
            return (
                '<article class="store__app">' +
                '<span class="store__icon" style="--g:' + s.grad + '">' + esc(s.letter) + '</span>' +
                '<div class="store__info"><strong>' + esc(s.name) + '</strong>' +
                '<span>' + esc(s.cat) + ' · ' + esc(s.rating) + ' ★</span></div>' +
                '<button class="store__install android-ripple-target" data-action="install-skill" data-idx="' + i + '" data-installed="false">Install</button>' +
                '</article>'
            );
        }).join('');

        const chips = ['Top charts', 'Games', 'Apps', 'Education', 'Developer tools'].map(function (c, i) {
            return '<button class="store__chip' + (i === 0 ? ' is-active' : '') + ' android-ripple-target" data-action="app-more">' + esc(c) + '</button>';
        }).join('');

        return appShell({
            appId: 'playstore',
            title: 'Play Store',
            theme: 'light',
            accent: '#00A0FF',
            content:
                '<div class="drive__toolbar">' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Menu">' + I.more + '</button>' +
                '<span class="gmail__search">' + I.search + '<input type="text" placeholder="Search skills, tools" aria-label="Search the store"></span>' +
                '<button class="android-app__topbtn android-ripple-target" data-action="app-more" aria-label="Account">' + I.account + '</button>' +
                '</div>' +
                '<div class="store__chips">' + chips + '</div>' +
                sectionTitle('My skill stack') +
                '<div class="store__grid">' + cards + '</div>'
        });
    }

    function renderGoogle() {
        const links = [
            { app: 'gmail', name: 'Gmail', icon: I.gmail },
            { app: 'maps', name: 'Maps', icon: I.maps },
            { app: 'drive', name: 'Drive', icon: I.drive },
            { app: 'photos', name: 'Photos', icon: I.photos },
            { app: 'youtube', name: 'YouTube', icon: I.youtube },
            { app: 'playstore', name: 'Play Store', icon: I.playstore }
        ];
        const grid = links.map(function (l) {
            return (
                '<button class="google__link android-ripple-target" data-action="open-app" data-app="' + l.app + '">' +
                '<span class="google__link-ico">' + l.icon + '</span><span>' + esc(l.name) + '</span>' +
                '</button>'
            );
        }).join('');

        return appShell({
            appId: 'google',
            title: 'Google',
            theme: 'light',
            accent: '#4285F4',
            content:
                '<div class="google__logo"><span class="google__g">' + I.google + '</span></div>' +
                '<form class="google__search" data-form="google-search" role="search">' +
                '<span>' + I.search + '</span>' +
                '<input type="text" placeholder="Search or type a URL" aria-label="Google search" autocomplete="off">' +
                '<button type="button" class="android-app__topbtn" data-action="google-voice" aria-label="Voice search">' + I.mic + '</button>' +
                '</form>' +
                '<div class="google__chips">' +
                '<button class="google__chip is-active" data-action="app-more">All</button>' +
                '<button class="google__chip" data-action="app-more">Images</button>' +
                '<button class="google__chip" data-action="app-more">News</button>' +
                '</div>' +
                '<div class="google__about">' +
                sectionTitle('About me') +
                '<p>' + esc(PROFILE.bio) + '</p>' +
                '<div class="google__facts">' +
                '<span>' + esc(PROFILE.role) + '</span><span>' + esc(PROFILE.location) + '</span>' +
                '<span>' + esc(PROFILE.website) + '</span>' +
                '</div>' +
                '</div>' +
                sectionTitle('Quick links') +
                '<div class="google__grid">' + grid + '</div>'
        });
    }

    function renderChatGPT() {
        const intro = [
            'Hi! I am the assistant inside this portfolio. Ask me about skills, projects, or how to reach me.',
            'Try: "what are your skills?", "show projects", or "contact".'
        ];
        const msgs = intro.map(function (t) {
            return '<div class="chatgpt__msg is-assistant"><span class="chatgpt__avatar">' + I.chatgpt + '</span><div class="chatgpt__bubble">' + esc(t) + '</div></div>';
        }).join('');

        return appShell({
            appId: 'chatgpt',
            title: 'ChatGPT',
            theme: 'dark',
            accent: '#10A37F',
            content:
                '<div class="chatgpt__msgs" data-chat="chatgpt">' + msgs + '</div>' +
                '<form class="chatgpt__input" data-form="chatgpt">' +
                '<input type="text" placeholder="Message your portfolio assistant" aria-label="Message" autocomplete="off">' +
                '<button type="submit" class="chatgpt__send android-ripple-target" aria-label="Send message">' + I.send + '</button>' +
                '</form>'
        });
    }

    /* ============================================================
     * APP REGISTRY
     * ============================================================ */

    const APPS = [
        { id: 'youtube', name: 'YouTube', icon: I.youtube, accent: '#FF0000', theme: 'dark', splash: 'linear-gradient(135deg,#FF0000,#7f1d1d)', render: renderYouTube },
        { id: 'contacts', name: 'Contacts', icon: I.contacts, accent: '#0F6CBD', theme: 'light', splash: 'linear-gradient(135deg,#0F6CBD,#0b4a7a)', render: renderContacts },
        { id: 'gmail', name: 'Gmail', icon: I.gmail, accent: '#EA4335', theme: 'light', splash: 'linear-gradient(135deg,#EA4335,#a4123f)', render: renderGmail },
        { id: 'maps', name: 'Maps', icon: I.maps, accent: '#EA4335', theme: 'light', splash: 'linear-gradient(135deg,#34a853,#0f7b3e)', render: renderMaps },
        { id: 'instagram', name: 'Instagram', icon: I.instagram, accent: '#DD2A7B', theme: 'light', splash: 'linear-gradient(135deg,#f58529,#8134af)', render: renderInstagram },
        { id: 'facebook', name: 'Facebook', icon: I.facebook, accent: '#1877F2', theme: 'light', splash: 'linear-gradient(135deg,#1877F2,#0d4fa8)', render: renderFacebook },
        { id: 'photos', name: 'Photos', icon: I.photos, accent: '#4285F4', theme: 'light', splash: 'linear-gradient(135deg,#4285F4,#1d4ed8)', render: renderPhotos },
        { id: 'drive', name: 'Drive', icon: I.drive, accent: '#34A853', theme: 'light', splash: 'linear-gradient(135deg,#34A853,#1e8449)', render: renderDrive },
        { id: 'chatgpt', name: 'ChatGPT', icon: I.chatgpt, accent: '#10A37F', theme: 'dark', splash: 'linear-gradient(135deg,#10A37F,#0b7f61)', render: renderChatGPT },
        { id: 'whatsapp', name: 'WhatsApp', icon: I.whatsapp, accent: '#25D366', theme: 'light', dock: true, splash: 'linear-gradient(135deg,#25D366,#128C7E)', render: renderWhatsApp },
        { id: 'chrome', name: 'Chrome', icon: I.chrome, accent: '#4285F4', theme: 'light', dock: true, splash: 'linear-gradient(135deg,#EA4335,#FBBC05)', render: renderChrome },
        { id: 'playstore', name: 'Play Store', icon: I.playstore, accent: '#00A0FF', theme: 'light', dock: true, splash: 'linear-gradient(135deg,#00A0FF,#003d63)', render: renderPlayStore },
        { id: 'google', name: 'Google', icon: I.google, accent: '#4285F4', theme: 'light', dock: true, splash: 'linear-gradient(135deg,#4285F4,#EA4335)', render: renderGoogle }
    ];

    const BY_ID = {};
    APPS.forEach(function (a) {
        BY_ID[a.id] = a;
    });

    /* ============================================================
     * ACTION HANDLING (delegated)
     * ============================================================ */

    function findAppRoot(target) {
        return target.closest ? target.closest('.android-app') : null;
    }

    function showToast(message) {
        Android.Utils.toast(message);
    }

    const ACTIONS = {
        'app-back': function () {
            Android.AppManager.back();
        },
        'app-more': function (target) {
            showToast(target.getAttribute('aria-label') || 'More options');
        },
        'open-app': function (target) {
            Android.AppManager.open(target.dataset.app);
        },
        'youtube-sub': function () {
            showToast('Subscribed to ' + PROFILE.handle);
        },
        'play-video': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const idx = parseInt(target.dataset.idx, 10);
            const v = PROJECTS[idx];
            root.querySelector('.youtube__stage').style.setProperty('--g', 'linear-gradient(135deg,' + v.c1 + ',' + v.c2 + ')');
            root.querySelector('.youtube__player-title').textContent = v.title;
            root.querySelector('.youtube__player-meta').textContent = v.views + ' views · ' + v.dur;
            root.querySelector('.youtube__player').hidden = false;
            root.querySelector('.youtube__player').classList.add('is-open');
        },
        'close-video': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            root.querySelector('.youtube__player').hidden = true;
            root.querySelector('.youtube__player').classList.remove('is-open');
        },
        'contact-copy': function (target) {
            const label = target.dataset.label;
            const sub = target.querySelector('.android-list__sub');
            if (sub) {
                showToast(label + ' copied to clipboard');
            }
        },
        'contact-call': function () {
            showToast('Calling ' + PROFILE.phone + '...');
        },
        'contact-sms': function () {
            showToast('Opening WhatsApp to chat');
        },
        'contact-mail': function () {
            showToast('Opening mail app');
        },
        'open-chat': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const idx = target.dataset.idx;
            Android.Apps.state.whatsappOpen = parseInt(idx, 10);
            root.querySelector('[data-chat-list]').hidden = true;
            const thread = root.querySelector('[data-thread="' + idx + '"]');
            thread.hidden = false;
            root.querySelector('[data-chat-title]').textContent = WHATSAPP_CHATS[idx].name;
            thread.querySelector('.whatsapp__msgs').scrollTop = thread.querySelector('.whatsapp__msgs').scrollHeight;
        },
        'whatsapp-back': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const thread = root.querySelector('.whatsapp__thread:not([hidden])');
            if (thread) {
                thread.hidden = true;
                root.querySelector('[data-chat-list]').hidden = false;
                root.querySelector('[data-chat-title]').textContent = 'WhatsApp';
                Android.Apps.state.whatsappOpen = -1;
            } else {
                Android.AppManager.back();
            }
        },
        'gmail-menu': function () {
            showToast('Inbox menu');
        },
        'gmail-compose': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const compose = root.querySelector('.gmail__compose');
            compose.hidden = false;
            setTimeout(function () {
                compose.classList.add('is-open');
            }, 10);
        },
        'gmail-close-compose': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const compose = root.querySelector('.gmail__compose');
            compose.classList.remove('is-open');
            setTimeout(function () {
                compose.hidden = true;
            }, 220);
        },
        'gmail-open': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const idx = target.dataset.idx;
            root.querySelectorAll('.gmail__detail').forEach(function (d) {
                d.hidden = d.dataset.detail !== idx;
            });
        },
        'chrome-refresh': function () {
            showToast('Page refreshed');
        },
        'maps-directions': function () {
            showToast('Directions opened');
        },
        'maps-locate': function () {
            showToast('Locating you...');
        },
        'open-viewer': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const idx = parseInt(target.dataset.idx, 10);
            const p = INSTA_POSTS[idx];
            root.querySelector('.insta__viewer-stage').style.setProperty('--g', p.grad);
            root.querySelector('.insta__viewer').hidden = false;
            setTimeout(function () {
                root.querySelector('.insta__viewer').classList.add('is-open');
            }, 10);
        },
        'close-viewer': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const viewer = root.querySelector('.insta__viewer');
            viewer.classList.remove('is-open');
            setTimeout(function () {
                viewer.hidden = true;
            }, 220);
        },
        'viewer-like': function (target) {
            target.classList.toggle('is-liked');
        },
        'open-photo': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const idx = parseInt(target.dataset.idx, 10);
            const p = PHOTOS[idx];
            const stage = root.querySelector('.insta__viewer-stage');
            stage.style.setProperty('--g', p.grad);
            const cert = idx < CERTS.length && CERTS[idx].pdf ? CERTS[idx] : null;
            stage.innerHTML = cert
                ? '<iframe src="' + esc(cert.pdf) + '" style="width:100%;height:100%;border:0;display:block;background:#fff;"></iframe>'
                : '';
            root.querySelector('.insta__viewer').hidden = false;
            setTimeout(function () {
                root.querySelector('.insta__viewer').classList.add('is-open');
            }, 10);
        },
        'insta-edit': function () {
            showToast('Edit profile');
        },
        'insta-share': function () {
            showToast('Profile link copied');
        },
        'fb-like': function (target) {
            target.classList.toggle('is-liked');
        },
        'fb-add': function (target) {
            target.classList.add('is-done');
            showToast('Friend request sent');
        },
        'fb-message': function () {
            showToast('Opening Messenger');
        },
        'open-drive': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const idx = parseInt(target.dataset.idx, 10);
            const f = DRIVE_FILES[idx];
            if (f.kind !== 'pdf') {
                showToast('Opening ' + f.name + '...');
                return;
            }
            const page = root.querySelector('.drive__page');
            if (f.src) {
                page.innerHTML = '<iframe src="' + esc(f.src) + '" style="width:100%;height:100%;border:0;display:block;background:#fff;"></iframe>';
            }
            root.querySelector('.drive__preview').hidden = false;
            setTimeout(function () {
                root.querySelector('.drive__preview').classList.add('is-open');
            }, 10);
        },
        'drive-close': function (target) {
            const root = findAppRoot(target);
            if (!root) return;
            const preview = root.querySelector('.drive__preview');
            preview.classList.remove('is-open');
            setTimeout(function () {
                preview.hidden = true;
            }, 220);
        },
        'drive-download': function () {
            showToast('Resume downloaded');
        },
        'install-skill': function (target) {
            if (target.dataset.installed === 'true') {
                showToast('Opening ' + SKILLS[parseInt(target.dataset.idx, 10)].name);
                return;
            }
            target.textContent = 'Installing…';
            setTimeout(function () {
                target.textContent = 'Installed';
                target.dataset.installed = 'true';
                target.classList.add('is-installed');
                showToast('Added to skill stack');
            }, 1100);
        },
        'google-voice': function () {
            showToast('Listening...');
        }
    };

    /** Handles form submissions inside app screens. */
    function handleForm(form) {
        const kind = form.dataset.form;
        const root = findAppRoot(form);

        if (kind === 'whatsapp') {
            const input = form.querySelector('input');
            const text = input.value.trim();
            if (!text) return;
            input.value = '';
            const idx = form.dataset.thread;
            const msgEl = document.createElement('div');
            msgEl.className = 'whatsapp__msg is-me';
            msgEl.innerHTML = '<div class="whatsapp__bubble">' + esc(text) + '<time>' +
                new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</time></div>';
            form.previousElementSibling.appendChild(msgEl);
            WHATSAPP_MESSAGES[idx].push({ from: 'me', text: text, time: 'now' });
            WHATSAPP_CHATS[idx].last = text;
            WHATSAPP_CHATS[idx].time = 'now';
            const list = root.querySelector('[data-chat-list]');
            if (list && !list.hidden) list.hidden = true;
            form.parentElement.querySelector('.whatsapp__msgs').scrollTop = form.parentElement.querySelector('.whatsapp__msgs').scrollHeight;
        }

        if (kind === 'gmail-compose') {
            showToast('Message sent');
            form.reset();
            root.querySelector('.gmail__compose').classList.remove('is-open');
            setTimeout(function () {
                root.querySelector('.gmail__compose').hidden = true;
            }, 220);
        }

        if (kind === 'chatgpt') {
            const input = form.querySelector('input');
            const text = input.value.trim();
            if (!text) return;
            input.value = '';
            const msgs = form.previousElementSibling;
            msgs.appendChild(chatBubble('is-user', text));
            msgs.scrollTop = msgs.scrollHeight;
            const typing = document.createElement('div');
            typing.className = 'chatgpt__msg is-assistant';
            typing.innerHTML = '<span class="chatgpt__avatar">' + I.chatgpt + '</span><div class="chatgpt__bubble chatgpt__typing"><span></span><span></span><span></span></div>';
            msgs.appendChild(typing);
            msgs.scrollTop = msgs.scrollHeight;
            setTimeout(function () {
                typing.remove();
                const reply = chatgptReply(text);
                msgs.appendChild(chatBubble('is-assistant', reply));
                msgs.scrollTop = msgs.scrollHeight;
            }, 800);
        }

        if (kind === 'google-search') {
            const q = form.querySelector('input').value.trim();
            if (q) {
                showToast('Searching "' + q + '"');
                form.reset();
            }
        }
    }

    function chatBubble(role, text) {
        const el = document.createElement('div');
        el.className = 'chatgpt__msg ' + role;
        if (role === 'is-assistant') {
            el.innerHTML = '<span class="chatgpt__avatar">' + I.chatgpt + '</span>';
        }
        const bubble = document.createElement('div');
        bubble.className = 'chatgpt__bubble';
        bubble.textContent = text;
        el.appendChild(bubble);
        return el;
    }

    /** Tiny canned-response bot for the ChatGPT app. */
    function chatgptReply(input) {
        const q = input.toLowerCase();
        if (q.indexOf('skill') > -1) return 'My core stack: Python, JavaScript, SQL, FastAPI, Flask and PostgreSQL. I also work with LLMs, Prompt Engineering and RAG - the full list lives in the Play Store app.';
        if (q.indexOf('project') > -1 || q.indexOf('work') > -1) return 'I have built 3 real-world projects - open YouTube to browse them, including Nova, an AI chatbot, and a real-time object detection web app.';
        if (q.indexOf('contact') > -1 || q.indexOf('email') > -1 || q.indexOf('reach') > -1) return 'You can reach me at ' + PROFILE.email + ' or open the Contacts app for every channel.';
        if (q.indexOf('hi') > -1 || q.indexOf('hello') > -1 || q.indexOf('hey') > -1) return 'Hey there! Ask me about skills, projects or ways to get in touch.';
        if (q.indexOf('resume') > -1 || q.indexOf('cv') > -1) return 'Open the Drive app and tap Resume.pdf - it opens the full resume PDF.';
        return 'Good question! Try asking about skills, projects, or contact details - this assistant keeps its answers in the portfolio.';
    }

    /* ============================================================
     * MODULE EXPORT
     * ============================================================ */

    Android.Apps = {
        state: {
            whatsappOpen: -1
        },
        /** Shared portfolio content, also consumed by the desktop build. */
        data: {
            profile: PROFILE,
            certs: CERTS,
            resume: RESUME
        },
        all: APPS,
        byId: BY_ID,
        gridApps: APPS.filter(function (a) {
            return !a.dock;
        }),
        dockApps: APPS.filter(function (a) {
            return !!a.dock;
        }),
        get: function (id) {
            return BY_ID[id] || null;
        },
        render: function (id) {
            const app = BY_ID[id];
            return app ? app.render() : '';
        },
        /** Binds delegated click / submit / key handling on the apps mount. */
        bind: function (mount) {
            mount.addEventListener('click', function (e) {
                const target = e.target.closest ? e.target.closest('[data-action]') : null;
                if (!target) return;
                const action = target.dataset.action;
                if (ACTIONS[action]) {
                    ACTIONS[action](target);
                }
            });

            mount.addEventListener('submit', function (e) {
                const form = e.target.closest ? e.target.closest('[data-form]') : null;
                if (form) {
                    e.preventDefault();
                    handleForm(form);
                }
            });

            mount.addEventListener('keydown', function (e) {
                const target = e.target.closest ? e.target.closest('[data-action]') : null;
                if (!target) return;
                if (e.key !== 'Enter' && e.key !== ' ') return;
                if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                const action = target.dataset.action;
                if (ACTIONS[action]) ACTIONS[action](target);
            });
        }
    };
})(window);
