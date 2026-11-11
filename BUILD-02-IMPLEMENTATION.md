# Build 02 — Implementation & Verification Notes

**Project:** KLIKRA White-Label Marketplace Engine  
**Token:** `KLIKRA-WLM-001`  
**Continuity:** `KLIKRA-WLM-CONTINUITY-001`

## Current development environment

- GitHub branch: `build-02-marketplace-studio`
- Baseline: `main` remains unchanged; Build 02 is three or more commits ahead on its own branch.
- Neon project: `KLIKRA-WLM-ENGINE`
- Database: `klikra_marketplace`
- PostgreSQL: 17, Singapore region
- Development branch: `wlm-build02-dev` (`br-icy-waterfall-azzy6aky`)
- Authentication: Neon Auth / Better Auth
- Data API: Neon Data API, JWT verified by Neon Auth, REST/PostgREST interface
- Frontend entry: `marketplace.html`
- Studio prototype: `studio.html`

The development database branch is isolated from the primary database branch. No migration from this development branch has been applied to the primary branch.

## Implemented on the development branch

### Identity and access foundation
- Neon Auth provisioned with email/password sign-in.
- Auth trusted origins include the GitHub Pages origin and localhost development origin.
- Neon Data API enabled with Neon Auth JWT verification.
- The public schema is exposed; default broad table grants were disabled.
- User profiles now map to Neon Auth identities using `auth_user_id`.
- Membership capabilities support buyer and seller simultaneously, while preserving owner/admin/moderator roles.
- PostgreSQL RLS enabled on all 11 original public tables plus 2 added tables.
- 25 RLS policies were verified in `pg_policies`.
- Public/anonymous read policies are limited to active marketplace content.
- RPC functions have explicit authenticated-only execution grants; anonymous execution was verified false.

### Marketplace data and workflows
- Marketplace settings extended with banner URL, template, seller registration mode, and dual-role setting.
- Added `product_media` for product media metadata.
- Added `negotiation_events` for append-only negotiation history.
- Added tenant-scoped parent-offer foreign key and offer expiry/acceptance timestamps.
- Added database RPCs:
  - `create_marketplace`
  - `join_marketplace`
  - `submit_seller_application`
  - `review_seller_application`
  - `submit_offer`
  - `respond_to_offer`
  - `create_order_from_accepted_offer`
  - `update_order_status`
- Offer responses and order transitions are performed through security-definer RPCs rather than unrestricted client updates.
- Order creation checks the accepted offer, locks the product row, checks stock, decrements stock, and records an order/item snapshot.

### Frontend
- `marketplace.html` added as a working application shell for the Neon Auth + Data API development environment.
- Email/password sign-up and sign-in.
- Marketplace list and create marketplace flow.
- Join marketplace as buyer.
- Seller application submission and admin review UI.
- Product catalogue and seller product creation.
- Offer submission, counter-offer, accept/reject, and order creation.
- Order list and seller/buyer status controls.
- Marketplace settings editing.
- Responsive layout for phone and desktop breakpoints.

## Verification performed

| Check | Result | Evidence |
|---|---|---|
| Build 01 baseline retained | PASS | GitHub compare: `main` vs Build 02 showed only new/Build 02 files; `index.html` on main unchanged |
| Neon development branch | PASS | Branch state `ready` |
| Original schema retained | PASS | All 11 original public tables found on dev branch |
| Added schema | PASS | `product_media`, `negotiation_events` present |
| RLS activation | PASS | 13 public tables report row security enabled |
| RLS policies | PASS | 24 policies found |
| RPC permissions | PASS | 8 business RPCs executable by authenticated; not executable by anonymous |
| Anonymous data access | PASS | Anonymous-role queries completed; no active marketplace/product rows were exposed in empty dev data |
| Authenticated sign-up/sign-in | NOT E2E TESTED | No test account was created and no browser session was run |
| Cross-tenant isolation | NOT E2E TESTED | Policies and tenant-scoped constraints are present; authenticated adversarial test still required |
| Mobile/desktop browser QA | NOT E2E TESTED | Responsive CSS implemented; no browser automation or device session executed |
| Product image upload | NOT IMPLEMENTED | Media metadata table exists; object storage/upload service not connected |
| Full multi-item cart | NOT IMPLEMENTED | Current order creation starts from one accepted offer |
| Payment gateway | NOT IMPLEMENTED | Deliberately disabled |
| Production deployment | NOT DEPLOYED | Build 02 remains on its development branch and PR #1 |

## Development configuration

The frontend currently targets the dedicated Neon development branch. The Auth URL and Data API URL are public service endpoints; no database connection string or privileged credential is embedded in the frontend.

For a local static preview, serve the repository with a local web server on `http://localhost:5173` and open `marketplace.html`. Opening the file directly via `file://` is not supported for module imports.

## Known limitations and risks

