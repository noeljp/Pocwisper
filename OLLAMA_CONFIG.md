# Ollama Configuration Options

This document explains how to configure Pocwisper to work with Ollama in different scenarios.

## Overview

Pocwisper can be configured to use Ollama in two ways:

1. **External Ollama** - Use an existing Ollama installation on your server (port 11434)
2. **Container Ollama** - Deploy Ollama as a Docker/Podman container

## Option 1: External Ollama (Recommended if already installed)

If you already have Ollama installed and running on your server on port 11434, use this option.

### Automatic Setup

Run the setup script, which will automatically detect your Ollama installation:

```bash
./setup.sh
```

The script will:
- Detect if Ollama is accessible on localhost:11434
- Configure the backend to use the external Ollama
- Skip the Ollama container deployment

### Manual Setup

#### Using Docker

```bash
docker-compose -f docker-compose.no-ollama.yml up -d
```

#### Using Podman

```bash
podman-compose -f podman-compose.no-ollama.yml up -d
```

### Configuration

Ensure your backend/.env file has the correct Ollama URL:

```
OLLAMA_URL=http://localhost:11434
```

### Prerequisites

- Ollama must be running on port 11434
- The llama2 model must be installed: `ollama pull llama2`

### Verification

Check if Ollama is accessible:

```bash
curl http://localhost:11434/api/tags
```

This should return a JSON response with available models.

## Option 2: Container Ollama

If you don't have Ollama installed, or prefer containerization, use this option.

### Automatic Setup

Run the setup script and choose to use a container:

```bash
./setup.sh
```

When prompted, answer "y" to use a container for Ollama.

### Manual Setup

#### Using Docker

```bash
docker-compose up -d
```

#### Using Podman

```bash
podman-compose -f podman-compose.yml up -d
```

### What Happens

- An Ollama container will be created and started
- The llama2 model will be downloaded automatically
- The backend will connect to the Ollama container

## Networking Details

### External Ollama

When using external Ollama:

- **Docker**: Uses `host.docker.internal:11434` to access the host machine
- **Podman**: Uses `10.0.2.2:11434` (default gateway to host)
- **Native setup**: Uses `localhost:11434`

### Container Ollama

When using container Ollama:

- Containers communicate via Docker/Podman internal networking
- Backend connects to `http://ollama:11434`

## Troubleshooting

### Backend can't connect to external Ollama

1. Verify Ollama is running:
   ```bash
   systemctl status ollama  # if using systemd
   # or
   ps aux | grep ollama
   ```

2. Check if port 11434 is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. If using Docker, ensure host.docker.internal is accessible:
   ```bash
   docker run --rm curlimages/curl http://host.docker.internal:11434/api/tags
   ```

4. For Podman, the host gateway may differ. Check with:
   ```bash
   podman run --rm curlimages/curl http://10.0.2.2:11434/api/tags
   ```

### Model not found

Install the llama2 model:

```bash
ollama pull llama2
```

### Switching between External and Container Ollama

To switch from container to external (or vice versa):

1. Stop current containers:
   ```bash
   docker-compose down
   # or
   podman-compose down
   ```

2. Choose the appropriate compose file and start again:
   ```bash
   # For external Ollama
   docker-compose -f docker-compose.no-ollama.yml up -d
   
   # For container Ollama
   docker-compose up -d
   ```

3. Update backend/.env with the correct OLLAMA_URL if needed

## Advanced Configuration

### Custom Ollama URL

If your Ollama is running on a different host or port, edit backend/.env:

```
OLLAMA_URL=http://your-ollama-server:11434
```

### Using a Different Model

To use a different Ollama model, edit backend/app/services/ollama_service.py and change the model name in the `generate_text` method.

Don't forget to pull the model first:

```bash
ollama pull <model-name>
```
