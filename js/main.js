// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Mobile: the Android simulation owns this viewport. Do not boot the
    // desktop engine (managers, wallpaper preloads, slideshow) on phones.
    if (window.matchMedia('(max-width: 1024px)').matches) return;

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

