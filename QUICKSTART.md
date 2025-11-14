# Quick Start Guide

Get Webrec up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Basic understanding of Docker

## Step 1: Clone or Download

```bash
git clone https://github.com/garytube/Webrec.git
cd Webrec
```

## Step 2: Start the Service

```bash
docker-compose up -d
```

That's it! The service is now running on port 3000.

## Step 3: Verify It's Running

```bash
curl http://localhost:3000/health
```

Expected output:
```json
{
  "status": "ok",
  "service": "webrec",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Step 4: Record Your First Website

```bash
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "duration": 10}'
```

Expected output:
```json
{
  "status": "accepted",
  "message": "Recording request accepted",
  "recordingId": "1699999999999",
  "url": "https://example.com",
  "duration": 10,
  "filename": "recording-1699999999999.webm"
}
```

## Step 5: Find Your Recording

After waiting for the recording to complete (10 seconds in this example):

```bash
ls -lh recordings/
```

Your video file will be there as a `.webm` file!

## Step 6: Play Your Recording

You can play the WebM file using:
- VLC Media Player
- Chrome/Firefox browser
- Any modern video player

## Common Use Cases

### Record with Custom Filename

```bash
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "duration": 30,
    "filename": "my-awesome-site"
  }'
```

### Record for Longer Duration

```bash
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "duration": 60
  }'
```

Maximum duration: 300 seconds (5 minutes)

### List All Recordings

```bash
curl http://localhost:3000/recordings
```

## Customization

Edit `docker-compose.yml` to customize settings:

```yaml
environment:
  - VIDEO_WIDTH=1080      # Width in pixels
  - VIDEO_HEIGHT=1920     # Height in pixels (9:16 ratio)
  - VIDEO_FPS=60          # Frames per second
  - VIDEO_DURATION=30     # Default duration in seconds
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

## Stopping the Service

```bash
docker-compose down
```

## Viewing Logs

```bash
docker-compose logs -f
```

## Need Help?

- Read the [full README](README.md)
- Check [examples](EXAMPLES.md) for integration code
- Review [security documentation](SECURITY.md)

## Production Deployment

For production use, consider:
1. Adding HTTPS with a reverse proxy (nginx, Traefik)
2. Implementing authentication (API keys)
3. Setting up monitoring and logging
4. Configuring backup for recordings
5. Setting resource limits in docker-compose.yml

See README.md for more details on production deployment.
