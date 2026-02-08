/**
 * Test the specific lnkd.in link with the fix
 */

import { RedirectTester } from './src/redirect-tester.js';
import { getAllDevices } from './src/device-profiles.js';

const tester = new RedirectTester();
await tester.initialize();

const testUrl = 'https://lnkd.in/g6gTZavw';

console.log('Testing LinkedIn short link:', testUrl);
console.log('\nTesting 3 devices with interstitial bypass:\n');

const devices = getAllDevices().slice(0, 3); // iPhone 15 Pro Max, iPhone 15, iPhone 14 Pro

for (const device of devices) {
  console.log(`Testing ${device.name}...`);
  const result = await tester.testRedirect(testUrl, device);

  console.log(`  Status: ${result.status}`);
  console.log(`  Expected: ${result.expectedStore}`);
  console.log(`  Actual: ${result.actualStore}`);
  console.log(`  Final URL: ${result.finalUrl}`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Redirect chain (${result.redirectChain.length} steps):`);
  result.redirectChain.forEach((url, i) => {
    console.log(`    ${i + 1}. ${url}`);
  });
  console.log('');
}

await tester.close();
