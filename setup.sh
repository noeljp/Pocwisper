#!/bin/bash

# Setup script for Pocwisper

echo "🚀 Setting up Pocwisper..."

# Load or create .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo "✅ Created .env file with default port configuration"
        echo "ℹ️  You can edit .env to change ports if needed"
    else
        echo "⚠️  .env.example not found. Creating .env with default values..."
        # Note: These defaults must match .env.example for consistency
        cat > .env << 'EOF'
# Port Configuration
# Change these values if you have port conflicts with other services
FRONTEND_PORT=3010
BACKEND_PORT=8010
OLLAMA_PORT=11434
EOF
        echo "✅ Created .env file with default port configuration"
        echo "ℹ️  You can edit .env to change ports if needed"
    fi
fi

# Load environment variables from .env safely
if [ -f ".env" ]; then
    set -o allexport
    source .env
    set +o allexport
fi

# Set default values if not set
FRONTEND_PORT=${FRONTEND_PORT:-3010}
BACKEND_PORT=${BACKEND_PORT:-8010}
OLLAMA_PORT=${OLLAMA_PORT:-11434}

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

# Check if Ollama is already running on configured port
echo ""
echo "🔍 Checking for existing Ollama installation..."
if curl -s http://localhost:$OLLAMA_PORT/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama detected on localhost:$OLLAMA_PORT"
    USE_EXTERNAL_OLLAMA=true
else
    echo "⚠️  No Ollama detected on localhost:$OLLAMA_PORT"
    read -p "Do you want to use a container for Ollama? (y/n) [y]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        USE_EXTERNAL_OLLAMA=false
    else
        read -p "Enter the Ollama URL (e.g., http://localhost:$OLLAMA_PORT): " OLLAMA_URL
        if [ -z "$OLLAMA_URL" ]; then
            OLLAMA_URL="http://localhost:$OLLAMA_PORT"
        fi
        USE_EXTERNAL_OLLAMA=true
        echo "Using external Ollama at: $OLLAMA_URL"
    fi
fi

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    
    # Update OLLAMA_URL in .env if using external Ollama
    if [ "$USE_EXTERNAL_OLLAMA" = true ]; then
        if [ -n "$OLLAMA_URL" ]; then
            sed -i "s|OLLAMA_URL=.*|OLLAMA_URL=$OLLAMA_URL|" .env
            echo "✅ Configured to use external Ollama at $OLLAMA_URL"
        else
            echo "✅ Configured to use external Ollama on localhost:$OLLAMA_PORT"
        fi
    fi
    
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

# Pull Ollama image and setup (only if not using external Ollama)
if [ "$USE_EXTERNAL_OLLAMA" = false ]; then
    echo ""
    echo "🤖 Setting up Ollama container..."
    $CONTAINER_CMD pull ollama/ollama:latest
fi

# Start services
echo ""
echo "🚀 Starting services with $COMPOSE_CMD..."
if [ "$USE_EXTERNAL_OLLAMA" = true ]; then
    # Use the no-ollama compose file
    if [ "$CONTAINER_CMD" = "podman" ]; then
        $COMPOSE_CMD -f podman-compose.no-ollama.yml up -d
    else
        $COMPOSE_CMD -f docker-compose.no-ollama.yml up -d
    fi
else
    if [ "$CONTAINER_CMD" = "podman" ]; then
        $COMPOSE_CMD -f podman-compose.yml up -d
    else
        $COMPOSE_CMD up -d
    fi
fi

# Wait for Ollama to be ready and pull model (only if using container Ollama)
if [ "$USE_EXTERNAL_OLLAMA" = false ]; then
    echo ""
    echo "⏳ Waiting for Ollama container to be ready..."
    sleep 10
    
    # Pull Ollama model
    echo ""
    echo "📥 Downloading Ollama llama2 model (this may take a while)..."
    if ! $CONTAINER_CMD exec pocwisper-ollama ollama pull llama2; then
        echo "⚠️  Failed to download Ollama model. The container may not be ready yet."
        echo "    You can manually run this command later:"
        echo "    $CONTAINER_CMD exec pocwisper-ollama ollama pull llama2"
    fi
else
    echo ""
    echo "ℹ️  Using external Ollama. Make sure llama2 model is available:"
    echo "    ollama pull llama2"
    echo ""
    echo "🔍 Checking if llama2 model is available..."
    if curl -s ${OLLAMA_URL:-http://localhost:$OLLAMA_PORT}/api/tags | grep -q "llama2"; then
        echo "✅ llama2 model is available"
    else
        echo "⚠️  llama2 model not found. Please install it with: ollama pull llama2"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend API: http://localhost:$BACKEND_PORT"
echo "   API Docs: http://localhost:$BACKEND_PORT/docs"
echo ""
echo "📝 Next steps:"
echo "   1. Create an account at http://localhost:$FRONTEND_PORT"
echo "   2. Upload an audio file and start transcribing!"
