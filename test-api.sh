#!/bin/bash

echo "Testing Webrec Webhook API"
echo "==========================="

# Wait for server to start
sleep 2

# Test 1: Health check
echo -e "\n1. Testing health check endpoint..."
curl -s http://localhost:3000/health | jq .

# Test 2: Invalid request (no URL)
echo -e "\n2. Testing invalid request (no URL)..."
curl -s -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Test 3: Invalid URL format
echo -e "\n3. Testing invalid URL format..."
curl -s -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-valid-url"}' | jq .

# Test 4: Valid recording request
echo -e "\n4. Testing valid recording request..."
curl -s -X POST http://localhost:3000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "duration": 10, "filename": "test-recording"}' | jq .

# Test 5: List recordings
echo -e "\n5. Waiting for recording to complete (10 seconds)..."
sleep 15

echo -e "\n6. Listing recordings..."
curl -s http://localhost:3000/recordings | jq .

echo -e "\n\nTests completed!"
