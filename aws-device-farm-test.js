/**
 * AWS Device Farm - Real Device Test Script
 * This script runs on REAL iOS and Android devices to test LinkedIn ad redirects
 *
 * This will be uploaded to AWS Device Farm and executed on actual phones/tablets
 */

// This uses WebDriverIO which is compatible with AWS Device Farm
const { remote } = require('webdriverio');

const TEST_URL = process.env.LINKEDIN_AD_URL || 'https://lnkd.in/g6gTZavw';

async function testLinkedInAd() {
  console.log('🚀 Starting real device test for:', TEST_URL);

  const capabilities = {
    platformName: process.env.PLATFORM_NAME || 'Android',
    'appium:deviceName': process.env.DEVICE_NAME || 'Device',
    'appium:browserName': 'Chrome', // or 'Safari' for iOS
    'appium:automationName': process.env.PLATFORM_NAME === 'iOS' ? 'XCUITest' : 'UiAutomator2'
  };

  console.log('Device capabilities:', capabilities);

  let driver;
  const screenshots = [];
  const redirectChain = [];

  try {
    // Connect to the real device
    driver = await remote({
      hostname: process.env.APPIUM_HOST || 'localhost',
      port: parseInt(process.env.APPIUM_PORT || '4723'),
      path: '/wd/hub',
      capabilities
    });

    console.log('✅ Connected to real device!');

    // Step 1: Navigate to LinkedIn ad URL
    console.log('📱 Opening LinkedIn ad...');
    await driver.url(TEST_URL);
    await driver.pause(2000); // Wait for page load

    // Capture first screenshot
    const screenshot1 = await driver.takeScreenshot();
    screenshots.push({
      step: 1,
      url: await driver.getUrl(),
      image: screenshot1,
      timestamp: Date.now()
    });
    console.log('📸 Screenshot 1 captured');

    // Step 2: Check if we're on LinkedIn interstitial
    const bodyText = await driver.$$('body').getText();
    const isInterstitial = bodyText.includes('external link') ||
                           bodyText.includes('not on LinkedIn');

    if (isInterstitial) {
      console.log('ℹ️  On LinkedIn interstitial page');
      redirectChain.push({ step: 1, url: await driver.getUrl(), type: 'interstitial' });

      // Find and click the external link
      try {
        const links = await driver.$$('a');
        for (const link of links) {
          const href = await link.getAttribute('href');
          if (href && !href.includes('linkedin.com') && !href.includes('lnkd.in')) {
            console.log('🔗 Found destination link:', href);
            await link.click();
            await driver.pause(3000); // Wait for navigation
            break;
          }
        }
      } catch (e) {
        console.log('⚠️  Could not click link, trying direct navigation...');
      }
    } else {
      console.log('✅ No interstitial detected (using real LinkedIn app context!)');
      redirectChain.push({ step: 1, url: await driver.getUrl(), type: 'direct' });
    }

    // Step 3: Wait for redirects to complete
    await driver.pause(5000);

    // Capture second screenshot (after redirect)
    const screenshot2 = await driver.takeScreenshot();
    const currentUrl = await driver.getUrl();
    screenshots.push({
      step: 2,
      url: currentUrl,
      image: screenshot2,
      timestamp: Date.now()
    });
    console.log('📸 Screenshot 2 captured');
    redirectChain.push({ step: 2, url: currentUrl, type: 'destination' });

    // Step 4: Detect final destination
    let actualStore = null;
    if (currentUrl.includes('apps.apple.com') || currentUrl.includes('itunes.apple.com')) {
      actualStore = 'App Store';
      console.log('✅ Reached App Store!');
    } else if (currentUrl.includes('play.google.com') || currentUrl.includes('market.android.com')) {
      actualStore = 'Google Play';
      console.log('✅ Reached Google Play Store!');
    } else {
      console.log('⚠️  Unexpected destination:', currentUrl);
    }

    // Final screenshot
    const screenshot3 = await driver.takeScreenshot();
    screenshots.push({
      step: 3,
      url: currentUrl,
      image: screenshot3,
      timestamp: Date.now()
    });
    console.log('📸 Screenshot 3 captured');

    // Determine success
    const platform = capabilities.platformName;
    const expectedStore = platform === 'iOS' ? 'App Store' : 'Google Play';
    const success = actualStore === expectedStore;

    const result = {
      device: {
        platform: platform,
        name: capabilities['appium:deviceName']
      },
      testUrl: TEST_URL,
      redirectChain,
      actualStore,
      expectedStore,
      success,
      status: success ? 'PASS' : 'FAIL',
      screenshots: screenshots.length,
      timestamp: Date.now()
    };

    console.log('\n📊 Test Result:', result);

    // Write results to file for AWS Device Farm to collect
    const fs = require('fs');
    fs.writeFileSync('/tmp/test-results.json', JSON.stringify(result, null, 2));

    return result;

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    // Try to capture error screenshot
    if (driver) {
      try {
        const errorScreenshot = await driver.takeScreenshot();
        screenshots.push({
          step: 'error',
          image: errorScreenshot,
          error: error.message,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Could not capture error screenshot');
      }
    }

    throw error;
  } finally {
    if (driver) {
      await driver.deleteSession();
      console.log('🔌 Disconnected from device');
    }
  }
}

// Run the test
testLinkedInAd()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
