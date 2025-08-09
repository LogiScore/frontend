// Build cache buster - changes on each build to force Vercel to rebuild
export const BUILD_TIMESTAMP = Date.now();
export const BUILD_ID = `build-${BUILD_TIMESTAMP}`;
export const CACHE_BUSTER_VERSION = `v${Math.floor(BUILD_TIMESTAMP / 1000)}`;

// This file changes on every build, forcing Vercel to rebuild
console.log(`Build ID: ${BUILD_ID} - Timestamp: ${BUILD_TIMESTAMP} - Version: ${CACHE_BUSTER_VERSION}`);

// Force module to be included in build
export const CACHE_BUSTER_CONFIG = {
  timestamp: BUILD_TIMESTAMP,
  id: BUILD_ID,
  version: CACHE_BUSTER_VERSION,
  forceRebuild: true
};
