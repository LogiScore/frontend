// Build cache buster - changes on each build to force Vercel to rebuild
export const BUILD_TIMESTAMP = Date.now();
export const BUILD_ID = `build-${BUILD_TIMESTAMP}`;

// This file changes on every build, forcing Vercel to rebuild
console.log(`Build ID: ${BUILD_ID} - Timestamp: ${BUILD_TIMESTAMP}`);
