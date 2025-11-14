const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const RecordingService = require('./services/RecordingService');
const config = require('./config');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Rate limiting for recording endpoint (more strict)
const recordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 recording requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many recording requests, please try again later.' }
});

// Apply rate limiting
app.use(limiter);

// Initialize recording service
const recordingService = new RecordingService(config);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'webrec',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint for recording requests
app.post('/record', recordLimiter, async (req, res) => {
  try {
    const { url, duration, filename } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        example: { url: 'https://example.com', duration: 30, filename: 'my-recording' }
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        provided: url
      });
    }

    // Start recording asynchronously
    const recordingId = Date.now().toString();
    const customDuration = duration || config.videoDuration;
    const customFilename = filename || `recording-${recordingId}`;

    // Respond immediately
    res.json({ 
      status: 'accepted',
      message: 'Recording request accepted',
      recordingId,
      url,
      duration: customDuration,
      filename: `${customFilename}.webm`
    });

    // Start recording in background
    recordingService.recordWebsite(url, customDuration, customFilename)
      .then((outputPath) => {
        console.log(`Recording completed: ${outputPath}`);
      })
      .catch((error) => {
        console.error(`Recording failed for ${url}:`, error.message);
      });

  } catch (error) {
    console.error('Error processing recording request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// List recordings endpoint
app.get('/recordings', async (req, res) => {
  try {
    const files = await fs.readdir(config.outputDir);
    const recordings = files
      .filter(file => file.endsWith('.webm') || file.endsWith('.mp4'))
      .map(file => ({
        filename: file,
        path: path.join(config.outputDir, file)
      }));

    res.json({ 
      count: recordings.length,
      recordings 
    });
  } catch (error) {
    console.error('Error listing recordings:', error);
    res.status(500).json({ 
      error: 'Failed to list recordings',
      message: error.message
    });
  }
});

// Start server
const PORT = config.port;

async function startServer() {
  try {
    // Ensure output directory exists
    await fs.mkdir(config.outputDir, { recursive: true });
    
    app.listen(PORT, () => {
      console.log(`Webrec server listening on port ${PORT}`);
      console.log(`Webhook endpoint: http://localhost:${PORT}/record`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Video resolution: ${config.videoWidth}x${config.videoHeight}`);
      console.log(`Video FPS: ${config.videoFps}`);
      console.log(`Default duration: ${config.videoDuration}s`);
      console.log(`Output directory: ${config.outputDir}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
