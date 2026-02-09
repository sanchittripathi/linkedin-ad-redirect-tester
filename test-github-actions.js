/**
 * GitHub Actions Test Script
 * Runs LinkedIn ad tests on REAL iOS simulators and Android emulators
 */

import { chromium, webkit } from 'playwright';
import { deviceProfiles } from './src/device-profiles.js';
import fs from 'fs';
import path from 'path';

const platform = process.argv[2]; // 'ios' or 'android'
const deviceName = process.argv[3]; // e.g., 'iPhone 15 Pro'
const osVersion = process.argv[4]; // e.g., '17.5' or 'API 34'
const testUrl = process.env.TEST_URL || 'https://lnkd.in/g6gTZavw';

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  GitHub Actions - Real Device Testing                     ║
╚═══════════════════════════════════════════════════════════╝

Platform: ${platform}
Device: ${deviceName}
OS: ${osVersion}
Test URL: ${testUrl}
`);

// Create results directory
const resultsDir = 'test-results';
const screenshotsDir = path.join(resultsDir, 'screenshots');
fs.mkdirSync(resultsDir, { recursive: true });
fs.mkdirSync(screenshotsDir, { recursive: true });

async function testOnRealDevice() {
  // Find matching device profile
  const device = deviceProfiles.find(d =>
    d.name.includes(deviceName) ||
    (platform === 'ios' && d.platform === 'iOS') ||
    (platform === 'android' && d.platform === 'Android')
  ) || deviceProfiles[0];

  console.log(`Using device profile: ${device.name}`);

  // Launch browser (webkit for iOS, chromium for Android)
  const browserType = platform === 'ios' ? webkit : chromium;
  const browser = await browserType.launch({
    headless: false, // Show browser in simulator
  });

  const context = await browser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    locale: 'en-US'
  });

  const page = await context.newPage();

  const result = {
    device: `${deviceName} (${osVersion})`,
    platform,
    testUrl,
    startTime: new Date().toISOString(),
    screenshots: [],
    redirectChain: [],
    status: 'unknown',
    success: false
  };

  try {
    console.log('\n📱 Opening LinkedIn ad URL...');

    // Track redirects
    const redirects = [testUrl];

    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();

      if (status >= 300 && status < 400) {
        console.log(`  🔀 Redirect: ${url} (${status})`);
        if (!redirects.includes(url)) {
          redirects.push(url);
        }
      }
    });

    // Navigate to the URL
    try {
      await page.goto(testUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
    } catch (navError) {
      if (navError.message.includes('ERR_ABORTED')) {
        console.log('  ⚠️  Navigation aborted (likely App Store link)');
      } else {
        throw navError;
      }
    }

    // Wait a bit for page to load
    await page.waitForTimeout(2000);

    // Screenshot 1: Initial page
    console.log('\n📸 Capturing screenshot 1...');
    const screenshot1Path = path.join(screenshotsDir, `${platform}-${Date.now()}-1.png`);
    await page.screenshot({ path: screenshot1Path, fullPage: true });
    result.screenshots.push({
      step: 1,
      url: page.url(),
      path: screenshot1Path
    });

    // Check for LinkedIn interstitial
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    const isInterstitial = bodyText.includes('external link') ||
                           bodyText.includes('not on LinkedIn');

    if (isInterstitial) {
      console.log('  ℹ️  LinkedIn interstitial detected');
      redirects.push('LinkedIn Interstitial');

      // Extract and navigate to destination
      const destUrl = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const ext = links.find(a =>
          a.href &&
          !a.href.includes('linkedin.com') &&
          !a.href.includes('lnkd.in') &&
          a.href.startsWith('http')
        );
        return ext ? ext.href : null;
      }).catch(() => null);

      if (destUrl) {
        console.log(`  🔗 Following to: ${destUrl}`);
        redirects.push(destUrl);

        try {
          await page.goto(destUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
          });
          await page.waitForTimeout(3000);
        } catch (e) {
          console.log('  ⚠️  Navigation error:', e.message);
        }

        // Screenshot 2: After following link
        console.log('📸 Capturing screenshot 2...');
        const screenshot2Path = path.join(screenshotsDir, `${platform}-${Date.now()}-2.png`);
        await page.screenshot({ path: screenshot2Path, fullPage: true });
        result.screenshots.push({
          step: 2,
          url: page.url(),
          path: screenshot2Path
        });
      }
    }

    // Wait for any final redirects
    await page.waitForTimeout(2000);

    // Final screenshot
    console.log('📸 Capturing screenshot 3 (final)...');
    const screenshot3Path = path.join(screenshotsDir, `${platform}-${Date.now()}-3.png`);
    await page.screenshot({ path: screenshot3Path, fullPage: true });

    const finalUrl = page.url();
    if (!redirects.includes(finalUrl)) {
      redirects.push(finalUrl);
    }

    result.screenshots.push({
      step: 3,
      url: finalUrl,
      path: screenshot3Path
    });

    result.redirectChain = redirects;
    result.finalUrl = finalUrl;

    // Detect final destination
    let actualStore = null;
    for (const url of redirects) {
      if (url.includes('apps.apple.com') || url.includes('itunes.apple.com')) {
        actualStore = 'App Store';
        break;
      } else if (url.includes('play.google.com') || url.includes('market.android.com')) {
        actualStore = 'Google Play';
        break;
      }
    }

    result.actualStore = actualStore;
    result.expectedStore = platform === 'ios' ? 'App Store' : 'Google Play';

    // Determine success
    result.success = (result.actualStore === result.expectedStore);
    result.status = result.success ? 'PASS' : 'FAIL';

    console.log(`\n✅ Test Result: ${result.status}`);
    console.log(`   Expected: ${result.expectedStore}`);
    console.log(`   Actual: ${result.actualStore || 'Unknown'}`);
    console.log(`   Final URL: ${result.finalUrl}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    result.status = 'ERROR';
    result.error = error.message;
  } finally {
    await browser.close();
  }

  // Write results to JSON
  result.endTime = new Date().toISOString();
  const resultPath = path.join(resultsDir, `result-${platform}-${Date.now()}.json`);
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  console.log(`\n📄 Results saved to: ${resultPath}`);
  console.log(`📸 Screenshots saved to: ${screenshotsDir}`);

  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

testOnRealDevice().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
