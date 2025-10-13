# DISASTRA Frontend

This is a Vite + React + Tailwind frontend for the DISASTRA project.

Quick start (Windows PowerShell):

1. Open PowerShell in this folder: `d:\DisAstra\mvp\DisAstra\frontend`
2. Install dependencies:

```powershell
npm install
```

3. Start dev server:

```powershell
npm run dev
```

The dev server will run on http://localhost:5173 by default.

Tauri (native wrapper)
-----------------------
This project includes a Tauri scaffold in `src-tauri`. That lets you build native apps (desktop) and, with extra setup, mobile (Android/iOS).

Prerequisites for local development:
- Rust toolchain (stable): https://www.rust-lang.org/tools/install
- Tauri prerequisites: see https://tauri.app/v1/guides/getting-started/prerequisites

Common commands (from `frontend` folder):

```powershell
# start Vite dev server (Tauri dev will load this URL)
npm run dev

# run Tauri dev (requires Rust + toolchain)
cargo install tauri-cli # optional: follow tauri docs
cd src-tauri
cargo tauri dev
```

Mobile notes:
- Building for Android requires Android SDK, NDK and Java toolchain. Follow Tauri docs for Android setup.
- Building for iOS requires Xcode and macOS.

I cannot build mobile binaries in this environment, but I added the scaffolding so you can build locally once you install the required native toolchains.
