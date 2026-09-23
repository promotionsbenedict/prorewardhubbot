# Pro Reward Hub — VPS Deployment (Docker, shared Caddy)

Self-hosted production deployment on an Ubuntu Hostinger VPS **alongside an
existing ProChannelHelpBot stack**. Pro Reward Hub runs its own two containers
via Docker Compose and reuses the ProChannelHelpBot Caddy for TLS:

| Service | Image / Source          | Role                                            |
| ------- | ----------------------- | ----------------------------------------------- |
| `app`   | built from `Dockerfile` | Next.js standalone production server            |
| `db`    | `postgres:16-alpine`    | PostgreSQL, isolated on an internal network + persistent volume |

No Vercel involved. Everything runs on your VPS.

## Architecture on a shared VPS

- Pro Reward Hub does **not** run its own Caddy and does **not** publish ports
  80/443. Your existing `prochannelhelpbot-caddy-1` container keeps sole
  ownership of 80/443.
- The `app` container joins the existing external network
  `prochannelhelpbot_default` under the alias **`prorewardhub-app`**. The shared
  Caddy reverse-proxies `prorewardhub.org` to `prorewardhub-app:3000`.
- The `db` container stays on Pro Reward Hub's own private `internal` network —
  it is **not** attached to the shared network, so it is invisible to the bot
  stack. Data persists in the `pgdata` volume.
- The two projects are fully independent: bringing Pro Reward Hub up or down
  never touches the ProChannelHelpBot containers.

```
Internet ──443──> prochannelhelpbot-caddy-1 ──┬─ (existing bot routes)
                                              │
              prochannelhelpbot_default net   └─> prorewardhub-app:3000  (Pro Reward Hub app)
                                                            │  internal net (private)
                                                            └─> db:5432
```

---

## 1. One-time server setup

### 1a. Point DNS at the VPS

In your domain registrar / DNS panel, create two **A records** pointing at your
VPS public IP:

```
prorewardhub.org        A     <YOUR_VPS_IP>
www.prorewardhub.org    A     <YOUR_VPS_IP>
```

HTTPS will not work until DNS resolves to the server, because Let's Encrypt
must reach it over ports 80/443.

### 1b. Install Docker + Compose plugin (Ubuntu)

SSH into the VPS, then:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Run docker without sudo (log out/in afterwards for it to take effect)
sudo usermod -aG docker $USER
```

### 1c. Firewall

Ports 80/443 are already open and served by your existing ProChannelHelpBot
Caddy — you do **not** need to open anything new for Pro Reward Hub, since it
publishes no host ports. (If UFW is enabled, your existing setup already allows
80/443.)

---

## 2. Get the code and configure

```bash
# Clone your GitHub repo (replace with your repo URL)
git clone https://github.com/<your-username>/<your-repo>.git prorewardhub
cd prorewardhub

# Create the real environment file from the template and fill it in
cp .env.example .env
nano .env
```

Fill in `.env` (note: no `DOMAIN` / `ACME_EMAIL` — TLS is handled by the shared
Caddy, not this stack):

- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — pick a strong password.
- `BETTER_AUTH_URL` — `https://prorewardhub.org`.
- `BETTER_AUTH_SECRET` — generate one:
  ```bash
  openssl rand -base64 32
  ```
- `RESEND_API_KEY` / `RESEND_EMAIL_DOMAIN` — from your Resend account.
- `TELEGRAM_BOT_TOKEN` / `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — from @BotFather.

> The database schema is created **automatically** the first time the `db`
> container starts (via `db/init.sql`). No manual migration step is needed for
> a fresh install. See [§7](#7-database-migrations--initialization) for details.

---

## 3. Start (first deploy)

> The external network must exist first. It is created automatically by your
> ProChannelHelpBot stack — confirm it is present:
>
> ```bash
> docker network ls | grep prochannelhelpbot_default
> ```
>
> If it is missing, start the bot stack first (`cd /root/prochannelhelpbot &&
> docker compose up -d`), then continue.

```bash
# Build the app image and start Pro Reward Hub in the background.
# This attaches the app to the existing prochannelhelpbot_default network
# and does NOT touch the bot containers.
docker compose up -d --build

