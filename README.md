# Octotech

## Portainer + Traefik deploy (octotech.az)

- Portainer Stack: `docker-compose.yml` (Traefik external network: `edge`, entrypoint: `web`)
- Cloudflared Public Hostnames target: `http://127.0.0.1:8080` (Traefik)
- Stack `octotech-frontend:latest` image'ını kullanır; image'ı host'ta build edin:

```bash
sudo mkdir -p /datastore/octotech/{app,nginx-logs}
sudo cp deploy/octotech/octotech.zip /datastore/octotech/octotech.zip
sudo unzip -o /datastore/octotech/octotech.zip -d /datastore/octotech/app
docker build -t octotech-frontend:latest -f /datastore/octotech/app/Dockerfile.frontend /datastore/octotech/app
```

Alternatif stack dosyası: `deploy/octotech/stack.yml`.
