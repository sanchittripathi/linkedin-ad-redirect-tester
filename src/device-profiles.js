/**
 * Device profiles simulating LinkedIn's in-app browser across different devices
 * These profiles mimic real user agents from LinkedIn's mobile app on various devices
 */

export const deviceProfiles = [
  // iOS Devices with LinkedIn App
  {
    name: 'iPhone 15 Pro Max (iOS 18.2)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.35.2145',
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },
  {
    name: 'iPhone 15 (iOS 18.1)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.34.2089',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },
  {
    name: 'iPhone 14 Pro (iOS 17.5)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.32.1876',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },
  {
    name: 'iPhone 13 (iOS 17.0)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.30.1654',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },
  {
    name: 'iPhone 12 (iOS 16.7)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.28.1432',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },
  {
    name: 'iPhone SE (iOS 16.5)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.27.1298',
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },
  {
    name: 'iPad Pro 12.9" (iPadOS 18.1)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.34.2089',
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },
  {
    name: 'iPad Air (iPadOS 17.5)',
    platform: 'iOS',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.32.1876',
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'App Store'
  },

  // Android Devices with LinkedIn App
  {
    name: 'Samsung Galaxy S24 Ultra (Android 14)',
    platform: 'Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 LinkedInApp',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 3.5,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'Google Play'
  },
  {
    name: 'Samsung Galaxy S23 (Android 14)',
    platform: 'Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 LinkedInApp',
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'Google Play'
  },
  {
    name: 'Google Pixel 8 Pro (Android 15)',
    platform: 'Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 LinkedInApp',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'Google Play'
  },
  {
    name: 'Google Pixel 7 (Android 14)',
    platform: 'Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 LinkedInApp',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'Google Play'
  },
  {
    name: 'OnePlus 12 (Android 14)',
    platform: 'Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; CPH2583) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 LinkedInApp',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'Google Play'
  },
  {
    name: 'Xiaomi 13 Pro (Android 13)',
    platform: 'Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; 2210132C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36 LinkedInApp',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'Google Play'
  },
  {
    name: 'Samsung Galaxy Tab S9 (Android 14)',
    platform: 'Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 LinkedInApp',
    viewport: { width: 712, height: 1138 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    expectedStore: 'Google Play'
  }
];

export function getDevicesByPlatform(platform) {
  return deviceProfiles.filter(device => device.platform === platform);
}

export function getAllDevices() {
  return deviceProfiles;
}
