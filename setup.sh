#!/bin/bash

# Setup script for Pocwisper

echo "🚀 Setting up Pocwisper..."

# Check if Docker/Podman is available
if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    COMPOSE_CMD="podman-compose"
    echo "✅ Using Podman"
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    COMPOSE_CMD="docker-compose"
    echo "✅ Using Docker"
else
    echo "❌ Neither Docker nor Podman found. Please install one of them."
    exit 1
fi

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env to configure your settings"
fi

cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

cd ..

# Pull Ollama image and setup
echo ""
echo "🤖 Setting up Ollama..."
$CONTAINER_CMD pull ollama/ollama:latest

# Start services
echo ""
echo "🚀 Starting services with $COMPOSE_CMD..."
if [ "$CONTAINER_CMD" = "podman" ]; then
    $COMPOSE_CMD -f podman-compose.yml up -d
else
    $COMPOSE_CMD up -d
fi

# Wait for Ollama to be ready
echo ""
echo "⏳ Waiting for Ollama to be ready..."
sleep 10

# Pull Ollama model
echo ""
echo "📥 Downloading Ollama llama2 model (this may take a while)..."
if [ "$CONTAINER_CMD" = "podman" ]; then
    $CONTAINER_CMD exec pocwisper-ollama ollama pull llama2
else
    $CONTAINER_CMD exec pocwisper-ollama ollama pull llama2
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Next steps:"
echo "   1. Create an account at http://localhost:3000"
echo "   2. Upload an audio file and start transcribing!"
