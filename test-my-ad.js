#!/usr/bin/env node

/**
 * SUPER SIMPLE AD TESTER
 *
 * Just run: node test-my-ad.js
 * Then paste your LinkedIn ad URL when asked.
 */

import { RedirectTester } from './src/redirect-tester.js';
import { getAllDevices } from './src/device-profiles.js';
import chalk from 'chalk';
import readline from 'readline';

console.log(chalk.cyan.bold('\n🎯 LinkedIn Ad Redirect Tester\n'));
console.log(chalk.white('This tests if your ad redirects iOS → App Store and Android → Play Store\n'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(chalk.yellow('Paste your LinkedIn ad URL here: '), async (url) => {
  rl.close();

  if (!url || !url.startsWith('http')) {
    console.log(chalk.red('\n❌ Invalid URL. Make sure it starts with https://\n'));
    process.exit(1);
  }

  console.log(chalk.cyan('\n📱 Testing across 15 devices (8 iOS + 7 Android)...\n'));

  const tester = new RedirectTester();
  await tester.initialize();

  const devices = getAllDevices();
  let completed = 0;
  const total = devices.length;

  let iosPass = 0, iosFail = 0;
  let androidPass = 0, androidFail = 0;
  const allResults = [];

  for (const device of devices) {
    completed++;
    const percent = Math.floor((completed / total) * 100);
    process.stdout.write(`\r  Progress: ${percent}% [${completed}/${total}] Testing ${device.name}...`);

    const result = await tester.testRedirect(url, device);
    allResults.push(result);

    if (device.platform === 'iOS') {
      result.success ? iosPass++ : iosFail++;
    } else {
      result.success ? androidPass++ : androidFail++;
    }
  }

  await tester.close();

  // Clear progress line
  console.log('\n');

  // Show results
  console.log(chalk.white('═'.repeat(70)));
  console.log(chalk.cyan.bold('                        RESULTS'));
  console.log(chalk.white('═'.repeat(70)));

  const iosTotal = iosPass + iosFail;
  const androidTotal = androidPass + androidFail;
  const totalPass = iosPass + androidPass;
  const totalFail = iosFail + androidFail;
  const successRate = Math.round((totalPass / total) * 100);

  console.log(chalk.white(`  iOS:     ${iosPass}/${iosTotal} `) + (iosFail === 0 ? chalk.green('✓ PASS') : chalk.red(`✗ ${iosFail} FAILED`)));
  console.log(chalk.white(`  Android: ${androidPass}/${androidTotal} `) + (androidFail === 0 ? chalk.green('✓ PASS') : chalk.red(`✗ ${androidFail} FAILED`)));

  console.log(chalk.white('─'.repeat(70)));
  console.log(chalk.white(`  Total:   ${totalPass}/${total} devices redirecting correctly (${successRate}%)`));
  console.log(chalk.white('═'.repeat(70) + '\n'));

  // Recommendation
  if (successRate === 100) {
    console.log(chalk.green.bold('✅ PERFECT! Your ad redirects are working correctly.\n'));
    console.log(chalk.white('   → iOS users go to App Store ✓'));
    console.log(chalk.white('   → Android users go to Play Store ✓\n'));
  } else if (successRate >= 50) {
    console.log(chalk.yellow.bold('⚠️  PARTIAL SUCCESS - Some devices have issues\n'));
    if (iosFail > 0) {
      console.log(chalk.red(`   → ${iosFail} iOS device(s) NOT going to App Store`));
    }
    if (androidFail > 0) {
      console.log(chalk.red(`   → ${androidFail} Android device(s) NOT going to Play Store`));
    }
    console.log(chalk.yellow('\n   Fix these issues before spending ad money!\n'));
  } else {
    console.log(chalk.red.bold('❌ FAILED - Your redirects are NOT working\n'));
    console.log(chalk.white('   Your ad clicks are NOT going to the right app stores.'));
    console.log(chalk.white('   Fix your redirect logic before launching ads!\n'));
  }

  // Show detailed failure information
  const failures = allResults.filter(r => !r.success);
  if (failures.length > 0) {
    console.log(chalk.white('═'.repeat(70)));
    console.log(chalk.cyan.bold('                   FAILURE DETAILS'));
    console.log(chalk.white('═'.repeat(70) + '\n'));

    failures.forEach((failure, index) => {
      console.log(chalk.yellow(`${index + 1}. ${failure.device}`));
      console.log(chalk.gray(`   Platform: ${failure.platform}`));
      console.log(chalk.gray(`   Expected: ${failure.expectedStore}`));
      console.log(chalk.red(`   Actual:   ${failure.actualStore || 'Unknown / No redirect'}`));

      if (failure.finalUrl) {
        const displayUrl = failure.finalUrl.length > 80
          ? failure.finalUrl.substring(0, 80) + '...'
          : failure.finalUrl;
        console.log(chalk.gray(`   Final URL: ${displayUrl}`));
      }

      if (failure.error && !failure.error.includes('ERR_ABORTED')) {
        console.log(chalk.red(`   Error: ${failure.error}`));
      }

      if (failure.redirectChain && failure.redirectChain.length > 0) {
        console.log(chalk.gray(`   Redirect chain (${failure.redirectChain.length} steps):`));
        failure.redirectChain.forEach((redirectUrl, i) => {
          const prefix = i === 0 ? '     1.' : `     ${i + 1}.`;
          const displayRedirectUrl = redirectUrl.length > 70
            ? redirectUrl.substring(0, 70) + '...'
            : redirectUrl;
          console.log(chalk.gray(`${prefix} ${displayRedirectUrl}`));
        });
      }

      console.log('');
    });
  }

  process.exit(successRate === 100 ? 0 : 1);
});