1. No authenticated end-to-end test has been run. Before real users or real transactions, test registration, sign-in, profile bootstrap, marketplace creation, seller approval, product creation, offer negotiation, order transitions, and cross-tenant denial using at least two separate users and two tenants.
2. The frontend uses the Neon Auth browser SDK and Neon Data API from a GitHub Pages origin. Some browsers block third-party cookies in cross-site authentication. A same-site custom domain or authenticated proxy may be required for reliable production sessions.
3. Email verification is not required in the current development auth configuration. Configure verified email and production email delivery before launch.
4. Product media storage is not provisioned. `product_media` stores URLs only; do not treat it as a secure upload system.
5. There is no multi-product cart, shipping calculation, refund workflow, seller payout, or online payment integration.
6. The database primary branch has not received these development changes. Promote only after review, tests, and an explicit migration decision.
7. `studio.html` remains a browser-local prototype; the new `marketplace.html` is the connected development application. The Studio form itself still needs integration with the persistent settings API.

## Additional security hardening

- Store insertion policy now requires seller capability (owner/admin/seller or explicit seller capability), preventing ordinary buyer members from creating seller stores directly.
- Offers persist `created_by_user_id`; the latest offer can only be accepted/rejected/countered by the other participant, and only its creator can withdraw it.
- These changes were applied and inspected on the isolated development branch. No real authenticated user scenario was run, so runtime authorization remains unverified.

## Production gate

Do not publish this as a production marketplace until authenticated browser tests, cross-tenant security tests, storage, verified email, and same-site auth behavior have been validated. Keep payment disabled until a provider and complete payment lifecycle are integrated and tested.


## Latest completion pass — media, Studio persistence, and workflow hardening

### Marketplace application
- The authenticated application now contains persistent marketplace settings for name, description, brand colors, template, seller registration, approval mode, and dual buyer/seller behavior.
- Marketplace logo and banner upload controls call the authenticated Neon Function.
- Tenant categories can be saved through the `save_marketplace_categories` RPC.
- Product creation accepts an image; public catalogue reads product media metadata.
- Seller Center includes owner-scoped product listing, edit, and delete controls.
- Marketplace identity displays the saved logo and banner.
- `studio.html` is explicitly labeled as a visual preview; the persistent editor is the management panel in `marketplace.html`.

### Neon Object Storage and upload function
- Bucket: `marketplace-media` (`public_read`) on `wlm-build02-dev`.
- Neon Function slug: `wlmuploads`.
- Runtime: Node.js 24.
- Active deployment: #3, status `completed`.
- Source is tracked at `functions/wlmuploads/index.mjs`.
- Upload endpoint accepts JPEG, PNG, and WebP up to 5 MB.
- Browser sends the image to the authenticated Function; storage credentials remain inside Neon Function environment.
- Function checks the caller's JWT-backed profile and verifies product ownership or marketplace admin membership before writing.
- Product media metadata is written through the restricted `record_product_media` RPC; marketplace logo/banner URLs are updated through tenant RLS.
- Earlier Function deployment #2 failed because external npm packages were not bundled. It was replaced by a dependency-free Node.js implementation and deployment #3 completed.
- A real authenticated upload round trip has not yet been executed; do not claim upload E2E PASS.

### Database and security hardening
- Direct authenticated INSERT/UPDATE/DELETE on `offers` revoked; offer mutations must use protected RPCs.
- Direct authenticated INSERT/UPDATE/DELETE on `seller_applications` revoked; applications must use the protected submission/review RPCs.
- Direct authenticated INSERT on `stores` revoked; stores are created on seller approval.
- Direct authenticated INSERT/UPDATE/DELETE on `product_media` revoked; metadata is recorded through the upload Function and RPC.
- Authenticated DELETE on `products` granted with an owner/admin RLS delete policy.
- Offer response RPC now checks the last negotiation event actor so the same party cannot respond to its own latest offer.
- Offer creation and counter-offer creation set `created_by_user_id` explicitly.
- Order creation is idempotent per accepted offer, uses an advisory transaction lock, and stores the offer ID.
- Added tenant-scoped foreign key from orders to offers.
- Seller approval respects `allow_dual_role`: when disabled, membership becomes seller-only; when enabled, buyer and seller capabilities coexist.
- Verified current development state: 13 RLS-enabled public tables and 25 RLS policies.

## Current evidence and remaining tests

| Check | Result |
|---|---|
| Development branch ready | PASS |
| Function deployment #3 | PASS — deployment completed |
| JS module syntax after latest frontend edits | PASS |
| RLS tables | PASS — 13 |
| RLS policies | PASS — 25 |
| Direct write restrictions for offers, seller applications, stores, and product media | PASS — privilege checks |
| Real authenticated signup/login browser flow | NOT TESTED |
| Real product image upload round trip | NOT TESTED |
| Two-user/two-tenant adversarial isolation | NOT TESTED |
| Full mobile/desktop browser QA | NOT TESTED |
| Production deployment | NOT DEPLOYED |

The development database branch remains isolated. No development schema changes have been promoted to the primary Neon branch. Payment remains disabled.


## Database-level workflow and tenant-isolation tests (rolled back)

