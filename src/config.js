require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  videoWidth: parseInt(process.env.VIDEO_WIDTH || '1080', 10),
  videoHeight: parseInt(process.env.VIDEO_HEIGHT || '1920', 10),
  videoFps: parseInt(process.env.VIDEO_FPS || '60', 10),
  videoDuration: parseInt(process.env.VIDEO_DURATION || '30', 10),
  outputDir: process.env.OUTPUT_DIR || './recordings',
  webhookSecret: process.env.WEBHOOK_SECRET || null
};
