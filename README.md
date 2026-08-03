# ODS Dashboard

## Overview
This project is a React/Vite dashboard for managing ODS (Order Sheets). It includes:
- A searchable, filterable table of ODS entries.
- **Excel export** functionality (button "Exporter Excel") for users with the appropriate permission (`auth.canExportData()`).
- Role‑based UI components and services for notifications, logging, and tender management.

## Recent Changes (v0.0.1)
- Added XLSX export capability in **src/pages/Ods.jsx**.
- Fixed HTML markup: the Export button now sits **outside** the `<select>` element.
- Updated import statements to avoid duplicate `XLSX` import.
- Committed and pushed to the `main` branch.

## Deployment Guide (cPanel)
1. **Pull the latest code** on the server (folder `~/ods`):
   ```bash
   cd ~/ods
   git fetch --all
   git reset --hard origin/main
   ```
2. **Install dependencies**:
   ```bash
   npm ci
   ```
3. **Build the production assets**:
   ```bash
   npm run build   # generates the ./dist folder
   ```
4. **Serve the site** (choose one):
   - **Static**: move the contents of `dist/` to the web root (`public_html` or a sub‑folder) and add an `.htaccess` for SPA fallback.
   - **Node.js**: create a minimal `server.js` (see inline comments) and configure cPanel “Setup Node.js App”.
5. Verify the site loads and the **Exporter Excel** button downloads `ods_export.xlsx`.

## Local Development
```bash
npm install        # install packages
npm run dev        # start Vite dev server (http://localhost:5173)
```

## License
MIT © 2026 Lotfi Bahloul
