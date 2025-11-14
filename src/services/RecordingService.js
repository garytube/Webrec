const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs').promises;

class RecordingService {
  constructor(config) {
    this.config = config;
  }

  async recordWebsite(url, duration, filename) {
    let browser = null;
    let page = null;
    let recorder = null;

    try {
      console.log(`Starting recording for: ${url}`);
      console.log(`Duration: ${duration}s, Resolution: ${this.config.videoWidth}x${this.config.videoHeight}`);

      // Launch browser with optimized settings for smooth recording
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      page = await browser.newPage();

      // Set viewport to 1080x1920 (9:16 portrait)
      await page.setViewport({
        width: this.config.videoWidth,
        height: this.config.videoHeight,
        deviceScaleFactor: 1
      });

      // Configure recorder
      recorder = new PuppeteerScreenRecorder(page, {
        followNewTab: false,
        fps: this.config.videoFps,
        videoFrame: {
          width: this.config.videoWidth,
          height: this.config.videoHeight,
        },
        aspectRatio: '9:16',
      });

      // Navigate to the URL
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      console.log('Page loaded, starting screen recording...');

      // Start screen recording
      const outputPath = path.join(this.config.outputDir, `${filename}.webm`);
      await recorder.start(outputPath);

      // Record for the specified duration with smooth scrolling
      await this.scrollAndInteract(page, duration);

      // Stop recording
      await recorder.stop();

      console.log(`Recording saved to: ${outputPath}`);
      
      return outputPath;

    } catch (error) {
      console.error('Recording error:', error);
      throw error;
    } finally {
      if (recorder) {
        try {
          await recorder.stop();
        } catch (e) {
          // Already stopped
        }
      }
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.error('Error closing page:', e.message);
        }
      }
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.error('Error closing browser:', e.message);
        }
      }
    }
  }

  async scrollAndInteract(page, duration) {
    const scrollDuration = duration * 1000; // Convert to milliseconds
    const startTime = Date.now();
    
    // Get page height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = this.config.videoHeight;
    
    console.log(`Page height: ${pageHeight}px, Viewport: ${viewportHeight}px`);

    // Smooth scrolling during recording
    while (Date.now() - startTime < scrollDuration) {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / scrollDuration;

      // Smooth scroll down
      if (pageHeight > viewportHeight) {
        const scrollTo = Math.min(
          (pageHeight - viewportHeight) * progress,
          pageHeight - viewportHeight
        );
        
        await page.evaluate((y) => {
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, scrollTo);
      }

      // Wait a bit before next scroll
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Recording duration completed');
  }
}

module.exports = RecordingService;
