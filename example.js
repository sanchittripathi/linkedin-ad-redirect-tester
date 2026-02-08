/**
 * Example: How to use the LinkedIn Ad Redirect Tester programmatically
 *
 * Run this file with: node example.js
 */

import { RedirectTester } from './src/redirect-tester.js';
import { Reporter } from './src/reporter.js';
import { getAllDevices, getDevicesByPlatform } from './src/device-profiles.js';

async function runExample() {
  // Example 1: Test a URL across all devices
  console.log('Example 1: Testing across all devices\n');

  const testUrl = 'https://example.com'; // Replace with your LinkedIn ad URL

  const tester = new RedirectTester();
  await tester.initialize();

  // Get all device profiles
  const allDevices = getAllDevices();

  // Run tests with progress updates
  const results = await tester.testAllDevices(testUrl, allDevices, (progress) => {
    console.log(`Testing device ${progress.current}/${progress.total}: ${progress.device}`);
  });

  // Generate and print report
  Reporter.printReport(results, testUrl);

  // Export to JSON
  const jsonReport = Reporter.exportToJSON(results, testUrl);
  console.log('\nJSON Report (first 500 chars):');
  console.log(jsonReport.substring(0, 500) + '...\n');

  await tester.close();

  // Example 2: Test only iOS devices
  console.log('\n\nExample 2: Testing only iOS devices\n');

  const tester2 = new RedirectTester();
  await tester2.initialize();

  const iosDevices = getDevicesByPlatform('iOS');
  console.log(`Testing ${iosDevices.length} iOS devices...\n`);

  const iosResults = await tester2.testAllDevices(testUrl, iosDevices);

  console.log('iOS Results Summary:');
  const summary = tester2.generateSummary(iosResults);
  console.log(`Total: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Success Rate: ${summary.successRate}%`);

  await tester2.close();

  // Example 3: Test a single device
  console.log('\n\nExample 3: Testing a single device\n');

  const tester3 = new RedirectTester();
  await tester3.initialize();

  const singleDevice = allDevices[0]; // Get first device (iPhone 15 Pro Max)
  console.log(`Testing single device: ${singleDevice.name}\n`);

  const singleResult = await tester3.testRedirect(testUrl, singleDevice);

  console.log(`Device: ${singleResult.device}`);
  console.log(`Status: ${singleResult.status}`);
  console.log(`Expected Store: ${singleResult.expectedStore}`);
  console.log(`Actual Store: ${singleResult.actualStore}`);
  console.log(`Success: ${singleResult.success}`);
  console.log(`Response Time: ${singleResult.responseTime}ms`);
  console.log(`Redirect Chain:`);
  singleResult.redirectChain.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });

  await tester3.close();
}

// Run the example
runExample().catch(console.error);
