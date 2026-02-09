#!/usr/bin/env node

import { RealDeviceTester, generateSetupGuide } from './real-device-tester.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const command = process.argv[2];

async function main() {
  console.log(chalk.bold.blue('\n📱 AWS Device Farm - Real Device Testing\n'));

  if (command === 'setup' || !command) {
    showSetupGuide();
    return;
  }

  if (command === 'list') {
    await listDevices();
    return;
  }

  if (command === 'test') {
    await runTest();
    return;
  }

  console.log(chalk.red('Unknown command:', command));
  console.log('\nAvailable commands:');
  console.log('  npm run setup-aws          - Show setup guide');
  console.log('  npm run list-real-devices  - List available devices');
  console.log('  npm run test:real-devices  - Run tests on real devices');
}

function showSetupGuide() {
  console.log(generateSetupGuide());

  // Check if .env exists
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log(chalk.yellow('\n⚠️  No .env file found!'));
    console.log(chalk.white('\nCreate a .env file with your AWS credentials:'));
    console.log(chalk.gray(`
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEVICE_FARM_PROJECT_ARN=your_project_arn
LINKEDIN_AD_URL=https://lnkd.in/your-ad
    `));
  } else {
    console.log(chalk.green('\n✅ .env file found!'));
    console.log(chalk.white('\nNext step: Run '), chalk.cyan('npm run list-real-devices'));
  }
}

async function listDevices() {
  try {
    console.log(chalk.white('Connecting to AWS Device Farm...\n'));

    const tester = new RealDeviceTester();
    const devices = await tester.listAvailableDevices();

    console.log(chalk.bold.green(`\n✅ Found ${devices.iOS.length + devices.Android.length} available devices\n`));

    if (devices.iOS.length > 0) {
      console.log(chalk.bold.cyan('📱 iOS Devices:'));
      devices.iOS.forEach((device, i) => {
        console.log(chalk.white(`  ${i + 1}. ${device.name} (${device.os})`));
        console.log(chalk.gray(`     Model: ${device.model} | Form: ${device.formFactor}`));
      });
      console.log('');
    }

    if (devices.Android.length > 0) {
      console.log(chalk.bold.green('🤖 Android Devices:'));
      devices.Android.forEach((device, i) => {
        console.log(chalk.white(`  ${i + 1}. ${device.name} (${device.os})`));
        console.log(chalk.gray(`     Model: ${device.model} | Form: ${device.formFactor}`));
      });
      console.log('');
    }

    console.log(chalk.white('\nTo test on these devices, run:'));
    console.log(chalk.cyan('npm run test:real-devices'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error listing devices:'), error.message);
    console.log(chalk.yellow('\n💡 Make sure you have:'));
    console.log('  1. Created AWS account');
    console.log('  2. Set up AWS Device Farm project');
    console.log('  3. Added credentials to .env file');
    console.log('\nRun', chalk.cyan('npm run setup-aws'), 'for detailed setup instructions.');
  }
}

async function runTest() {
  try {
    const adUrl = process.env.LINKEDIN_AD_URL || 'https://lnkd.in/g6gTZavw';

    console.log(chalk.white('Testing LinkedIn ad:'), chalk.cyan(adUrl));
    console.log(chalk.gray('This will run on REAL iOS and Android devices in AWS cloud\n'));

    const tester = new RealDeviceTester();

    console.log(chalk.yellow('⚠️  Note: AWS Device Farm requires additional setup:'));
    console.log(chalk.white(`
1. Upload test package to Device Farm
2. Configure test suite
3. Schedule test run

This automated testing is coming in the next version.

For now, you can:
- Use the web interface at https://console.aws.amazon.com/devicefarm
- Or continue using Playwright simulation with: ${chalk.cyan('npm test')}
    `));

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
  }
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
