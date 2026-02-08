import { chromium } from 'playwright';

/**
 * Tests a URL with a specific device profile to verify correct app store redirection
 */
export class RedirectTester {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Test a URL with a specific device profile
   * @param {string} url - The LinkedIn ad URL to test
   * @param {object} deviceProfile - Device profile from device-profiles.js
   * @param {boolean} captureScreenshots - Whether to capture screenshots during redirect
   * @returns {Promise<object>} Test result with status, final URL, and redirect chain
   */
  async testRedirect(url, deviceProfile, captureScreenshots = false) {
    const startTime = Date.now();
    let result = {
      device: deviceProfile.name,
      platform: deviceProfile.platform,
      expectedStore: deviceProfile.expectedStore,
      status: 'unknown',
      finalUrl: null,
      redirectChain: [],
      actualStore: null,
      success: false,
      error: null,
      responseTime: 0,
      httpStatus: null,
      screenshots: []
    };

    const context = await this.browser.newContext({
      userAgent: deviceProfile.userAgent,
      viewport: deviceProfile.viewport,
      deviceScaleFactor: deviceProfile.deviceScaleFactor,
      isMobile: deviceProfile.isMobile,
      hasTouch: deviceProfile.hasTouch,
      locale: 'en-US'
    });

    const page = await context.newPage();

    try {
      // Track all redirects
      const redirects = [url];

      page.on('response', (response) => {
        const status = response.status();
        const url = response.url();

        // Track redirects (3xx status codes)
        if (status >= 300 && status < 400 && !redirects.includes(url)) {
          redirects.push(url);
        }
      });

      // Navigate to the URL and follow redirects
      let response;
      try {
        response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        result.httpStatus = response ? response.status() : null;
      } catch (navError) {
        // ERR_ABORTED might happen with LinkedIn links - continue anyway
        if (navError.message && navError.message.includes('ERR_ABORTED')) {
          // Wait a bit for page to settle
          await page.waitForTimeout(2000);
        } else {
          throw navError;
        }
      }

      // Capture screenshot of first page
      if (captureScreenshots) {
        try {
          const screenshot = await page.screenshot({ type: 'png', fullPage: false });
          result.screenshots.push({
            step: 1,
            url: page.url(),
            image: screenshot.toString('base64'),
            timestamp: Date.now() - startTime
          });
        } catch (screenshotError) {
          // Ignore screenshot errors
        }
      }

      // Handle LinkedIn interstitial page (lnkd.in links)
      if (url.includes('lnkd.in') || url.includes('linkedin.com')) {
        try {
          // Check if we're on LinkedIn's external link warning page
          const isInterstitial = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            return bodyText.includes('external link') ||
                   bodyText.includes('not on LinkedIn') ||
                   bodyText.includes('verify it for safety');
          });

          if (isInterstitial) {
            // Extract the actual destination URL from the page
            const destinationUrl = await page.evaluate(() => {
              // Try to find the destination URL in various places
              const links = Array.from(document.querySelectorAll('a'));

              // First, look for a link that's NOT a LinkedIn URL (the external destination)
              const externalLink = links.find(a =>
                a.href &&
                !a.href.includes('linkedin.com') &&
                !a.href.includes('lnkd.in') &&
                a.href.startsWith('http')
              );

              if (externalLink) {
                return externalLink.href;
              }

              // Fallback: extract URL from body text
              const urlInText = document.body.innerText.match(/https?:\/\/(?!.*linkedin\.com|.*lnkd\.in)[^\s]+/);
              if (urlInText && urlInText[0]) {
                return urlInText[0];
              }

              return null;
            });

            if (destinationUrl && !destinationUrl.includes('linkedin.com')) {
              redirects.push('LinkedIn Interstitial (bypassed)');

              // Navigate to the actual destination
              const destResponse = await page.goto(destinationUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
              });

              redirects.push(destinationUrl);
              result.httpStatus = destResponse.status();

              // Capture screenshot after following destination
              if (captureScreenshots) {
                try {
                  await page.waitForTimeout(1000);
                  const screenshot = await page.screenshot({ type: 'png', fullPage: false });
                  result.screenshots.push({
                    step: result.screenshots.length + 1,
                    url: page.url(),
                    image: screenshot.toString('base64'),
                    timestamp: Date.now() - startTime
                  });
                } catch (screenshotError) {
                  // Ignore screenshot errors
                }
              }
            }
          }
        } catch (interstitialError) {
          // If interstitial handling fails, continue with original flow
          // Silent - we already have the redirect chain data
        }
      }

      // Capture final screenshot
      if (captureScreenshots && result.screenshots.length < 3) {
        try {
          await page.waitForTimeout(500);
          const screenshot = await page.screenshot({ type: 'png', fullPage: false });
          result.screenshots.push({
            step: result.screenshots.length + 1,
            url: page.url(),
            image: screenshot.toString('base64'),
            timestamp: Date.now() - startTime
          });
        } catch (screenshotError) {
          // Ignore screenshot errors
        }
      }

      // Get the final URL after all redirects
      const finalUrl = page.url();
      if (!redirects.includes(finalUrl)) {
        redirects.push(finalUrl);
      }

      result.finalUrl = finalUrl;
      result.redirectChain = redirects;
      result.responseTime = Date.now() - startTime;

      // Determine which store the user was redirected to
      // Check all URLs in the redirect chain, not just the final one
      // (sometimes final URL is about:blank after trying to open native app)
      result.actualStore = null;
      for (const redirectUrl of redirects) {
        const store = this.detectAppStore(redirectUrl);
        if (store) {
          result.actualStore = store;
          result.finalUrl = redirectUrl; // Use the app store URL as final URL
          break;
        }
      }

      // Check if redirection was correct based on detected app store
      if (deviceProfile.platform === 'iOS') {
        result.success = result.actualStore === 'App Store';
        result.status = result.success ? 'PASS' : 'FAIL';

        if (!result.success) {
          result.error = `Expected App Store redirect for iOS device, got: ${result.actualStore || 'unknown destination'}`;
        }
      } else if (deviceProfile.platform === 'Android') {
        result.success = result.actualStore === 'Google Play';
        result.status = result.success ? 'PASS' : 'FAIL';

        if (!result.success) {
          result.error = `Expected Play Store redirect for Android device, got: ${result.actualStore || 'unknown destination'}`;
        }
      }

      // Additional validation: Check if redirect happened at all
      if (redirects.length <= 1) {
        result.status = 'WARNING';
        result.error = 'No redirect detected - URL may not be configured for mobile redirects';
      }

    } catch (error) {
      result.responseTime = Date.now() - startTime;
      result.error = error.message;

      // Handle ERR_ABORTED - this happens when the browser tries to open native app
      // This is actually SUCCESS for app store links!
      if (error.message && error.message.includes('ERR_ABORTED')) {
        const attemptedUrl = error.message.match(/https?:\/\/[^\s]+/)?.[0] || url;
        result.finalUrl = attemptedUrl;
        result.actualStore = this.detectAppStore(attemptedUrl);
        result.redirectChain = [url, attemptedUrl];

        // Check if it tried to open the correct app store
        if (deviceProfile.platform === 'iOS' && this.isAppleAppStore(attemptedUrl)) {
          result.status = 'PASS';
          result.success = true;
        } else if (deviceProfile.platform === 'Android' && this.isGooglePlayStore(attemptedUrl)) {
          result.status = 'PASS';
          result.success = true;
        } else {
          result.status = 'FAIL';
          result.success = false;
          result.error = `Navigation aborted at wrong store: ${result.actualStore || 'unknown'}`;
        }
      } else {
        // Other errors are real failures
        result.status = 'ERROR';
        result.success = false;
      }
    } finally {
      await page.close();
      await context.close();
    }

    return result;
  }

  /**
   * Detect which app store a URL points to
   */
  detectAppStore(url) {
    const urlLower = url.toLowerCase();

    if (this.isAppleAppStore(url)) {
      return 'App Store';
    } else if (this.isGooglePlayStore(url)) {
      return 'Google Play';
    } else if (urlLower.includes('amazon.com') && urlLower.includes('app')) {
      return 'Amazon Appstore';
    } else if (urlLower.includes('apk')) {
      return 'Direct APK';
    }

    return null;
  }

  /**
   * Check if URL is Apple App Store
   */
  isAppleAppStore(url) {
    const urlLower = url.toLowerCase();
    return urlLower.includes('apps.apple.com') ||
           urlLower.includes('itunes.apple.com') ||
           urlLower.includes('appstore.com');
  }

  /**
   * Check if URL is Google Play Store
   */
  isGooglePlayStore(url) {
    const urlLower = url.toLowerCase();
    return urlLower.includes('play.google.com') ||
           urlLower.includes('play.app.goo.gl') ||
           urlLower.includes('market.android.com');
  }

  /**
   * Test a URL across all device profiles
   * @param {string} url - The LinkedIn ad URL to test
   * @param {Array} deviceProfiles - Array of device profiles to test
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Promise<Array>} Array of test results
   */
  async testAllDevices(url, deviceProfiles, progressCallback = null) {
    const results = [];

    for (let i = 0; i < deviceProfiles.length; i++) {
      const device = deviceProfiles[i];

      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: deviceProfiles.length,
          device: device.name
        });
      }

      const result = await this.testRedirect(url, device);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate summary statistics from test results
   */
  generateSummary(results) {
    const summary = {
      total: results.length,
      passed: 0,
      failed: 0,
      errors: 0,
      warnings: 0,
      iosDevices: 0,
      iosSuccess: 0,
      androidDevices: 0,
      androidSuccess: 0,
      averageResponseTime: 0
    };

    let totalResponseTime = 0;

    results.forEach(result => {
      if (result.status === 'PASS') {
        summary.passed++;
      } else if (result.status === 'FAIL') {
        summary.failed++;
      } else if (result.status === 'ERROR') {
        summary.errors++;
      } else if (result.status === 'WARNING') {
        summary.warnings++;
      }

      if (result.platform === 'iOS') {
        summary.iosDevices++;
        if (result.success) summary.iosSuccess++;
      } else if (result.platform === 'Android') {
        summary.androidDevices++;
        if (result.success) summary.androidSuccess++;
      }

      totalResponseTime += result.responseTime;
    });

    summary.averageResponseTime = Math.round(totalResponseTime / results.length);
    summary.successRate = Math.round((summary.passed / summary.total) * 100);

    return summary;
  }
}
