#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { RedirectTester } from './redirect-tester.js';
import { Reporter } from './reporter.js';
import { getAllDevices, getDevicesByPlatform } from './device-profiles.js';
import fs from 'fs';
import path from 'path';

// ASCII Art Banner
function printBanner() {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║     LinkedIn Ad Redirect Tester                                      ║
║     Test mobile app store redirections across 15 devices             ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
  `));
}

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Main test function
async function runTest(url, options) {
  printBanner();

  // Validate URL
  if (!isValidUrl(url)) {
    console.error(chalk.red('✗ Error: Invalid URL format'));
    console.log(chalk.yellow('Please provide a valid URL including protocol (http:// or https://)'));
    process.exit(1);
  }

  console.log(chalk.white(`Testing URL: ${chalk.underline(url)}\n`));

  // Select devices based on platform filter
  let devices = getAllDevices();

  if (options.platform) {
    const platformFilter = options.platform.toLowerCase();
    if (platformFilter !== 'ios' && platformFilter !== 'android') {
      console.error(chalk.red('✗ Error: Platform must be either "ios" or "android"'));
      process.exit(1);
    }
    devices = getDevicesByPlatform(platformFilter === 'ios' ? 'iOS' : 'Android');
    console.log(chalk.yellow(`Filtering to ${platformFilter.toUpperCase()} devices only (${devices.length} devices)\n`));
  }

  console.log(chalk.cyan(`Testing across ${devices.length} different devices...\n`));

  // Initialize tester
  const tester = new RedirectTester();

  try {
    await tester.initialize();

    // Run tests with progress indicator
    const results = await tester.testAllDevices(url, devices, (progress) => {
      Reporter.printProgress(progress);
    });

    // Print report
    Reporter.printReport(results, url);

    // Export to JSON if requested
    if (options.output) {
      const jsonOutput = Reporter.exportToJSON(results, url);
      const outputPath = path.resolve(options.output);

      fs.writeFileSync(outputPath, jsonOutput);
      console.log(chalk.green(`✓ Results exported to: ${outputPath}\n`));
    }

    // Close browser
    await tester.close();

    // Exit with appropriate code
    const summary = Reporter.generateSummary(results);
    process.exit(summary.failed > 0 || summary.errors > 0 ? 1 : 0);

  } catch (error) {
    console.error(chalk.red(`\n✗ Fatal Error: ${error.message}`));
    console.error(chalk.gray(error.stack));
    await tester.close();
    process.exit(1);
  }
}

// Interactive mode - prompt for URL
async function interactiveMode() {
  printBanner();

  console.log(chalk.white('Welcome to the LinkedIn Ad Redirect Tester!'));
  console.log(chalk.gray('This tool simulates clicking your ad link from 15 different devices.\n'));

  // Use readline for input
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(chalk.cyan('Enter the LinkedIn ad URL to test: '), (url) => {
    rl.close();

    if (!url || url.trim() === '') {
      console.log(chalk.red('\n✗ No URL provided. Exiting.'));
      process.exit(1);
    }

    runTest(url.trim(), {});
  });
}

// CLI Configuration
program
  .name('linkedin-ad-tester')
  .description('Test LinkedIn ad redirections across multiple mobile devices')
  .version('1.0.0');

program
  .argument('[url]', 'LinkedIn ad URL to test')
  .option('-p, --platform <platform>', 'Filter by platform (ios or android)')
  .option('-o, --output <file>', 'Export results to JSON file')
  .option('-v, --verbose', 'Show detailed redirect chains')
  .action(async (url, options) => {
    if (!url) {
      // No URL provided, enter interactive mode
      await interactiveMode();
    } else {
      await runTest(url, options);
    }
  });

// List devices command
program
  .command('list-devices')
  .description('List all available device profiles')
  .action(() => {
    printBanner();

    console.log(chalk.bold.cyan('AVAILABLE DEVICE PROFILES\n'));

    const iosDevices = getDevicesByPlatform('iOS');
    const androidDevices = getDevicesByPlatform('Android');

    console.log(chalk.bold.blue(`iOS Devices (${iosDevices.length}):`));
    iosDevices.forEach((device, index) => {
      console.log(chalk.white(`  ${index + 1}. ${device.name}`));
    });

    console.log(chalk.bold.green(`\nAndroid Devices (${androidDevices.length}):`));
    androidDevices.forEach((device, index) => {
      console.log(chalk.white(`  ${index + 1}. ${device.name}`));
    });

    console.log(chalk.gray(`\nTotal: ${iosDevices.length + androidDevices.length} devices\n`));
  });

// Example usage command
program
  .command('examples')
  .description('Show example usage')
  .action(() => {
    printBanner();

    console.log(chalk.bold.cyan('EXAMPLE USAGE\n'));

    console.log(chalk.white('1. Test a URL interactively:'));
    console.log(chalk.gray('   $ npm test\n'));

    console.log(chalk.white('2. Test a specific URL:'));
    console.log(chalk.gray('   $ npm test https://your-linkedin-ad-url.com\n'));

    console.log(chalk.white('3. Test only iOS devices:'));
    console.log(chalk.gray('   $ node src/cli.js https://your-url.com --platform ios\n'));

    console.log(chalk.white('4. Test only Android devices:'));
    console.log(chalk.gray('   $ node src/cli.js https://your-url.com --platform android\n'));

    console.log(chalk.white('5. Export results to JSON:'));
    console.log(chalk.gray('   $ node src/cli.js https://your-url.com --output results.json\n'));

    console.log(chalk.white('6. List all available devices:'));
    console.log(chalk.gray('   $ node src/cli.js list-devices\n'));
  });

// Parse CLI arguments
program.parse();