# Watch it come up (Ctrl+C to stop watching; containers keep running)
docker compose logs -f
```

The app is now running as `prorewardhub-app` on the shared network, but it is
not yet reachable from the internet until you add the domain to the shared
Caddy — see [§5](#5-route-the-domain-through-the-existing-caddy). After that,
open **https://prorewardhub.org**.

### Create your admin account

1. Visit `https://prorewardhub.org/signup` and register the first user.
2. Visit `https://prorewardhub.org/admin` — the first member can self-claim
   admin from the setup screen. After that, `/admin` is role-gated.

---

## 4. Update (deploy new code from GitHub)

You deploy via `git pull` + Compose:

```bash
cd ~/prorewardhub
git pull

# Rebuild the app image and restart only what changed
docker compose up -d --build

# Remove the now-unused old image layers (optional cleanup)
docker image prune -f
```

> Because `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` is inlined into the client bundle
> at build time, always use `--build` after changing it in `.env`.

---

## 5. Route the domain through the existing Caddy

Pro Reward Hub's `app` container is reachable on the shared network as
`prorewardhub-app:3000`, but your existing Caddy needs a route for the domain.
This is the **only** change to the ProChannelHelpBot side, and it does not
require restarting the Caddy container.

### 5a. Point DNS at the VPS

If not already done (see §1a), create A records for `prorewardhub.org` and
`www.prorewardhub.org` pointing at the VPS IP. Let's Encrypt (run by the shared
Caddy) needs this to resolve before it can issue the certificate.

### 5b. Add the site block to the existing Caddyfile

Edit the existing Caddyfile — **do not** create a new one:

```bash
nano /root/prochannelhelpbot/Caddyfile
```

Append this block (leave all existing ProChannelHelpBot blocks untouched):

```caddy
prorewardhub.org, www.prorewardhub.org {
    encode gzip
    reverse_proxy prorewardhub-app:3000
}
```

Because the shared Caddy container and `prorewardhub-app` are on the same
`prochannelhelpbot_default` network, Caddy resolves `prorewardhub-app` by its
network alias. Caddy provisions the TLS certificate automatically on first
request.

### 5c. Validate, then hot-reload Caddy (no restart)

Validate the config inside the running Caddy container, then reload it in place.
`caddy reload` swaps the config with zero downtime and **without restarting the
container**, so ProChannelHelpBot keeps serving throughout:

```bash
# 1. Validate the new config (non-destructive; fails loudly on syntax errors)
docker exec prochannelhelpbot-caddy-1 caddy validate --config /etc/caddy/Caddyfile

# 2. Hot-reload the running Caddy with the updated config (no container restart)
docker exec prochannelhelpbot-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```

> If your Caddyfile lives at a different path inside the container, adjust
> `--config`. Confirm with:
> `docker exec prochannelhelpbot-caddy-1 ls /etc/caddy`

Then open **https://prorewardhub.org** — the first request may take a few
seconds while Caddy issues the certificate. Verify the bot is unaffected with
`docker ps` (its containers should show unchanged uptimes).

---

## 6. Common operations

> These `docker compose` commands only affect Pro Reward Hub's `app` and `db`
> containers. They never touch the ProChannelHelpBot containers or the shared
> Caddy.

### Restart

```bash
# Restart Pro Reward Hub (app + db)
docker compose restart

# Restart a single service
docker compose restart app
docker compose restart db
```

### Stop / start

```bash
docker compose stop        # stop containers (keeps data)
docker compose start       # start them again
docker compose down        # stop AND remove containers (data volume is kept)
docker compose up -d       # recreate and start in background
```

> `docker compose down` detaches from `prochannelhelpbot_default` but, because
> it is an external network, Compose never deletes it — the bot stack keeps it.

### Inspect logs

```bash
docker compose logs -f            # app + db, follow
docker compose logs -f app        # just the Next.js app
docker compose logs -f db         # database
docker compose logs --tail=200 app # last 200 lines
# Shared Caddy logs live with the bot stack:
docker logs -f prochannelhelpbot-caddy-1   # TLS / proxy issues
```

### Check status / health

```bash
docker compose ps                 # container + health status
docker stats --no-stream          # live CPU / memory
curl -I https://prorewardhub.org/api/health   # app liveness probe
```

### Open a shell / psql

```bash
docker compose exec app sh                                  # shell in the app
docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"   # psql
```

---

## 6. Backup & restore

The database lives in the `pgdata` Docker volume. Back it up with `pg_dump`.

### Backup

```bash
cd ~/prorewardhub
# Load POSTGRES_* from .env into this shell, then dump to a timestamped file
set -a && . ./.env && set +a
mkdir -p backups
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "backups/prohub-$(date +%Y%m%d-%H%M%S).sql.gz"
```

