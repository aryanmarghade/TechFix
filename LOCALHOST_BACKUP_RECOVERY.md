# TechFix Localhost Backup & Disaster Recovery Guide

## 1. Local Database Backup Strategy
TechFix uses PostgreSQL as the single source of truth for inventory, user accounts, orders, custom PC build configurations, and repair diagnostic tickets.

### Creating a Snapshot Backup:
Run the following command from the project root or terminal:
```bash
pg_dump -h localhost -p 5432 -U postgres -F c -b -v -f techfix_localhost_backup.dump techfix_db
```

---

## 2. Restoring a Database Snapshot
If you need to reset or restore the database to a known clean state:

1. Terminate any active application connections:
   ```bash
   # On Windows PowerShell
   Stop-Process -Name "node" -Force
   ```
2. Drop and re-create the database:
   ```bash
   dropdb -h localhost -p 5432 -U postgres techfix_db
   createdb -h localhost -p 5432 -U postgres techfix_db
   ```
3. Restore from the dump file:
   ```bash
   pg_restore -h localhost -p 5432 -U postgres -d techfix_db -v techfix_localhost_backup.dump
   ```
4. Verify connectivity:
   ```bash
   node validate-qa.js
   ```

---

## 3. Uploads & Asset Backup
Static uploads (repair diagnostic photos, custom build attachments) are stored in `public/uploads/`.
- Backup command:
  ```bash
  tar -czvf uploads_backup.tar.gz public/uploads/
  ```
- Restore command:
  ```bash
  tar -xzvf uploads_backup.tar.gz -C ./
  ```
