# Chess Master Deployment Guide

This guide explains how to deploy **Chess Master** (frontend and backend) on a VPS using Docker, Docker Compose, and Nginx with HTTPS support via Let’s Encrypt.

---

## 1. Prerequisites

- VPS running Ubuntu (tested on 22.04)
- Docker and Docker Compose installed
- Domain name pointed to your VPS IP
- Basic knowledge of Linux commands

---

## 2. Project Structure

```
chess-master/
├─ chess-master-frontend/
├─ chess-master-backend/
├─ docker-compose.yml
├─ secrets/
│  ├─ postgres_user.txt
│  ├─ postgres_password.txt
│  ├─ redis_password.txt
│  └─ redis_url.txt
```

---

## 3. Update Frontend API URL

In your frontend Dockerfile (`chess-master-frontend/Dockerfile.prod`), make sure to set:

```dockerfile
ENV REACT_APP_API_URL=https://loclhost:3004
```

- This ensures the frontend connects to the backend container inside the Docker network.
- If using a domain, replace `http://loclhost:3004` with `https://yourdomain.com/api`.

---

## 4. Nginx Initial Setup

Install Nginx on your VPS if not already installed:

```bash
sudo apt update
sudo apt install nginx -y
```

Create a site configuration file:

```bash
sudo nano /etc/nginx/sites-available/chess.conf
```

Example config:

```nginx
server {
    listen 80;
    server_name 185.141.61.15;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }

    location /api {
        rewrite ^/api/?(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:3004;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chess.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Deploy Using Docker Compose

Build and run the production containers:

```bash
docker compose -f docker-compose.yml up -d --build
```

- This will spin up frontend, backend, Postgres, and Redis services.
- Make sure `secrets/` folder exists with proper content.

Check logs:

```bash
docker compose -f docker-compose.yml logs -f
```

---

## 6. Enable HTTPS via Let’s Encrypt

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Run Certbot to generate SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.com
```

- Follow prompts (enter email, agree to TOS, choose redirect HTTP → HTTPS)
- Certbot will automatically modify Nginx to redirect HTTP to HTTPS

Check certificate renewal:

```bash
sudo certbot renew --dry-run
```

---

## 7. Verify Deployment

- Frontend should be accessible at `https://yourdomain.com`
- Backend API at `https://yourdomain.com/api/`
- Use `docker compose -f docker-compose.prod.yml ps` to verify containers are running.

---

## 8. Notes

- If you change backend port or domain, update `REACT_APP_API_URL` in frontend Dockerfile and rebuild.
- Secrets (Postgres/Redis credentials) are handled via Docker Swarm secrets or files mounted at `/run/secrets/`.
- The Docker network allows containers to talk using service names (`backend`, `frontend`, etc.)

---

## 9. Useful Commands

```bash
# Build and run containers
docker compose -f docker-compose.yml up -d --build

# Stop containers
docker compose -f docker-compose.yml down

# View logs
docker compose -f docker-compose.yml logs -f
```
