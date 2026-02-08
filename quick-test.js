/**
 * Quick diagnostic test to see what's being detected
 */

import { RedirectTester } from './src/redirect-tester.js';
import { getAllDevices } from './src/device-profiles.js';

const tester = new RedirectTester();
await tester.initialize();

// Test with an iOS App Store URL
const testUrl = 'https://apps.apple.com/us/app/linkedin/id288429040';

console.log('Testing URL:', testUrl);
console.log('\nTesting 3 devices to see what happens:\n');

const devices = getAllDevices().slice(0, 3); // Test first 3 devices

for (const device of devices) {
  const result = await tester.testRedirect(testUrl, device);

  console.log(`\n${device.name} (${device.platform}):`);
  console.log(`  Expected Store: ${result.expectedStore}`);
  console.log(`  Actual Store: ${result.actualStore}`);
  console.log(`  Final URL: ${result.finalUrl}`);
  console.log(`  Status: ${result.status}`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Redirects: ${result.redirectChain.length} steps`);
}

await tester.close();