Tests were run on `wlm-build02-dev` using synthetic JWT claim contexts and temporary fixture rows inside transactions. Every test transaction ended with `ROLLBACK`; no test users, tenants, stores, products, offers, or orders were retained.

### Tenant isolation
- Anonymous role saw active marketplace listings and active products, but not draft products or paused stores.
- Synthetic authenticated user A had membership in tenant A but not tenant B.
- User A saw zero tenant B paused stores, draft products, offers, and memberships.
- User A's attempted update of tenant B's draft product affected zero rows.
- `is_marketplace_member(A)` returned true; `is_marketplace_member(B)` returned false.

### Seller and category workflow
- Synthetic buyer submitted a seller application.
- Synthetic tenant owner approved the application.
- Active store was created for the applicant.
- With dual-role enabled, membership capabilities became `buyer,seller`.
- Category synchronization created categories and deactivated a category removed from the submitted list.

### Negotiation and order workflow
- Initial buyer offer was created with creator identity and event history.
- The same buyer attempting to accept their own latest offer was rejected.
- Seller counter-offer succeeded.
- Buyer acceptance succeeded.
- Order creation succeeded and was idempotent for the accepted offer.
- Seller transitions `confirmed → processing → ready` and buyer transition `completed` succeeded.
- Stock decreased once from 5 to 3 for quantity 2.
- The transaction was rolled back after assertions.

**Interpretation:** These are meaningful PostgreSQL/RLS/RPC tests, but they do not replace a real browser session, actual Neon Auth sign-up/login, or live upload test.


### Shopping cart scope
- Added a browser-side cart with multiple products, quantity and per-unit offer price controls, removal, and indicative subtotal.
- Cart can submit multiple offers in sequence; each product gets its own negotiation thread so offer history remains explicit.
- Cart data is local to the current browser/device. It is not a server-synced cart.
- Orders remain per accepted offer; consolidated multi-item checkout is not implemented.
- Catalogue supports category assignment, category filtering, text search, and product media display.


## Security/API checkpoint (2026-11-11)

The development database was re-inspected against PostgreSQL catalogs. It contains 13 public tables and 24 RLS policies. Direct authenticated INSERT/UPDATE privileges on offers and UPDATE on seller_applications/product_media were revoked where workflow writes must be mediated or no matching UPDATE policy exists. Frontend category persistence was corrected to use the existing categories table with tenant_id+slug conflict handling; the nonexistent save_marketplace_categories RPC call was removed. Product removal was changed to archival via status=archived because authenticated DELETE is not granted and preserving transaction history is safer.

JavaScript module syntax/compilation passed after the frontend patch. This is not browser runtime validation. Authenticated multi-user tenant isolation, storage endpoint, image metadata persistence, cross-site auth, and complete order/cart E2E remain unverified. Do not promote the development schema or deploy production based on this checkpoint.


## Authoritative continuation record — 11 November 2026

This record supersedes older statements where they conflict.

- Latest GitHub comparison at inspection: development branch 38 commits ahead of `main`, zero behind. PR #1 remains open/draft/unmerged. Build 01 baseline remains unchanged.
- Neon `wlm-build02-dev` is ready; Neon Auth and Data API are provisioned and active. Primary Neon branch remains untouched.
- Latest database evidence: 13 public RLS-enabled tables and 25 policies. The prior 24-policy figure is stale.
- Rolled-back SQL tests with synthetic JWT claim contexts exercised tenant private-read/update denial, seller application approval and store creation, dual buyer/seller capabilities, category sync/deactivation, offer participant validation, order idempotency, stock decrement, and order status progression. This is database-level evidence only; it is not a real Auth/browser test.
- Neon Function `wlmuploads` deployment #3 is recorded completed. The source uses runtime environment variables for Object Storage credentials and a caller JWT for database access. A real authenticated upload and metadata round trip remain unverified.
- Marketplace category persistence uses the existing `save_marketplace_categories` security-definer RPC. It checks admin authorization, validates input, upserts, and deactivates removed categories transactionally. An earlier note claiming the RPC was missing was incorrect and is superseded.
- Product archival is performed through status update in the current UI. This is a conservative archival UX choice; it is not evidence that database DELETE is unavailable. Database/PR evidence states product DELETE is protected by owner/admin RLS.
- Cart supports multiple browser-local items and sequentially submits one negotiation offer per item. It is not server-synced, and consolidated multi-item checkout is not implemented; order creation remains per accepted offer.
- Latest frontend module compile check: PASS. Static frontend scan found no embedded database connection string, private key, AWS secret assignment, or Neon API key assignment. Public Auth/Data API endpoints are expected browser configuration; upload credentials remain in Function environment variables.

### Outstanding release gates
Real Neon Auth browser sessions, two-user/two-tenant browser adversarial tests, live storage upload, complete browser seller/cart/negotiation/order flow, persistent settings and media verification, mobile/desktop/accessibility QA, production email/domain/cookie/monitoring review. No primary migration, PR merge, or production deployment until those gates pass and required authorization is obtained.
