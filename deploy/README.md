# Deploying Kreative Studio Lab

```
                 website.taufikandrian.my.id (Caddy, HTTPS)
                ┌──────────────────────┴───────────────────────┐
     /kreative-lab/  static files                 /kreative-lab-cms/  WordPress
     /var/www/kreativ-lab                         /var/www/kreative-lab-cms
                ▲                                              │
                │ rsync over SSH                               │ publish → repository_dispatch
                │                                              ▼
          GitHub Actions ◀──────── reads content over REST ── GitHub
      (.github/workflows/deploy.yml: test → fetch-cms → build → upload)
```

WordPress never serves the public site. An editor publishes, WordPress tells GitHub,
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
mkdir -p /opt/kreative-lab-cms && cd /opt/kreative-lab-cms
# copy deploy/wordpress/docker-compose.yml and deploy/wordpress/uploads.ini here, then:
printf 'DB_PASSWORD=%s\n' "$(openssl rand -hex 24)" > .env
chmod 600 .env
sudo docker compose up -d
```

Open `https://website.taufikandrian.my.id/kreative-lab-cms/` and finish the installer.
Use a long, unique admin password, because the login page is on the public internet.

### 4. Plugins

1. In WordPress: **Plugins → Add New**, install and activate **Advanced Custom Fields**
   (the free one).
2. From your Mac: `./scripts/deploy-cms-plugin.sh`, then activate **Kreative Studio Lab
   Content**. Re-run the script whenever `wordpress/plugins/kreative-studio-lab` changes.

### 5. Seed the existing content (optional)

This creates the six case studies, the client logos and an empty contact-details entry,
matching what the site shows today:

```sh
cd /opt/kreative-lab-cms && docker compose run --rm ksl-cli wp ksl seed
```

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
| Variable | `KSL_CMS_URL` | `https://website.taufikandrian.my.id/kreative-lab-cms` |
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

## Things to know

- **The token expires.** When it does, publishing still works in WordPress but nothing
  deploys, and nothing warns you. Replace it in `.env` before the expiry date. As a
  stopgap, **Run workflow** in the Actions tab deploys the current content by hand.
- **The token can write to the repository.** Anyone who takes over the WordPress admin
  can read it from the server. Keep WordPress and its plugins updated, and keep the
  plugin count low.
- **Images are resized at build time.** Editors can upload full-size photographs. The
  build turns each into 480/960/1600px WebP files in `public/cms/`.
- **What is editable:** case studies (text, scope, hero image, gallery, adding new
  ones) and contact details. **Client logos are not wired up yet**: the logo wall still
  uses the marks cut from the deck, so editing logo entries in WordPress changes
  nothing. Page copy, the Lab capability lists and the homepage sections are still in
  the code.
- **The homepage teaser shows archive entries 01–03**, the lowest numbers, not the
  newest. A new case study appears on `/archive`, not on the homepage.
- **Rollback:** the previous build is kept at `/var/www/kreativ-lab.prev`. Swap the two
  directories to go back one deploy.
- **Manual deploy** from a Mac still works: `./scripts/deploy-vps.sh`. Set
  `KSL_CMS_URL` in `scripts/deploy.env`, or it deploys the committed fixture and rolls
  back everything editors have published.
