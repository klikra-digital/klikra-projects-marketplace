# KLIKRA Projects Marketplace

A digital marketplace to discover, explore, and access creative projects, tools, templates, and learning experiences by KLIKRA.

## MVP — Build 01

This repository currently contains the first responsive front-end prototype.

### Included
- Marketplace landing page and KLIKRA identity
- Project catalogue cards
- Search by project name, category, and description
- Category filters
- Project summary dialog
- Responsive layout for mobile and desktop

### Project structure
```
.
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── README.md
```

### Run locally
Open `index.html` in a modern browser. The page is static and does not require a backend.

### Deployment
GitHub Pages can serve this repository from the `main` branch and the `/` (root) folder. Enable it in **Settings → Pages** when ready to publish.

### Current scope and notes
- Catalogue entries are starter/demo summaries, not a declaration that each project is publicly released.
- No account system, payment flow, database, or download delivery is connected yet.
- Keep future changes incremental and verify each build before replacing established work.

**Build status:** MVP front-end scaffold committed.

## Build 02 — White-Label Marketplace development app

Build 02 is developed separately from the Build 01 baseline on branch `build-02-marketplace-studio`.

- Marketplace application: `marketplace.html`
- Marketplace Studio preview: `studio.html` (visual preview only; persistent configuration is in the authenticated application)
- Implementation record: `BUILD-02-IMPLEMENTATION.md`
- Current status and remaining gates: `BUILD-02-STATUS.md`
- Neon media upload function source: `functions/wlmuploads/index.mjs`

### Development preview

Serve the repository locally (for example, `python -m http.server 5173`) and open:

- `http://localhost:5173/marketplace.html`

The app uses the dedicated Neon development branch and Neon Auth/Data API. Product, marketplace logo, and banner uploads are routed through the authenticated Neon Function `wlmuploads`; the browser never receives storage credentials. The public product media bucket is `marketplace-media` on the development branch. Do not copy database connection strings or privileged credentials into frontend code. The browser-facing Neon service endpoints are not database passwords.

### Important

Build 02 is not production-ready. Authenticated browser E2E, cross-tenant adversarial testing, upload E2E, mobile/desktop QA, and production deployment remain outstanding. The old `studio.html` page is only a local visual preview; persistent settings are managed in the main app after login. A full multi-item cart, shipping/refunds, and online payments are not implemented. Payments are intentionally disabled.

Do not merge or deploy Build 02 to production based only on the presence of frontend pages or database tables.
