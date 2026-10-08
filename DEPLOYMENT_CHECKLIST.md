# TechFix Deployment Checklist & Production Operations

## 1. Environment Variables Configuration
Ensure the production environment contains the following keys (never committed to version control):

| Variable | Description | Production Recommendation |
| :--- | :--- | :--- |
| `PORT` | Listening port for Express | `5000` or assigned by container / reverse proxy |
| `NODE_ENV` | Application environment | `production` |
| `DB_HOST` | PostgreSQL Host | Managed Cloud DB (e.g. AWS RDS / Supabase) |
| `DB_PORT` | PostgreSQL Port | `5432` |
| `DB_NAME` | Database Name | `techfix_db` |
| `DB_USER` | Database User | Dedicated non-superuser role |
| `DB_PASSWORD` | Database User Password | High-entropy secret |
| `JWT_SECRET` | Session Signing Key | 256-bit secure random key |
| `OLLAMA_URL` | Local LLM host URL | `http://127.0.0.1:11434` (optional AI assistant) |
| `SERVICE_CITY` | Primary service city | e.g. `Mumbai` |
| `SERVICE_STATE` | Primary service state | e.g. `Maharashtra` |
| `STORE_PHONE` | Customer service contact | Verified operational phone line |
| `STORE_EMAIL` | Official store email | `support@techfix.in` |
| `STORE_ADDRESS` | Physical operations center | Store / warehouse physical address |
| `MAX_COD_LIMIT` | Max allowed cash order value | `150000` |
| `DEFAULT_DELIVERY_CHARGE` | Standard delivery charge | `99` |
| `FREE_DELIVERY_THRESHOLD` | Threshold for free delivery | `999` |

---

## 2. Infrastructure & Process Management
- **Node.js Runtime**: Version 18+ or 20+ LTS recommended.
- **Process Manager**: Use **PM2** or **Docker**:
  ```bash
  pm2 start server/app.js --name "techfix-api" -i max
  ```
- **Reverse Proxy**: NGINX / Cloudflare recommended with SSL termination:
  - Enforce HTTPS redirect.
  - Enable gzip/brotli compression for static assets.
  - Set rate limiting headers for `/api/auth/*` and `/api/orders/*`.

---

## 3. Database Migration & Schema
- PostgreSQL 14+ or 15+ installed.
- Initialize schema:
  ```bash
  node server/db/init.js
  node server/db/sync-rich-builder.js
  ```
- Verify connection pool health: `max: 20`, `idleTimeoutMillis: 30000`.

---

## 4. Backup & Disaster Recovery
- Daily automated snapshots:
  ```bash
  pg_dump -U techfix_user -F c -b -v -f /backups/techfix_$(date +%F).dump techfix_db
  ```
- Retention policy: 30-day rolling retention stored on encrypted cloud object storage (S3).
- Restoration command:
  ```bash
  pg_restore -U techfix_user -d techfix_db -v /backups/techfix_YYYY-MM-DD.dump
  ```

---

## 5. Production Readiness Status
- **READY NOW**:
  - Full transactional order checkout with server-side pricing recalculation.
  - Anti-tamper stock locking (`SELECT ... FOR UPDATE`).
  - Strict Admin vs. Customer role verification.
  - Complete PC builder compatibility engine.
  - Production-grade Admin Control Center with zero mock statistics.
- **REQUIRED BEFORE PUBLIC LAUNCH**:
  - Provision production PostgreSQL credentials in environment.
  - Configure domain DNS and SSL certificates.
  - Set up automated database daily backup cron.
