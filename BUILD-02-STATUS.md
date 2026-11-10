# KLIKRA White-Label Marketplace Engine — Build 02 Status

**Project token:** `KLIKRA-WLM-001`  
**Continuity token:** `KLIKRA-WLM-CONTINUITY-001`  
**Development branch:** `build-02-marketplace-studio`  
**Pull request:** [PR #1](https://github.com/klikra-digital/klikra-projects-marketplace/pull/1)

## Current state

Build 02 now includes a Neon-backed marketplace application, persistent tenant settings and category controls, seller product management, negotiation/order workflows, and a deployed Neon Function for authenticated image uploads.

**This remains a development implementation, not a production launch.** Build 01 on `main` remains unchanged. Database changes, Auth, Data API, storage, and the Function are on the isolated Neon branch `wlm-build02-dev`.

## Component status

| Component | Status | Evidence / limitation |
|---|---|---|
| Repository baseline | PASS | Build 02 is 8+ commits ahead of `main`; `main` unchanged |
| Marketplace Studio | PARTIAL | Persistent settings, branding upload controls, and category RPC are in `marketplace.html`; category sync tested in transaction; `studio.html` remains a visual preview page |
| Marketplace creation | IMPLEMENTED — NOT E2E TESTED | Neon RPC `create_marketplace`; authenticated browser test pending |
| Authentication | IMPLEMENTED — NOT E2E TESTED | Neon Auth email/password enabled; no user browser session exercised |
| Role and membership model | PARTIAL | Buyer/seller capabilities, owner/admin/moderator roles; dual-role setting enforced in seller approval; E2E role tests pending |
| Seller Center | PARTIAL — DB WORKFLOW TEST PASS | Seller application, admin approval, active store creation, buyer+seller capability tested with synthetic identities; browser E2E pending |
| Product media | IMPLEMENTED — NOT E2E TESTED | `marketplace-media` public-read bucket and `wlmuploads` Neon Function deployment #3 completed; client upload flow wired, live upload test pending |
| Shopping | PARTIAL | Search/category filtering, browser-side multi-product cart, batch offer submission; consolidated multi-item checkout not implemented |
| Negotiation | PARTIAL — DB WORKFLOW TEST PASS | Offer, counter, accept, event history, rejection of own-offer acceptance tested in transaction; browser E2E pending |
| Orders | PARTIAL | Accepted-offer order creation, stock decrement, idempotency key, legal status transitions; one offer creates one order; shipping/refunds/payment absent |
| Multi-tenant isolation | PARTIAL — DB POLICY TEST PASS | Synthetic two-identity transaction verified cross-tenant private reads and product mutation are denied; real browser sessions still pending |
| Security | PARTIAL | Restricted direct writes, authenticated-only RPC grants, tenant immutability triggers; authenticated penetration/E2E test pending |
| Mobile & desktop | PARTIAL | Responsive CSS implemented; real browser/device QA pending |
| Deployment | NOT DEPLOYED | PR #1 remains draft; no production promotion or public release |

## Database development branch

- Neon project: `KLIKRA-WLM-ENGINE`
- Database: `klikra_marketplace`
- Branch: `wlm-build02-dev` (`br-icy-waterfall-azzy6aky`)
- Original public tables retained: 11
- Added tables: `product_media`, `negotiation_events`
- RLS-enabled public tables: 13
- RLS policies: 25
- Workflow RPCs: 10, including `save_marketplace_categories` and `record_product_media`
- Offer-to-order relationship: tenant-scoped foreign key and unique offer idempotency index
- Neon Auth: provisioned
- Neon Data API: active with JWT verification
- Neon Object Storage: `marketplace-media`, public-read
- Neon Function: `wlmuploads`, Node.js 24, deployment #3 completed
- Primary database branch: unchanged

## Verified in this development pass

- Neon development branch state: `ready`.
- Neon Function deployment #3: `completed`; prior deployment #2 failed due external package imports and was replaced with a dependency-free implementation.
- GitHub JavaScript module syntax check: PASS after current application changes.
- RLS activation: 13 tables.
- Policy count: 25.
- Authenticated direct table privileges: offers insert/update denied; seller_applications insert/update denied; stores insert denied; product_media insert/update denied; products delete granted but governed by owner/admin RLS policy.
- The Neon Function's upload endpoint is implemented and wired into the frontend. A live authenticated upload has not yet been performed.
- Rolled-back database test transactions verified: user A cannot read user B's paused store, draft product, offer, or membership; user A cannot update user B's product; seller application → admin approval → store creation works; buyer+seller capabilities coexist; category sync deactivates removed categories; same-party offer acceptance is rejected; seller counter → buyer acceptance → order creation → status completion works; repeat order creation returns the same order; stock decrements once (5 → 3). These tests used synthetic JWT claims, not a real browser login.

## Remaining release gates

1. Run authenticated browser E2E with at least two users across two tenants.
2. Prove tenant A cannot read or mutate tenant B's private data.
3. Verify sign-up, sign-in, session refresh, and logout from the actual GitHub Pages origin.
4. Verify the deployed Function has its injected Neon Object Storage credentials and complete a real upload/metadata round trip.
5. Verify Marketplace Studio save/load, categories, logo/banner persistence, and seller application review in browser.
6. Verify product create/edit/delete, offer negotiation, order creation/idempotency, stock restoration, and status transitions.
7. Complete mobile/desktop, keyboard, contrast, and accessibility QA.
8. Review production domain, email verification/delivery, storage policy, monitoring, and migration plan.
9. Promote development DB changes only after the tests pass and an explicit migration decision.
10. Merge/deploy only after release gates pass.

See `BUILD-02-IMPLEMENTATION.md` for architecture, configuration, verification evidence, and known limitations.


## Checkpoint keamanan & kontrak API — 11 November 2026

- Development branch Neon `wlm-build02-dev`: 13 tabel dan 24 kebijakan RLS terverifikasi melalui katalog PostgreSQL.
- Hak langsung `INSERT/UPDATE` pada `offers`, `UPDATE` pada `seller_applications`, dan `UPDATE` pada `product_media` dicabut dari role `authenticated`. Penawaran wajib melalui RPC; akses UPDATE yang tidak memiliki policy tidak lagi diberikan.
- Ditemukan frontend memanggil RPC `save_marketplace_categories` yang tidak ada. Diperbaiki pada commit `0a2f413fe16a0dafa31adad556ab6b6b2683cdcd` dengan upsert ke tabel `categories` memakai unique key tenant_id+slug dan RLS admin.
- Tombol hapus produk sebelumnya memanggil DELETE, sementara privilege DELETE tidak tersedia. Diubah menjadi arsip (PATCH status=archived), agar riwayat transaksi tidak terhapus.
- Pemeriksaan sintaks JavaScript module setelah perubahan: PASS (parse/compile check, bukan browser E2E).
- Belum diuji: dua identitas Neon Auth nyata, alur login browser, upload storage endpoint, isolasi dua tenant dengan JWT berbeda, serta transaksi end-to-end.
- Status produk tetap PARTIAL / NOT READY FOR LAUNCH. Database utama tidak diubah; tidak ada deployment produksi.


### Klarifikasi pemeriksaan ulang RPC

Pemeriksaan katalog PostgreSQL berikutnya menemukan bahwa `record_product_media` dan `save_marketplace_categories` terdaftar pada development branch. Temuan awal bahwa RPC kategori tidak ada tidak konsisten dengan pemeriksaan ulang; kemungkinan perubahan database berlangsung di antara pembacaan katalog. Frontend kini menggunakan upsert langsung untuk kategori, sehingga jalur simpan kategori tidak bergantung pada RPC tersebut. RPC `record_product_media` tetap dipakai oleh fungsi upload. Keberhasilan upload end-to-end dan konfigurasi credential storage masih belum dibuktikan.
