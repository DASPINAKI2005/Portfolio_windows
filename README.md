# Pinaki Das Portfolio

A static portfolio with a Windows 11 desktop experience and an Android-style
mobile launcher. No build step or package installation is required.

## Run locally

Serve the repository root with any static file server, then open `/` for the
responsive experience or `/mobile/` for the Android launcher directly.

## Project layout

```text
index.html
README.md
favicon.ico
robots.txt
sitemap.xml
site.webmanifest
assets/
  images/
    profile/
    projects/
    certificates/
    wallpapers/
    icons/
  documents/
    resume.pdf
    certificates/
  videos/
css/
  core.css
  windows.css
  apps.css
  animations.css
  responsive.css
js/
  main.js
  desktop.js
  windows.js
  taskbar.js
  start-menu.js
  apps.js
  welcome-overlay.js
  utils.js
data/
  projects.js
  certificates.js
  profile.js
mobile/
  index.html
  css/
    core.css
    gate.css
    launcher.css
    apps.css
  js/
    core.js
    apps.js
    app-manager.js
    launcher.js
```

The Windows experience remains the default entry point. The Android launcher
is available both responsively from `/` and directly at `/mobile/`.
