# Deploying Kreative Studio Lab

```
                    website.taufikandrian.my.id (Caddy, HTTPS)
                                /kreative-lab/
                ┌──────────────────────┴───────────────────────┐
     every other path  static files         wp-admin, wp-login.php, wp-content,
     /var/www/kreativ-lab                   ?rest_route=…  WordPress
                ▲                           /var/www/ksl-wordpress/kreative-lab
                │ rsync over SSH                               │ publish → repository_dispatch
                │                                              ▼
          GitHub Actions ◀──────── reads content over REST ── GitHub
      (.github/workflows/deploy.yml: test → fetch-cms → build → upload)
```
The public site and WordPress share one address. Caddy sends WordPress's own paths
(`/kreative-lab/wp-admin/`, `wp-login.php`, `wp-content/` and the REST API) to WordPress
and serves every other path from the static build. WordPress never serves the public site. An editor publishes, WordPress tells GitHub,
GitHub rebuilds the static site from the new content and uploads it. It is live within
a few minutes. Code changes go live the same way when they reach `master`.

The site keeps working if WordPress is down. Only publishing stops. If WordPress
cannot be read or its content fails validation, the build fails and the live site stays
as it was.

## One-time setup

Everything below happens once. The order matters: WordPress must exist before GitHub
can read it, and content should be seeded before the GitHub token is set, or seeding
fires a deploy for every one of its ~30 posts.

### 1. DNS

Add an `A` record for `website.taufikandrian.my.id` pointing at the VPS. Ports 80 and 443
must be open. Caddy obtains the certificate by itself.

### 2. Caddy

Caddy already runs as `n8n-caddy-1` (compose project `/home/ubuntu/n8n`), mounts
`/var/www` at `/srv/www`, and sits on the `n8n_default` network. Nothing about the
container changes: merge `deploy/Caddyfile.snippet` into `/home/ubuntu/n8n/Caddyfile`,
editing the file in place, then:

```sh
sudo docker exec n8n-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo docker exec -w /etc/caddy n8n-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

### 3. WordPress

```sh
# The folder name is the compose project name, and the database volume is named after
# it. It stays kreative-lab-cms although the address no longer says so.
mkdir -p /opt/kreative-lab-cms && cd /opt/kreative-lab-cms
# copy deploy/wordpress/docker-compose.yml and deploy/wordpress/uploads.ini here, then:
printf 'DB_PASSWORD=%s\n' "$(openssl rand -hex 24)" > .env
chmod 600 .env
sudo docker compose up -d
```

Open `https://website.taufikandrian.my.id/kreative-lab/wp-admin/install.php` and finish the
installer. (`/kreative-lab/` itself is the public site, so the installer is not there.)
Use a long, unique admin password, because the login page is on the public internet.

### 4. Plugins

1. In WordPress: **Plugins → Add New**, install and activate **Advanced Custom Fields**
   (the free one).
2. From your Mac: `./scripts/deploy-cms-plugin.sh`, then activate **Kreative Studio Lab
   Content**. Re-run the script whenever `wordpress/plugins/kreative-studio-lab` changes.

### 5. Seed the existing content

