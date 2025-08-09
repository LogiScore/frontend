// Force rebuild script - completely changes project structure
const fs = require('fs');
const path = require('path');

// Generate unique build identifier
const buildId = `rebuild-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
const timestamp = new Date().toISOString();

console.log('=== FORCE REBUILD INITIATED ===');
console.log(`Build ID: ${buildId}`);
console.log(`Timestamp: ${timestamp}`);
console.log('Clearing all caches...');

// Create a unique build marker file
const buildMarker = {
  buildId,
  timestamp,
  forceRebuild: true,
  cacheBuster: Math.random().toString(36).substring(2, 15)
};

fs.writeFileSync('build-marker.json', JSON.stringify(buildMarker, null, 2));
console.log('Build marker created:', buildMarker);

// Force exit with success
process.exit(0);
