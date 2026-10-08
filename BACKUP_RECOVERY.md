# TechFix Production Backup, Archival & Disaster Recovery

## 1. Backup Strategy Overview
TechFix utilizes PostgreSQL relational storage containing products, inventory, orders, customer accounts, custom PC build configurations, and repair diagnostic records. A structured multi-tier backup policy protects business continuity.

---

## 2. Backup Frequency & Automation
- **Daily Automated Snapshots**: Complete PostgreSQL logical backup executed via cron at `02:00 UTC`.
  ```bash
  # Daily Compressed Dump
  pg_dump -h localhost -U postgres -F c -b -v -f /backups/techfix_$(date +\%F).dump techfix_db
  ```
- **Weekly Full SQL Export**:
  ```bash
  pg_dump -h localhost -U postgres -F p -f /backups/techfix_weekly_$(date +\%F).sql techfix_db
  ```

---

## 3. Storage & Retention Policy
- **Local Storage**: 7 days retention on application server.
- **Off-Site Encrypted Storage**: 30 days rolling retention pushed to AWS S3 / Cloudflare R2 bucket with server-side encryption (`AES-256`).
- **Zero Secrets / Zero PII in Repositories**: Database dumps are excluded from version control via `.gitignore`.

---

## 4. Disaster Recovery & Restoration Procedure
In the event of database failure or migration:
1. Stop the application server:
   ```bash
   pm2 stop techfix-api
   ```
2. Re-create clean target database:
   ```bash
   dropdb -h localhost -U postgres techfix_db
   createdb -h localhost -U postgres techfix_db
   ```
3. Restore the latest verified snapshot:
   ```bash
   pg_restore -h localhost -U postgres -d techfix_db -v /backups/techfix_YYYY-MM-DD.dump
   ```
4. Verify database health:
   ```bash
   curl http://localhost:5000/health
   ```
5. Restart application services:
   ```bash
   pm2 restart techfix-api
   ```
