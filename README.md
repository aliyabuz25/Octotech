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

Not: Stack artık `/datastore/octotech/app/nginx.conf` dosyasını container içine bind etmiyor (dosya/klasör tipi uyuşmazlığı Portainer deploy'unu bozabiliyor). `nginx:alpine` default config ile statik dosyalar servis edilir.

Alternatif stack dosyası: `deploy/octotech/stack.yml`.
