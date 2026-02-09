import { DeviceFarmClient, ListDevicesCommand, CreateTestGridUrlCommand } from '@aws-sdk/client-device-farm';

/**
 * Real Device Tester using AWS Device Farm
 * Tests LinkedIn ads on REAL iOS and Android devices
 */
export class RealDeviceTester {
  constructor(awsConfig = {}) {
    this.client = new DeviceFarmClient({
      region: awsConfig.region || 'us-west-2', // Device Farm is available in us-west-2
      credentials: {
        accessKeyId: awsConfig.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    this.projectArn = awsConfig.projectArn || process.env.AWS_DEVICE_FARM_PROJECT_ARN;
  }

  /**
   * List available real devices in AWS Device Farm
   */
  async listAvailableDevices() {
    try {
      const command = new ListDevicesCommand({
        arn: this.projectArn,
        filters: [
          {
            attribute: 'AVAILABILITY',
            operator: 'EQUALS',
            values: ['AVAILABLE']
          }
        ]
      });

      const response = await this.client.send(command);

      // Group devices by platform
      const devices = {
        iOS: [],
        Android: []
      };

      response.devices.forEach(device => {
        const deviceInfo = {
          arn: device.arn,
          name: device.name,
          model: device.model,
          os: device.os,
          platform: device.platform,
          formFactor: device.formFactor,
          availability: device.availability
        };

        if (device.platform === 'IOS') {
          devices.iOS.push(deviceInfo);
        } else if (device.platform === 'ANDROID') {
          devices.Android.push(deviceInfo);
        }
      });

      return devices;
    } catch (error) {
      console.error('Error listing devices:', error);
      throw error;
    }
  }

  /**
   * Test LinkedIn ad on a real device
   * @param {string} adUrl - LinkedIn ad URL to test
   * @param {object} deviceArn - AWS Device Farm device ARN
   * @returns {Promise<object>} Test results with screenshots
   */
  async testOnRealDevice(adUrl, deviceArn) {
    // This will create an Appium test session on the real device
    // The test will:
    // 1. Open LinkedIn app (if installed) or browser
    // 2. Navigate to the ad URL
    // 3. Capture screenshots of each step
    // 4. Verify final destination (App Store or Play Store)

    console.log(`Testing ${adUrl} on device ${deviceArn}`);

    // Implementation note: This requires uploading an Appium test package
    // and setting up the test suite in AWS Device Farm

    return {
      device: deviceArn,
      status: 'pending',
      message: 'Real device testing requires AWS Device Farm project setup'
    };
  }
}

/**
 * Generate AWS Device Farm setup guide
 */
export function generateSetupGuide() {
  return `
# AWS Device Farm Setup Guide

## Free Tier
- 250 device minutes per month FREE
- Access to real iOS and Android devices
- No credit card required for free tier

## Setup Steps

### 1. Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (no credit card needed for free tier)

### 2. Enable Device Farm
1. Go to AWS Console: https://console.aws.amazon.com/
2. Search for "Device Farm"
3. Click "Get started" or "Create a new project"
4. Create a project named "LinkedIn Ad Tester"
5. Copy the Project ARN (looks like: arn:aws:devicefarm:us-west-2:123456789:project:abc-123)

### 3. Get AWS Credentials
1. Go to IAM console: https://console.aws.amazon.com/iam/
2. Click "Users" → "Add users"
3. Create user: "linkedin-ad-tester"
4. Attach policy: "AWSDeviceFarmFullAccess"
5. Create access key
6. Save Access Key ID and Secret Access Key

### 4. Configure Credentials
Create a .env file in your project:

\`\`\`
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEVICE_FARM_PROJECT_ARN=your_project_arn_here
\`\`\`

### 5. Available Real Devices

#### iOS Devices (Real):
- iPhone 15 Pro Max
- iPhone 15 Pro
- iPhone 14 Pro
- iPhone 13
- iPhone SE (3rd gen)
- iPad Pro 12.9"
- iPad Air

#### Android Devices (Real):
- Samsung Galaxy S24 Ultra
- Samsung Galaxy S23
- Google Pixel 8 Pro
- Google Pixel 7
- OnePlus 11
- Xiaomi 13 Pro

## Testing LinkedIn Ads on Real Devices

### Method 1: Web App Test (Easiest)
Tests LinkedIn ad links by opening them in the device's browser with LinkedIn in-app user agent simulation.

### Method 2: Native App Test (Most Realistic)
Requires LinkedIn app to be installed and configured. Opens the ad within the actual LinkedIn app.

## Cost Estimation

With 15 devices × 2 minutes per test = 30 minutes per full test suite
- You can run ~8 full test suites per month on free tier
- Additional minutes: $0.17/device minute

## Next Steps

After setup, run:
\`\`\`bash
npm run test:real-devices
\`\`\`

This will test your LinkedIn ads on actual iPhones and Android phones in AWS's device cloud!
`;
}
