/**
 * Extract the destination URL from LinkedIn interstitial
 */

import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.32.1876',
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
});

const page = await context.newPage();

try {
  await page.goto('https://lnkd.in/g6gTZavw', {
    waitUntil: 'domcontentloaded',
    timeout: 10000
  });
} catch (error) {
  console.log('Navigation error (might be OK):', error.message);
  // Continue anyway - the page might have loaded enough
}

// Wait a bit for any JS
await page.waitForTimeout(2000);

// Get all the information we can
const info = await page.evaluate(() => {
  return {
    bodyText: document.body.innerText,
    allLinks: Array.from(document.querySelectorAll('a')).map(a => ({
      href: a.href,
      text: a.textContent.trim()
    })),
    html: document.body.innerHTML.substring(0, 1000)
  };
});

console.log('=== Page Body Text ===');
console.log(info.bodyText);

console.log('\n=== All Links ===');
info.allLinks.forEach((link, i) => {
  console.log(`${i + 1}. ${link.text} -> ${link.href}`);
});

console.log('\n=== HTML (first 1000 chars) ===');
console.log(info.html);

await browser.close();
