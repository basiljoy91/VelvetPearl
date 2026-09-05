# Technical Plan And Safety Audit

## Current Data Flow

Public enquiry forms submit to `POST /api/enquiries`. The backend controller validates and normalizes the payload, then `backend/models/bookingModel.js` writes a row into `enquiries` and the matching service detail table (`cab_enquiry_details`, `room_enquiry_details`, `tour_enquiry_details`, or `custom_trip_details`). The admin dashboard reads this data through protected `/api/admin/enquiries` endpoints, joins assignment/audit context, and renders it in `src/pages/AdminDashboard.jsx` and mobile admin components.

Cab enquiries now also carry structured route data. The route picker stores pickup/drop location snapshots and estimate data inside `service_details_json`, while `cab_enquiry_details` stores selected location IDs/snapshots and estimate JSON for operations.

## PostgreSQL-Only Blockers Found

- `backend/config/db.js` used the `pg` driver and PostgreSQL connection/result shapes.
- Models used `$1`, `$2` placeholders and PostgreSQL-specific `RETURNING id`.
- Existing migrations used PostgreSQL `jsonb`, enum types, `timestamptz`, `public.*` schema references, `citext`, extensions, GIN/trigram indexes, RLS policies, PL/pgSQL functions, triggers, and casts such as `::text`.
- Startup compatibility checks used PostgreSQL catalog queries and trigger/function creation.
- Hostinger target requires MySQL/MariaDB-compatible schema and SQL assumptions.

## Chosen Database Strategy

The backend is now MySQL/MariaDB-first because Hostinger is the production target. A small DB abstraction in `backend/config/db.js` normalizes query results to `{ rows, rowCount, insertId }`, translates existing `$n` placeholders to `?`, and serializes plain objects/arrays for JSON columns. This keeps model changes focused while removing the `pg` runtime dependency.

## Migration Notes

- Use [`backend/utils/schema.mysql.sql`](../backend/utils/schema.mysql.sql) for new Hostinger MySQL databases.
- The Supabase migration remains historical reference only for current PostgreSQL installs. Do not layer invoices/quotations on it without a deliberate PostgreSQL adapter and tests.
- Existing Supabase data should be exported to CSV/JSON, transformed to the MySQL column names/types, then imported into Hostinger MySQL before switching production traffic.
- Money columns now use `DECIMAL(12,2)`.
- Flexible metadata is stored as MySQL `JSON` columns where available.
- Counters for enquiry, invoice, and quotation numbers are application-driven instead of PostgreSQL triggers.

## Verification Plan

- Run `npm run lint` and `npm run build`.
- Run `npm ci --prefix backend` and backend syntax checks.
- Against a real MySQL database, run `npm run init-db --prefix backend`; the bootstrap should complete for both fresh and partial schemas.
- Submit a public cab enquiry with structured pickup/drop route data.
- Confirm admin login, enquiry list/detail, invoice CRUD/PDF/email/WhatsApp, quotation CRUD/PDF/email/WhatsApp/convert, and mobile admin navigation.
