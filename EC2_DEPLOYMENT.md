## EC2 Deployment (Ubuntu 24.04) — Backend on PM2 + Nginx

### 1) Provision EC2
- Region: `eu-north-1`
- Instance: t3.micro or higher
- Open inbound:
  - 22 (SSH) from your IP only
  - 80/443 from anywhere

### 2) Install system packages
```bash
sudo apt update -y
sudo apt install -y git nginx ufw
```

### 3) Install Node.js 18 LTS + PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

### 4) Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

### 5) Deploy app code
```bash
sudo mkdir -p /var/www/ted-bus
sudo chown -R $USER:$USER /var/www/ted-bus
cd /var/www/ted-bus
git clone <your-repo-url> .
```

### 6) Configure backend env
```bash
cd /var/www/ted-bus/backend
cp production.env.example .env
nano .env
```

### 7) Install deps + start with PM2
```bash
cd /var/www/ted-bus/backend
npm ci
cd /var/www/ted-bus
mkdir -p backend/logs
pm2 startOrReload ecosystem.config.js --env production
pm2 save
pm2 status
```

### 8) Configure Nginx reverse proxy
```bash
sudo cp /var/www/ted-bus/nginx.conf /etc/nginx/sites-available/ted-bus
sudo ln -sf /etc/nginx/sites-available/ted-bus /etc/nginx/sites-enabled/ted-bus
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 9) TLS (Let’s Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
# Replace with your real domain:
sudo certbot --nginx -d api.yourdomain.com
```

### 10) Operational commands
```bash
pm2 logs ted-bus-backend
pm2 restart ted-bus-backend
pm2 status
```

