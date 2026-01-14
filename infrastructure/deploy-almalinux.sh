#!/bin/bash

# Deployment script for AlmaLinux 10 with Podman

set -e

echo "🚀 Deploying Pocwisper on AlmaLinux 10..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
dnf update -y

# Install dependencies
echo "📦 Installing dependencies..."
dnf install -y podman podman-compose git nginx firewalld

# Create application directory
APP_DIR="/opt/pocwisper"
echo "📁 Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
    echo "📥 Updating existing repository..."
    git pull
else
    echo "📥 Cloning repository..."
    # Try HTTPS first, fall back to user instruction if it fails
    if ! git clone https://github.com/noeljp/Pocwisper.git .; then
        echo "⚠️  HTTPS clone failed. Please clone manually using SSH or provide credentials:"
        echo "    git clone git@github.com:noeljp/Pocwisper.git $APP_DIR"
        exit 1
    fi
fi

# Setup backend environment
echo "⚙️  Setting up backend environment..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    # Generate a secure random key
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/your-secret-key-change-this-in-production/$SECRET_KEY/" .env
    echo "✅ Generated secure SECRET_KEY"
fi
cd ..

# Configure firewall
echo "🔥 Configuring firewall..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --add-port=80/tcp --permanent
firewall-cmd --add-port=443/tcp --permanent
firewall-cmd --add-port=3000/tcp --permanent
firewall-cmd --add-port=8000/tcp --permanent
firewall-cmd --reload

# Start services with Podman
echo "🚀 Starting Pocwisper services..."
podman-compose -f podman-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Pull Ollama model
echo "📥 Downloading Ollama model..."
podman exec pocwisper-ollama ollama pull llama2

# Install systemd service
echo "⚙️  Installing systemd service..."
cp infrastructure/pocwisper.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable pocwisper.service

# Setup Nginx (optional)
read -p "Do you want to setup Nginx reverse proxy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚙️  Setting up Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    # Copy nginx config
    cp infrastructure/nginx.conf /etc/nginx/conf.d/pocwisper.conf
    
    echo "⚠️  Please edit /etc/nginx/conf.d/pocwisper.conf and set your domain name"
    echo "⚠️  Then run: systemctl reload nginx"
fi

# Set SELinux context (if SELinux is enabled)
if [ -x "$(command -v getenforce)" ] && [ "$(getenforce)" != "Disabled" ]; then
    echo "⚙️  Configuring SELinux..."
    semanage port -a -t http_port_t -p tcp 3000 2>/dev/null || true
    semanage port -a -t http_port_t -p tcp 8000 2>/dev/null || true
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check services are running: podman ps"
echo "   2. Access frontend at: http://$(hostname -I | awk '{print $1}'):3000"
echo "   3. Access backend API at: http://$(hostname -I | awk '{print $1}'):8000"
echo "   4. View API docs at: http://$(hostname -I | awk '{print $1}'):8000/docs"
echo ""
echo "   For production setup:"
echo "   - Edit backend/.env with production settings"
echo "   - Setup SSL certificates (Let's Encrypt recommended)"
echo "   - Configure Nginx reverse proxy"
echo "   - Setup regular backups"
echo ""
