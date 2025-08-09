// Build timestamp file - changes on every build to force Vercel to rebuild
const timestamp = Date.now();
const buildId = `build-${timestamp}`;
const hash = Math.random().toString(36).substring(2, 15);

console.log(`Build timestamp: ${timestamp}`);
console.log(`Build ID: ${buildId}`);
console.log(`Build hash: ${hash}`);

// Export for use in build process
module.exports = {
  timestamp,
  buildId,
  hash,
  forceRebuild: true
};