This creates the six case studies, the client logos, an empty contact-details entry and
the **Site Pages** (every other editable section, prefilled with today's copy):

```sh
cd /opt/kreative-lab-cms && docker compose run --rm ksl-cli wp ksl seed
```

The seed is safe to run again at any time. It only creates what is missing and only
fills empty fields, so it never overwrites an editor's work. Re-run it after every plugin
update that adds editable fields.

Then fill in **Site Settings** (phone, email, address). Until you do, `/contact` keeps
showing the numbers transcribed from the deck.

### 6. Let GitHub deploy to the VPS

The deploy logs in as `ubuntu` (root login is disabled on this VPS) and swaps
directories inside `/var/www`, so `ubuntu` must own it. Once, on the VPS:

```sh
sudo mkdir -p /var/www && sudo chown ubuntu:ubuntu /var/www
```

Create a key used only for deploys, on your Mac:

```sh
ssh-keygen -t ed25519 -N '' -C github-deploy -f ~/.ssh/kreative-lab-deploy
ssh-copy-id -i ~/.ssh/kreative-lab-deploy.pub ubuntu@<VPS IP>
ssh-keyscan -H <VPS IP>                 # output goes into VPS_KNOWN_HOSTS
```

In GitHub, go to **Settings → Secrets and variables → Actions**:

| Kind | Name | Value |
|---|---|---|
| Secret | `VPS_HOST` | the VPS IP |
| Secret | `VPS_USER` | `ubuntu` |
| Secret | `VPS_SSH_KEY` | contents of `~/.ssh/kreative-lab-deploy` (the private key) |
| Secret | `VPS_KNOWN_HOSTS` | output of the `ssh-keyscan` above |
| Variable | `KSL_CMS_URL` | `https://website.taufikandrian.my.id/kreative-lab` |
| Variable | `DEPLOY_PATH` | only if not `/var/www/kreativ-lab` |
| Variable | `BASE_PATH` | only if not `/kreative-lab` |

Merge `development` into `master` (the workflow only runs from the default branch), then
open **Actions → Deploy → Run workflow** once and check the site.

### 7. Let WordPress trigger deploys

Create a **fine-grained personal access token** at GitHub → Settings → Developer
settings:

- Repository access: **only** `taufikandrian18/kreativ-lab`
- Permissions: **Contents: Read and write**. GitHub requires exactly this to send a
  `repository_dispatch`.
- Expiration: set a calendar reminder for it.

Add it to `/opt/kreative-lab-cms/.env` and restart:

```sh
KSL_GITHUB_REPO=taufikandrian18/kreativ-lab
KSL_GITHUB_TOKEN=github_pat_...
```

```sh
docker compose up -d
```

Publish any change in WordPress and watch **Actions** start a run.

## Updating the plugin

The CMS never shows its own front end. Any request that reaches WordPress outside the
admin (`/kreative-lab/index.php`, an old `?p=` link), and "Visit Site" in the admin bar, goes to the public site; a case study's
WordPress link lands on its page there. The public address defaults to
`https://website.taufikandrian.my.id/kreative-lab` and can be changed in wp-config.php
with `define( 'KSL_PUBLIC_SITE_URL', '...' );`. The admin, REST, login and cron are
unaffected.

After a plugin change is merged (this repository's `wordpress/plugins/kreative-studio-lab`):

```sh
./scripts/deploy-cms-plugin.sh                                    # on your Mac
cd /opt/kreative-lab-cms && sudo docker compose run --rm ksl-cli wp ksl seed   # on the VPS
```

To bring copy the studio never edited up to the current wording (after a copy rewrite in
`data/site-pages.json`), add `--refresh-copy`:

```sh
cd /opt/kreative-lab-cms && sudo docker compose run --rm ksl-cli wp ksl seed --refresh-copy
```

It replaces a field only when its stored text is still exactly a previous default (the
`was` list beside each field) and prints each one it changes. Anything an editor typed
is left alone, so it is safe to run on a live site.

Then save any page in WordPress, or press **Run workflow**, to deploy. Until the plugin
is updated, deploys still work: a Site Pages collection the server does not have yet is
treated as empty, and the site shows its current copy.

## Moving the CMS from /kreative-lab-cms/ to /kreative-lab/ (once, 2026-09)

WordPress used to have its own address, `/kreative-lab-cms/`. It now lives under the
public site's prefix, with the admin at `/kreative-lab/wp-admin/`. A VPS set up before
that change needs these steps once, in this order. The public site stays up throughout;
the admin is down for a minute or two between steps 3 and 5.

```sh
cd /opt/kreative-lab-cms

# 1. Back up the database and the files.
sudo docker compose run --rm -T ksl-cli wp db export - > ~/ksl-before-move.sql
sudo tar -C /var/www -czf ~/ksl-files-before-move.tgz kreative-lab-cms
sudo cp docker-compose.yml docker-compose.yml.before-move

# 2. Rewrite the stored addresses (uploads, links, home and siteurl). Look at the
#    dry run first: only a handful of rows should show a count above 0 (home,
#    siteurl, content that links an upload). Then run it for real.
sudo docker compose run --rm ksl-cli wp search-replace kreative-lab-cms kreative-lab \
  --all-tables-with-prefix --skip-columns=guid --dry-run
sudo docker compose run --rm ksl-cli wp search-replace kreative-lab-cms kreative-lab \
  --all-tables-with-prefix --skip-columns=guid

# 3. Stop WordPress and move its files to where the new address expects them.
sudo docker compose down            # keeps the database volume; never add -v
sudo mkdir -p /var/www/ksl-wordpress
sudo mv /var/www/kreative-lab-cms /var/www/ksl-wordpress/kreative-lab

# 4. Replace docker-compose.yml with the new deploy/wordpress/docker-compose.yml
#    (same .env, same uploads.ini), then start it again.
sudo docker compose up -d
```

5. **Caddy:** replace the Kreative Lab lines in `/home/ubuntu/n8n/Caddyfile` with the
   new `deploy/Caddyfile.snippet` (edit in place), then validate and reload as in step 2
   of the setup above.
6. **GitHub:** set the Actions variable `KSL_CMS_URL` to
   `https://website.taufikandrian.my.id/kreative-lab`.
7. **Your Mac:** if `scripts/deploy.env` sets `CMS_PATH` or `KSL_CMS_URL`, change them to
   `/var/www/ksl-wordpress/kreative-lab` and `https://website.taufikandrian.my.id/kreative-lab`.
8. **Check**, from your Mac:

   ```sh
   B=https://website.taufikandrian.my.id
   curl -sI $B/kreative-lab/wp-admin/ | head -3          # 302 to …/kreative-lab/wp-login.php
   curl -s "$B/kreative-lab/?rest_route=/wp/v2/site-settings" | head -c 200; echo   # JSON
   curl -sI $B/kreative-lab/ | head -1                    # 200, the public site
   curl -sI $B/kreative-lab-cms/wp-admin/ | grep -i location   # …/kreative-lab/wp-admin/
   ```

   Log in at `/kreative-lab/wp-admin/`, then press **Run workflow** in Actions once so a
   deploy reads from the new address.

If step 2 or 4 goes wrong: `sudo docker compose down`, move the directory back to
`/var/www/kreative-lab-cms`, restore `docker-compose.yml.before-move`, import the backup with
`sudo docker compose run --rm -T ksl-cli wp db import - < ~/ksl-before-move.sql`, and start
it again.

## Locking down the rest of the VPS

The VPS also runs other projects, and some of them publish internal services on every
network interface (`0.0.0.0`): Redis `6379`, Postgres `5433`, Celery Flower `5555`, Svix
`8071`, Portainer `8000`/`9443`, and the open-wearables app on `3000`/`8010`. Redis and
Flower have no password by default. Docker-published ports bypass `ufw`, so the Tencent
Cloud firewall is what keeps them private. Checked from outside on 2026-09-24: only 22,
80 and 443 answered. Keep it that way, and test from your Mac (not the server) after any
firewall change:

```sh
for p in 22 80 443 3000 5433 5555 6379 8000 8010 8071 9443; do
  nc -z -w 3 <VPS IP> $p && echo "$p OPEN" || echo "$p closed"
done
```

1. **Firewall:** in the Tencent Cloud console, the instance's **Firewall** (Lighthouse) or
   **Security Group** (CVM) should allow only **22, 80 and 443** from `0.0.0.0/0`.
2. **Defence in depth:** in each project's `docker-compose.yml`, publish those ports on
   loopback only, then `sudo docker compose up -d`:
   ```yaml
   ports:
     - "127.0.0.1:6379:6379"   # was "6379:6379"
   ```
   Services that only other containers need (Redis, Postgres, Svix) need no `ports:`
   entry at all. Reach Portainer or Flower from your Mac through an SSH tunnel instead:
   `ssh -L 9443:127.0.0.1:9443 ubuntu@<VPS IP>`, then open `https://localhost:9443`.
   Then the services stay private even if a firewall rule is opened by mistake.

## Things to know

- **If the token is revoked or deleted**, publishing still works in WordPress but nothing
  deploys, and nothing warns you. The current token is set to never expire. **Run
  workflow** in the Actions tab deploys the current content by hand.
- **The token can write to the repository.** Anyone who takes over the WordPress admin
  can read it from the server. Keep WordPress and its plugins updated, and keep the
  plugin count low.
- **Images are resized at build time.** Editors can upload full-size photographs. The
  build turns each into 480/960/1600px WebP files in `public/cms/`.
- **What is editable:** every section of every page, the menu labels, SEO title and
  description, case studies, client logos and contact details. See
  [`docs/editing-content.md`](../docs/editing-content.md) for the editor's guide. What
  stays in code: the layout, the motion, the colours and the list of pages.
- **Rollback:** the previous build is kept at `/var/www/kreativ-lab.prev`. Swap the two
  directories to go back one deploy.
- **Manual deploy** from a Mac still works: `./scripts/deploy-vps.sh`. Set
  `KSL_CMS_URL` in `scripts/deploy.env`, or it deploys the committed fixture and rolls
  back everything editors have published.
