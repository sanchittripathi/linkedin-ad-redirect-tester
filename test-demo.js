/**
 * Demo: Test the tool with direct App Store URLs
 *
 * This demonstrates testing URLs that go directly to app stores.
 * Use this to verify the tool is working correctly.
 *
 * Run with: node test-demo.js
 */

import { RedirectTester } from './src/redirect-tester.js';
import { Reporter } from './src/reporter.js';
import { getDevicesByPlatform } from './src/device-profiles.js';

async function testAppStoreUrls() {
  console.log('Testing with direct App Store URLs...\n');

  // Example app store URLs (replace with your actual app URLs)
  const testCases = [
    {
      name: 'Direct iOS App Store Link',
      url: 'https://apps.apple.com/us/app/linkedin/id288429040',
      description: 'Should PASS for iOS devices, FAIL for Android'
    },
    {
      name: 'Direct Google Play Store Link',
      url: 'https://play.google.com/store/apps/details?id=com.linkedin.android',
      description: 'Should PASS for Android devices, FAIL for iOS'
    }
  ];

  const tester = new RedirectTester();
  await tester.initialize();

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Test: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    console.log(`Expected: ${testCase.description}`);
    console.log('='.repeat(80) + '\n');

    // Test with 3 iOS devices
    const iosDevices = getDevicesByPlatform('iOS').slice(0, 3);
    console.log(`Testing with ${iosDevices.length} iOS devices...`);

    for (const device of iosDevices) {
      const result = await tester.testRedirect(testCase.url, device);
      const statusSymbol = result.success ? '✓' : '✗';
      console.log(`  ${statusSymbol} ${device.name}: ${result.status} (${result.actualStore || 'N/A'})`);
    }

    // Test with 3 Android devices
    const androidDevices = getDevicesByPlatform('Android').slice(0, 3);
    console.log(`\nTesting with ${androidDevices.length} Android devices...`);

    for (const device of androidDevices) {
      const result = await tester.testRedirect(testCase.url, device);
      const statusSymbol = result.success ? '✓' : '✗';
      console.log(`  ${statusSymbol} ${device.name}: ${result.status} (${result.actualStore || 'N/A'})`);
    }
  }

  await tester.close();

  console.log('\n' + '='.repeat(80));
  console.log('Demo completed!');
  console.log('='.repeat(80) + '\n');
  console.log('Now test with your actual LinkedIn ad URL:');
  console.log('  npm test');
  console.log('or');
  console.log('  node src/cli.js https://your-linkedin-ad-url.com\n');
}

testAppStoreUrls().catch(console.error);
