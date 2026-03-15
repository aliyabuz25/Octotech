# Octotech

## Portainer + Traefik deploy (octotech.az)

- Portainer Stack: `docker-compose.yml` (Traefik external network: `edge`, entrypoint: `web`)
- Cloudflared Public Hostnames target: `http://127.0.0.1:8080` (Traefik)
- Stack Node.js ile çalışır (statik site + opsiyonel `/api/message` proxy).

`/api/message` kullanacaksanız Portainer'da environment olarak şunları girin:
- `HUBMSG_API_KEY`
- `HUBMSG_RECIPIENTS` (örn: `+905..., +994...`)

Alternatif stack dosyası: `deploy/octotech/stack.yml`.
