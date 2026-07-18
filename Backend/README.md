# Charity Center Management API

Production-oriented Express/TypeScript/PostgreSQL REST API. Only `ADMIN` and `SUPER_ADMIN` authenticate; expert and membership records are applications, never accounts.

## Setup

Requirements: Node.js 20+, Docker, and Docker Compose.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run migrate
npm run seed:super-admin -- --name="System Owner" --email=owner@example.org --password="ChangeMe!12345"
npm run dev
```

The API is at `http://localhost:4000/api/v1`, health at `/health`, and interactive OpenAPI documentation at `/api/docs`. Change all example credentials and secrets. The migration is intentionally explicit SQL in `src/db/migrations/001_initial.sql`.

## Common requests

```bash
curl -X POST http://localhost:4000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"owner@example.org","password":"ChangeMe!12345"}'
curl http://localhost:4000/api/v1/public/membership-types
curl -X POST http://localhost:4000/api/v1/public/contact-messages -H "Content-Type: application/json" -d '{"fullName":"Jane Doe","email":"jane@example.org","subject":"Volunteer","message":"I would like to learn how I can help."}'
curl -X POST http://localhost:4000/api/v1/admin/resources -H "Authorization: Bearer ACCESS_TOKEN" -F "title=Annual report" -F "description=Annual report" -F "category=Reports" -F "file=@report.pdf"
```

Admin lists accept `page`, `limit`, `search`, `status`, `sort`, and `order` where applicable. Responses use `{ "success": true, "data": ..., "meta": ... }`; errors use `{ "success": false, "error": { "code": ..., "message": ... } }`.

## Frontend connection

Set the frontend API base URL to `http://localhost:4000/api/v1`. Add its exact origin to `CORS_ORIGINS`. Public forms call `/public/...` without credentials. Keep the access token in memory and send it as `Authorization: Bearer ...`; store the refresh token in a platform-appropriate secure store and rotate it through `/auth/refresh`. On 401, refresh once and retry; on another failure, clear the session. In a browser deployment, prefer adapting refresh delivery to a Secure, HttpOnly, SameSite cookie.

Uploads use a storage adapter boundary and local disk in development. Production should replace it with object storage, serve immutable object URLs, run behind TLS, use a managed PostgreSQL instance with backups, set a long random JWT secret, restrict CORS, enable proxy trust only behind a trusted proxy, and add malware scanning for documents.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

Integration-heavy authentication/database scenarios should run against an isolated PostgreSQL database in CI; the included test suite covers HTTP health, validation, generic login failure, and protected-route denial without requiring a database.
