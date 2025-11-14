# Webrec Examples

This directory contains example scripts and configurations for using Webrec.

## Basic Usage Examples

### 1. Simple Recording Request

```bash
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 2. Custom Duration

```bash
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "duration": 60}'
```

### 3. Custom Filename

```bash
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "duration": 45,
    "filename": "my-custom-recording"
  }'
```

## Integration Examples

### WordPress Plugin Integration

```php
<?php
// WordPress webhook integration
function trigger_webrec_recording($url) {
    $webrec_endpoint = 'http://webrec:3000/record';
    
    $data = array(
        'url' => $url,
        'duration' => 30,
        'filename' => 'wordpress-page-' . time()
    );
    
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        )
    );
    
    $context = stream_context_create($options);
    $result = file_get_contents($webrec_endpoint, false, $context);
    
    return json_decode($result, true);
}

// Usage
$response = trigger_webrec_recording('https://mysite.com/new-page');
?>
```

### Node.js/Express Integration

```javascript
// Node.js webhook integration
const express = require('express');
const axios = require('axios');

const app = express();

app.post('/trigger-recording', async (req, res) => {
  try {
    const { pageUrl } = req.body;
    
    const response = await axios.post('http://webrec:3000/record', {
      url: pageUrl,
      duration: 30,
      filename: `recording-${Date.now()}`
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8080);
```

### Python/Django Integration

```python
# Python webhook integration
import requests
import json

def trigger_recording(url, duration=30):
    webrec_endpoint = 'http://webrec:3000/record'
    
    payload = {
        'url': url,
        'duration': duration,
        'filename': f'recording-{int(time.time())}'
    }
    
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(
        webrec_endpoint,
        data=json.dumps(payload),
        headers=headers
    )
    
    return response.json()

# Usage
result = trigger_recording('https://example.com', duration=45)
print(result)
```

### Zapier/Make Integration

1. Create a webhook trigger in your automation platform
2. Add an HTTP Request action with:
   - Method: POST
   - URL: http://your-server:3000/record
   - Headers: Content-Type: application/json
   - Body: 
   ```json
   {
     "url": "{{trigger.url}}",
     "duration": 30
   }
   ```

## Advanced Configuration

### Custom Video Settings

Create a custom `.env` file:

```bash
PORT=3000
VIDEO_WIDTH=1080
VIDEO_HEIGHT=1920
VIDEO_FPS=60
VIDEO_DURATION=30
OUTPUT_DIR=/app/recordings
```

### Docker Compose with Custom Settings

```yaml
version: '3.8'

services:
  webrec:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VIDEO_WIDTH=1920
      - VIDEO_HEIGHT=1080
      - VIDEO_FPS=30
      - VIDEO_DURATION=60
    volumes:
      - ./recordings:/app/recordings
      - ./custom-recordings:/app/custom
```

## Batch Processing

### Process Multiple URLs

```bash
#!/bin/bash

urls=(
  "https://example.com"
  "https://example.org"
  "https://example.net"
)

for url in "${urls[@]}"; do
  echo "Recording: $url"
  curl -X POST http://localhost:3000/record \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$url\", \"duration\": 30}"
  
  # Wait between recordings to avoid overload
  sleep 5
done
```

## Monitoring and Logs

### Check Server Logs

```bash
# Docker logs
docker logs webrec -f

# Docker Compose logs
docker-compose logs -f webrec
```

### List All Recordings

```bash
curl http://localhost:3000/recordings | jq .
```

## Troubleshooting

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Test with Simple URL

```bash
curl -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "duration": 10}'
```

### Check Disk Space

```bash
docker exec webrec df -h /app/recordings
```
