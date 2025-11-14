# Webrec

A webhook-based web recording tool that captures websites in smooth, high-quality video format. Simply send a URL via HTTP POST request, and Webrec will record the website in 1080x1920 (9:16 portrait) resolution.

## Features

- 🎥 **High-Quality Recording**: Captures websites at 1080x1920 resolution (9:16 portrait format)
- 🚀 **Webhook API**: Simple REST API endpoint for triggering recordings
- 🐳 **Docker Ready**: Fully containerized for easy deployment
- ⚡ **Async Processing**: Returns immediately while recording in the background
- 🎬 **Smooth Playback**: Records at 60 FPS for smooth video output
- 📦 **WebM Format**: Efficient video encoding with WebM format
- 🔒 **Security**: Rate limiting, input validation, and no known vulnerabilities

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start the service
docker-compose up -d

# Check if it's running
curl http://localhost:3000/health

# Trigger a recording
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "duration": 30}'

# Recordings will be saved to ./recordings directory
```

### Using Docker

```bash
# Build the image
docker build -t webrec .

# Run the container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/recordings:/app/recordings \
  --name webrec \
  webrec

# Trigger a recording
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Local Development

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start the server
npm start

# Or use nodemon for development
npm run dev
```

## API Endpoints

### POST /record

Trigger a new website recording.

**Request Body:**
```json
{
  "url": "https://example.com",
  "duration": 30,
  "filename": "my-recording"
}
```

**Parameters:**
- `url` (required): The website URL to record
- `duration` (optional): Recording duration in seconds (default: 30)
- `filename` (optional): Output filename without extension (default: `recording-{timestamp}`)

**Response:**
```json
{
  "status": "accepted",
  "message": "Recording request accepted",
  "recordingId": "1699999999999",
  "url": "https://example.com",
  "duration": 30,
  "filename": "my-recording.webm"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "webrec",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /recordings

List all recordings.

**Response:**
```json
{
  "count": 2,
  "recordings": [
    {
      "filename": "recording-1699999999999.webm",
      "path": "/app/recordings/recording-1699999999999.webm"
    }
  ]
}
```

## Configuration

Environment variables can be set in `.env` file or passed to Docker:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `VIDEO_WIDTH` | 1080 | Video width in pixels |
| `VIDEO_HEIGHT` | 1920 | Video height in pixels (9:16 ratio) |
| `VIDEO_FPS` | 60 | Frames per second |
| `VIDEO_DURATION` | 30 | Default recording duration in seconds |
| `OUTPUT_DIR` | ./recordings | Directory for saving recordings |

## Integration Example

### From a CMS or Application

```javascript
// JavaScript/Node.js example
const response = await fetch('http://your-server:3000/record', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    duration: 45,
    filename: 'my-website-recording'
  })
});

const result = await response.json();
console.log(result);
```

```python
# Python example
import requests

response = requests.post('http://your-server:3000/record', json={
    'url': 'https://example.com',
    'duration': 45,
    'filename': 'my-website-recording'
})

print(response.json())
```

```bash
# cURL example
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "duration": 45,
    "filename": "my-website-recording"
  }'
```

## How It Works

1. **Webhook Received**: Your CMS/application sends a POST request with the target URL
2. **Immediate Response**: The server responds immediately with recording details
3. **Browser Launch**: Puppeteer launches a headless Chromium browser
4. **Page Rendering**: The website is loaded at 1080x1920 resolution
5. **Screen Recording**: The page is recorded for the specified duration with smooth scrolling
6. **Video Saved**: The recording is saved as a WebM file in the recordings directory

## Output

- **Format**: WebM (VP8/VP9 video codec)
- **Resolution**: 1080x1920 (9:16 portrait)
- **Frame Rate**: 60 FPS (configurable)
- **Location**: `./recordings/` directory (mounted volume in Docker)

## Troubleshooting

### Container won't start

Check Docker logs:
```bash
docker logs webrec
```

### Recording failed

- Ensure the URL is accessible from the container
- Check if the website blocks automated browsers
- Verify sufficient disk space for recordings

### Low quality or choppy video

- Increase `VIDEO_FPS` environment variable
- Ensure the host has sufficient CPU and memory
- Consider reducing resolution for better performance

## Requirements

- Docker and Docker Compose (for containerized deployment)
- Node.js 18+ (for local development)
- Sufficient disk space for recordings
- 2GB+ RAM recommended

## Security

Webrec includes several security features:
- Rate limiting to prevent abuse
- Input validation and sanitization
- Protocol whitelist (only HTTP/HTTPS)
- Filename sanitization to prevent path traversal
- No known vulnerabilities (CodeQL verified)

For more details, see [SECURITY.md](SECURITY.md)

## License

MIT