### Automate a nightly backup (cron)

```bash
crontab -e
# Add (runs every day at 03:00):
0 3 * * * cd ~/prorewardhub && set -a && . ./.env && set +a && docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "backups/prohub-$(date +\%Y\%m\%d-\%H\%M\%S).sql.gz"
```

### Restore

```bash
cd ~/prorewardhub
set -a && . ./.env && set +a
gunzip -c backups/prohub-YYYYMMDD-HHMMSS.sql.gz \
  | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

---

## 7. Database migrations & initialization

- **Fresh install:** `db/init.sql` is mounted into the Postgres container's
  `/docker-entrypoint-initdb.d/`. Postgres runs it automatically the **first**
  time the empty `pgdata` volume is created, so all tables exist before the app
  starts. No manual step required.

- **Re-running the schema manually** (e.g. after adding a table). Every
  statement uses `IF NOT EXISTS`, so it is safe to re-apply:

  ```bash
  cd ~/prorewardhub
  set -a && . ./.env && set +a
  docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < db/init.sql
  ```

- **If you change `lib/db/schema.ts`:** update `db/init.sql` to match (add the
  new `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`),
  commit, `git pull` on the VPS, then run the manual re-apply command above.

- **Verify the tables exist:**

  ```bash
  docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
  ```

---

## 8. How production config maps to the app

- **Standalone build:** `next.config.mjs` sets `output: "standalone"`, so the
  Docker image ships only the minimal server (`server.js`) plus `.next/static`
  and `public`.
- **Better Auth:** works against `https://prorewardhub.org` because
  `BETTER_AUTH_URL` is set — it becomes both the auth base URL and a trusted
  origin in production. The shared Caddy terminates TLS and forwards the request
  to `prorewardhub-app:3000`, so session cookies are issued as `Secure` on the
  correct host. The v0-preview `SameSite=None` override is development-only and
  does not apply in production.
- **API routes, admin, login, withdrawals, notifications:** all served by the
  single `app` container; email notifications go out through Resend using
  `RESEND_API_KEY` / `RESEND_EMAIL_DOMAIN`.
- **Health checks & restart:** both services have a healthcheck and
  `restart: unless-stopped`, so containers come back automatically after a
  crash or VPS reboot.

---

## 9. Telegram login in production

The Telegram sign-in uses the official **Login Widget** (client-side) plus the
server callback at `/api/auth/telegram`. There is **no long-running bot process
to deploy** — so no separate service is required, and the `app` container
handles the verification.

You must, however, register your domain with the bot in **@BotFather** so
Telegram allows the widget on your site:

```
/setdomain  ->  select your bot  ->  prorewardhub.org
```

> If you later add a feature that needs a persistent bot process (e.g. polling
> the Telegram Bot API to auto-verify channel joins), add it as a fourth
> service in `docker-compose.yml` that reuses the same image and
> `TELEGRAM_BOT_TOKEN`, with `command:` overridden to run the bot worker. The
> current login flow does not need it.

---

## 10. Troubleshooting

| Symptom | Check |
| ------- | ----- |
| HTTPS cert not issued | DNS A records resolve to the VPS? Did you add the site block and reload Caddy (§5)? `docker logs -f prochannelhelpbot-caddy-1` |
| 502 / "no upstream" from Caddy | Is the app up and on the shared net? `docker compose ps`, then `docker network inspect prochannelhelpbot_default` should list `prorewardhub-app` |
| `caddy validate` fails | Fix the syntax in `/root/prochannelhelpbot/Caddyfile`; the old config keeps running until a successful `caddy reload` |
| Login succeeds then logs out | `BETTER_AUTH_URL` must exactly match the public URL (`https://prorewardhub.org`) |
| `Invalid origin` on auth | Same — confirm `BETTER_AUTH_URL` in `.env`, then `docker compose up -d --build` |
| Telegram widget shows "domain invalid" | Run `/setdomain` in @BotFather for your domain |
| App can't reach DB | `docker compose ps` (is `db` healthy?), confirm `POSTGRES_*` match in `.env` |
| Changes to `NEXT_PUBLIC_*` not showing | Rebuild: `docker compose up -d --build` |
| External network not found | Start the bot stack first so `prochannelhelpbot_default` exists: `docker network ls \| grep prochannelhelpbot_default` |
