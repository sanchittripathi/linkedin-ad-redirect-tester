/**
 * Debug test to see actual errors
 */

import { chromium } from 'playwright';

const device = {
  name: 'iPhone 15 Pro',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.34.2089',
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
};

const testUrl = 'https://apps.apple.com/us/app/linkedin/id288429040';

console.log('Testing:', testUrl);
console.log('Device:', device.name);
console.log('\n');

const browser = await chromium.launch({ headless: true });

const context = await browser.newContext({
  userAgent: device.userAgent,
  viewport: device.viewport,
  deviceScaleFactor: device.deviceScaleFactor,
  isMobile: device.isMobile,
  hasTouch: device.hasTouch
});

const page = await context.newPage();

try {
  console.log('Navigating to URL...');
  const response = await page.goto(testUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  const finalUrl = page.url();
  const status = response.status();

  console.log('\nSuccess!');
  console.log('HTTP Status:', status);
  console.log('Final URL:', finalUrl);

  // Check if it's an app store
  if (finalUrl.includes('apps.apple.com') || finalUrl.includes('itunes.apple.com')) {
    console.log('✓ Detected: Apple App Store');
  } else if (finalUrl.includes('play.google.com')) {
    console.log('✓ Detected: Google Play Store');
  } else {
    console.log('? Unknown destination');
  }

} catch (error) {
  console.error('\n❌ Error occurred:');
  console.error('Message:', error.message);
  console.error('Name:', error.name);
}

await browser.close();
