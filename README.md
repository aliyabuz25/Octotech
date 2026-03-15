# Octotech

## Portainer + Traefik deploy (octotech.az)

- Portainer Stack: `docker-compose.yml` (Traefik external network: `edge`, entrypoint: `web`)
- Cloudflared Public Hostnames target: `http://127.0.0.1:8080` (Traefik)
- Stack `nginx:alpine` kullanır ve site dosyalarını host'tan volume ile okur (özel image pull/build yok).

```bash
sudo mkdir -p /datastore/octotech/{app,nginx-logs}
sudo cp deploy/octotech/octotech.zip /datastore/octotech/octotech.zip
sudo unzip -o /datastore/octotech/octotech.zip -d /datastore/octotech/app
```

Not: Stack `/datastore/octotech/app/nginx.conf` dosyasını bind etmez; Nginx config container açılışında otomatik oluşturulur (SPA fallback + asset path'leri için).
Not 2: Stack açılışta `/datastore/octotech/app` içinden site dosyalarını container içine kopyalar. `index.html` root'ta yoksa, `/datastore/octotech/app` altında (max depth 6) `index.html` arar (örn. `/datastore/octotech/app/app/index.html`).

Alternatif stack dosyası: `deploy/octotech/stack.yml`.
