FROM node:18-slim

# Install dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable for Chromium executable path
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src ./src

# Create recordings directory
RUN mkdir -p /app/recordings

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV OUTPUT_DIR=/app/recordings
ENV VIDEO_WIDTH=1080
ENV VIDEO_HEIGHT=1920
ENV VIDEO_FPS=60
ENV VIDEO_DURATION=30

# Run the application
CMD ["npm", "start"]
