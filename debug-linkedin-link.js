/**
 * Debug LinkedIn short links to understand the behavior
 */

import { chromium } from 'playwright';

const testUrl = 'https://lnkd.in/g6gTZavw';

console.log('Testing LinkedIn short link:', testUrl);
console.log('\n=== Test 1: With LinkedIn iOS App User Agent ===\n');

const browser = await chromium.launch({ headless: true });

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.32.1876',
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  extraHTTPHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  }
});

const page = await context.newPage();

// Track all requests and redirects
const requests = [];
page.on('request', request => {
  requests.push({
    url: request.url(),
    method: request.method(),
    headers: request.headers()
  });
});

page.on('response', response => {
  console.log(`Response: ${response.status()} ${response.url()}`);
  if (response.status() >= 300 && response.status() < 400) {
    console.log(`  → Redirect to: ${response.headers()['location']}`);
  }
});

try {
  console.log('Navigating...');
  const response = await page.goto(testUrl, {
    waitUntil: 'load',
    timeout: 30000
  });

  // Wait a bit for any JS redirects
  await page.waitForTimeout(3000);

  const finalUrl = page.url();
  const title = await page.title();

  console.log('\n=== Results ===');
  console.log('Final URL:', finalUrl);
  console.log('Page Title:', title);
  console.log('HTTP Status:', response.status());

  // Check what's on the page
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log('Page content (first 200 chars):', bodyText);

} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n=== All Requests ===');
requests.forEach((req, i) => {
  console.log(`${i + 1}. ${req.method} ${req.url}`);
});

await browser.close();
