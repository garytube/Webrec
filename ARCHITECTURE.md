# Webrec Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Webrec System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │              │         │              │                     │
│  │   CMS/Web    │  POST   │   Express    │                     │
│  │   Application│────────▶│   Server     │                     │
│  │              │ /record │   (Port 3000)│                     │
│  └──────────────┘         └──────┬───────┘                     │
│                                  │                              │
│                                  │ Validates                    │
│                                  │ - URL format                 │
│                                  │ - Protocol (http/https)      │
│                                  │ - Duration (1-300s)          │
│                                  │ - Filename                   │
│                                  │                              │
│                                  ▼                              │
│                         ┌─────────────────┐                     │
│                         │  Rate Limiter   │                     │
│                         │  100/15min      │                     │
│                         │  10/15min /rec  │                     │
│                         └────────┬────────┘                     │
│                                  │                              │
│                                  ▼                              │
│                         ┌─────────────────┐                     │
│                         │   Recording     │                     │
│                         │   Service       │                     │
│                         └────────┬────────┘                     │
│                                  │                              │
│                                  │ Launches                     │
│                                  ▼                              │
│                         ┌─────────────────┐                     │
│                         │   Puppeteer     │                     │
│                         │   + Chromium    │                     │
│                         └────────┬────────┘                     │
│                                  │                              │
│                                  │ 1. Navigate to URL           │
│                                  │ 2. Set viewport 1080x1920    │
│                                  │ 3. Start screen recording    │
│                                  │ 4. Smooth scroll + record    │
│                                  │ 5. Stop & save video         │
│                                  │                              │
│                                  ▼                              │
│                         ┌─────────────────┐                     │
│                         │   Recordings/   │                     │
│                         │   *.webm files  │                     │
│                         └─────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
1. Client Request
   │
   ├─▶ POST /record
   │   {
   │     "url": "https://example.com",
   │     "duration": 30,
   │     "filename": "my-recording"
   │   }
   │
   ▼
2. Input Validation
   │
   ├─▶ URL: Valid format? Protocol allowed?
   ├─▶ Duration: Between 1-300 seconds?
   ├─▶ Filename: Sanitized, no special chars?
   │
   ▼
3. Rate Limiting Check
   │
   ├─▶ Global: < 100 requests/15min?
   ├─▶ Recording: < 10 requests/15min?
   │
   ▼
4. Immediate Response
   │
   ├─▶ {
   │     "status": "accepted",
   │     "recordingId": "1234567890",
   │     "filename": "my-recording.webm"
   │   }
   │
   ▼
5. Background Processing (Async)
   │
   ├─▶ Launch Headless Browser
   ├─▶ Navigate to URL
   ├─▶ Wait for Page Load
   ├─▶ Start Screen Recording
   ├─▶ Smooth Scroll (duration seconds)
   ├─▶ Stop Recording
   ├─▶ Save to /recordings/
   │
   ▼
6. Video File Created
   └─▶ /recordings/my-recording.webm
```

## Component Details

### 1. Express Server (src/index.js)
- **Port**: 3000 (configurable)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /record` - Trigger recording
  - `GET /recordings` - List recordings
- **Middleware**:
  - JSON body parser
  - Rate limiter
  - Input validator

### 2. Recording Service (src/services/RecordingService.js)
- **Function**: Manages browser automation and recording
- **Process**:
  1. Launch Puppeteer with Chromium
  2. Set viewport to 1080x1920 (9:16)
  3. Navigate to target URL
  4. Start screen recording at 60 FPS
  5. Perform smooth scrolling during recording
  6. Stop and save as WebM file
- **Output**: WebM video files

### 3. Configuration (src/config.js)
- **Environment Variables**:
  - PORT (default: 3000)
  - VIDEO_WIDTH (default: 1080)
  - VIDEO_HEIGHT (default: 1920)
  - VIDEO_FPS (default: 60)
  - VIDEO_DURATION (default: 30)
  - OUTPUT_DIR (default: ./recordings)

### 4. Docker Container
- **Base Image**: node:18-slim
- **Installed**:
  - Node.js 18+
  - Chromium browser
  - Required system libraries
- **Volumes**:
  - ./recordings:/app/recordings (persistent storage)
- **Exposed Port**: 3000

## Data Flow

```
External Request ──▶ Docker Container ──▶ Express Server
                                              │
                                              ▼
                                        Rate Limiter
                                              │
                                              ▼
                                        Validator
                                              │
                                              ▼
                                    Recording Service
                                              │
                                              ▼
                                        Puppeteer
                                              │
                                              ▼
                                        Chromium
                                              │
                                              ▼
                                    Screen Recorder
                                              │
                                              ▼
                                    WebM Video File
                                              │
                                              ▼
                                    /recordings/ volume
```

## Security Layers

```
Request
   │
   ▼
┌─────────────────────┐
│   Rate Limiting     │ ◀── Prevents abuse
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Input Validation   │ ◀── Validates format
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Protocol Whitelist  │ ◀── Only http/https
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Filename Sanitize   │ ◀── Remove dangerous chars
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Duration Limits    │ ◀── 1-300 seconds max
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Sandboxed Browser  │ ◀── Isolated environment
└──────┬──────────────┘
       │
       ▼
   Recording
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Web Framework**: Express.js 4.18
- **Browser Automation**: Puppeteer 24.30
- **Screen Recording**: puppeteer-screen-recorder 2.1
- **Rate Limiting**: express-rate-limit 7.1
- **Containerization**: Docker & Docker Compose
- **Browser**: Chromium (bundled)
- **Output Format**: WebM (VP8/VP9)

## Deployment Options

### 1. Docker Compose (Recommended)
```bash
docker-compose up -d
```

### 2. Docker
```bash
docker build -t webrec .
docker run -p 3000:3000 -v $(pwd)/recordings:/app/recordings webrec
```

### 3. Node.js (Development)
```bash
npm install
npm start
```

## Performance Characteristics

- **Recording Start Time**: ~2-5 seconds
- **Browser Launch Time**: ~1-3 seconds
- **Page Load Time**: Varies by website
- **Recording FPS**: 60 (configurable)
- **Output File Size**: ~2-5 MB per 30 seconds (varies)
- **Concurrent Recordings**: Limited by system resources
- **Memory Usage**: ~200-500 MB per recording

## Scalability Considerations

For high-volume deployments:
1. Use a queue system (Bull, Redis)
2. Deploy multiple containers
3. Use load balancer
4. Implement distributed storage
5. Add monitoring and alerting
