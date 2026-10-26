# Deployment — Vijayagiri Public Web Portal

Ubuntu VPS · Nginx reverse proxy · PM2 process manager · app on internal port `3001`.

## 1. Server Prerequisites

- Ubuntu 22.04 / 24.04 LTS

```bash
sudo apt update && sudo apt install -y git nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. Project Setup & Build

```bash
sudo mkdir -p /var/www/vijayagiri-public
sudo chown $USER:$USER /var/www/vijayagiri-public
git clone https://github.com/Intellijohn-Labs/vijayagiri_public_web.git /var/www/vijayagiri-public
cd /var/www/vijayagiri-public

npm install
npm run build
pm2 start npm --name "vijayagiri-public" -- start -p 3001

pm2 startup   # run the command it prints (with sudo)
pm2 save
```

## 3. Nginx Reverse Proxy & SSL

Create `/etc/nginx/sites-available/vijayagiri-public` (replace `example.com`):

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it and reload:

```bash
sudo ln -s /etc/nginx/sites-available/vijayagiri-public /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Free SSL (port 443) with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx
```

## 4. Redeployment

From `/var/www/vijayagiri-public`:

```bash
git pull origin main && npm install && npm run build && pm2 restart vijayagiri-public
```
