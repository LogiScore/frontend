// Test file to verify UUID generation for locations
function generateLocationUUID(locationId) {
  // Create a deterministic UUID based on the location ID
  // This ensures the same location always generates the same UUID
  const hash = locationId.split('').reduce((a, b) => {
    a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
    return a;
  }, 0);
  
  // Convert to a valid UUID format with proper padding
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Ensure we have enough characters for a valid UUID
  // UUID format: 8-4-4-4-12 characters
  const paddedHex = hex.padEnd(32, '0');
  
  return `${paddedHex.slice(0, 8)}-${paddedHex.slice(8, 12)}-${paddedHex.slice(12, 16)}-${paddedHex.slice(16, 20)}-${paddedHex.slice(20, 32)}`;
}

// Test the function with sample location IDs
const testLocations = ['us-east', 'uk-london', 'de-hamburg', 'cn-shanghai'];

console.log('Testing UUID generation for locations:');
testLocations.forEach(location => {
  const uuid = generateLocationUUID(location);
  console.log(`${location} -> ${uuid}`);
  
  // Verify UUID format
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  console.log(`  Valid UUID format: ${isValidUUID}`);
  
  // Verify consistency (same input should always produce same output)
  const uuid2 = generateLocationUUID(location);
  const isConsistent = uuid === uuid2;
  console.log(`  Consistent output: ${isConsistent}`);
  console.log('');
});
