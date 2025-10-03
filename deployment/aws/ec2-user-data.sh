#!/bin/bash
yum update -y
yum install -y docker git

# Start Docker service
service docker start
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Clone repository (replace with your repository URL)
cd /home/ec2-user
git clone https://github.com/yourusername/ovenxpress.git
cd ovenxpress

# Set up environment variables
cp backend/env.example backend/.env
# Edit the .env file with production values

# Install dependencies and build
cd backend && npm install
cd ../client && npm install && npm run build

# Start services with PM2
cd ../backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
