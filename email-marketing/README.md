# EmailMarketing

Next.js (App Router) email marketing admin with BFF, PostgreSQL, RBAC, and NextAuth.

## Features
- Next.js 15, TypeScript, Tailwind
- BFF APIs (no tokens in localStorage)
- Auth: NextAuth (Credentials + Google for `@gmail.com`) with raw SQL
- RBAC: Admin, Manager, User
- Admin panel: header + sidebar, user info, campaigns, contacts, send
- Campaign templates (HTML) and media uploads
- PostgreSQL via `pg` (no ORM)

## Getting Started
1. Copy env file and set values
```bash
cp .env.example .env
```

2. Set DATABASE_URL to your Postgres

3. Create schema and seed data
```bash
psql "$DATABASE_URL" -f sql/schema.sql
psql "$DATABASE_URL" -f sql/seed.sql
```

4. Run the app
```bash
npm run dev
```

5. Access UI
- Public: http://localhost:3000/
- Admin: http://localhost:3000/admin
- Login: http://localhost:3000/login

## Notes
- Uses `pg` with parameterized queries throughout to avoid SQL injection
- Uploads stored in `public/uploads` (configurable via `UPLOAD_DIR`)
- Emails sent via SMTP at `EMAIL_SERVER_HOST:EMAIL_SERVER_PORT`
- Admin can promote users via `POST /api/admin/users/role` (body `{ userId, role }`)
- For production, configure secure cookies and HTTPS
