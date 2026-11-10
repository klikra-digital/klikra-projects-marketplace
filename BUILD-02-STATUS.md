# KLIKRA White-Label Marketplace Engine — Build 02

**Project token:** `KLIKRA-WLM-001`  
**Continuity token:** `KLIKRA-WLM-CONTINUITY-001`  
**Branch:** `build-02-marketplace-studio`

## What exists

- Build 01 remains unchanged on `main`.
- Build 02 adds `studio.html`, an interactive Marketplace Studio front-end prototype.
- The Studio prototype supports editing marketplace name and description, uploading a local logo preview, selecting primary/accent colors, choosing a visual template, enabling/disabling seller registration, choosing seller approval mode, toggling dual buyer/seller role, and selecting marketplace categories.
- Configuration can be saved in the current browser's localStorage.
- A seller registration preview dialog demonstrates the intended entry point.

## Important prototype boundaries

This is a front-end prototype only. localStorage is local to one browser and is not a server database. It does not provide accounts, authentication, authorization, persistent shared tenant data, secure logo storage, real seller applications, product publishing, cart, orders, chat, negotiation, payments, or multi-tenant isolation. The seller form is a preview and does not submit or store applications.

Do not use this prototype for real customer or transaction data.

## Phase status

| Phase | Status | Evidence / next requirement |
|---|---|---|
| 1. Repository audit | PASS | Existing Build 01 files reviewed; baseline retained. |
| 2. Product architecture | PARTIAL | White-label model and tenant boundaries documented at concept level; detailed schema and threat model still required. |
| 3. Marketplace Studio | PARTIAL | Interactive browser-only configuration prototype added. |
| 4. Marketplace frontend | NOT IMPLEMENTED | Public bazaar catalogue, product details, search, seller storefronts. |
| 5. Seller registration | PREVIEW ONLY | UI entry point exists; server-side application workflow not implemented. |
| 6. Shopping & negotiation | NOT IMPLEMENTED | Requires authenticated users and transactional backend. |
| 7. Backend & database | BLOCKED | No backend project, credentials, schema, or auth provider configured in this repository. |
| 8. Multi-marketplace system | NOT IMPLEMENTED | Requires tenant-aware schema, authorization policies, and isolation tests. |
| 9. Security & quality audit | PARTIAL | Front-end source review only; no automated browser, accessibility, or penetration tests run. |
| 10. Deployment & verification | NOT DEPLOYED | Build 02 branch is not the GitHub Pages production branch. |

## How to preview

When the branch is published or checked out locally, open `studio.html`. The existing Build 01 homepage remains `index.html`.

## Production requirements before launch

1. Choose and provision a backend/authentication provider.
2. Design tenant, member, seller application, store, product, offer, negotiation, order, and audit-event tables.
3. Enforce tenant isolation server-side (never trust a client-supplied tenant ID).
4. Define roles: platform operator, tenant owner/admin/moderator, seller, buyer.
5. Store uploaded logos and product media in managed object storage with file validation.
6. Implement server-side seller approval and state transitions.
7. Implement negotiation with immutable offer history and explicit accept/reject/counter-offer states.
8. Add order confirmation and fulfilment states. Keep online payments disabled until a payment provider is integrated and tested.
9. Add automated tests for authorization and cross-tenant access denial.
10. Perform responsive, accessibility, and production deployment verification.

**Truthful status:** Build 02 is a useful interactive Studio prototype, not yet a production-ready white-label marketplace engine.
