import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Reporter for displaying test results in a user-friendly format
 */
export class Reporter {
  /**
   * Print test progress
   */
  static printProgress(progress) {
    const percent = Math.round((progress.current / progress.total) * 100);
    const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));

    process.stdout.write(
      `\r${chalk.cyan('Testing:')} [${bar}] ${percent}% - ${progress.device}`
    );

    if (progress.current === progress.total) {
      process.stdout.write('\n');
    }
  }

  /**
   * Print summary banner
   */
  static printSummary(summary) {
    console.log('\n' + chalk.bold.white('═'.repeat(80)));
    console.log(chalk.bold.cyan('                         TEST SUMMARY'));
    console.log(chalk.bold.white('═'.repeat(80)));

    const successRate = summary.successRate;
    const successColor = successRate === 100 ? chalk.green : successRate >= 80 ? chalk.yellow : chalk.red;

    console.log(
      chalk.white(`  Total Devices Tested: ${chalk.bold(summary.total)}`) +
      chalk.gray(`  │  `) +
      chalk.white(`Success Rate: ${successColor.bold(successRate + '%')}`)
    );

    console.log(
      chalk.green(`  ✓ Passed: ${summary.passed}`) +
      chalk.gray(`  │  `) +
      chalk.red(`✗ Failed: ${summary.failed}`) +
      chalk.gray(`  │  `) +
      chalk.yellow(`⚠ Warnings: ${summary.warnings}`) +
      chalk.gray(`  │  `) +
      chalk.gray(`✕ Errors: ${summary.errors}`)
    );

    console.log(chalk.white('─'.repeat(80)));

    // iOS vs Android breakdown
    const iosRate = summary.iosDevices > 0 ? Math.round((summary.iosSuccess / summary.iosDevices) * 100) : 0;
    const androidRate = summary.androidDevices > 0 ? Math.round((summary.androidSuccess / summary.androidDevices) * 100) : 0;

    const iosColor = iosRate === 100 ? chalk.green : iosRate >= 80 ? chalk.yellow : chalk.red;
    const androidColor = androidRate === 100 ? chalk.green : androidRate >= 80 ? chalk.yellow : chalk.red;

    console.log(
      chalk.white(`  iOS Devices: ${summary.iosSuccess}/${summary.iosDevices} `) +
      iosColor(`(${iosRate}%)`) +
      chalk.gray(`  │  `) +
      chalk.white(`Android Devices: ${summary.androidSuccess}/${summary.androidDevices} `) +
      androidColor(`(${androidRate}%)`)
    );

    console.log(
      chalk.white(`  Avg Response Time: ${chalk.bold(summary.averageResponseTime + 'ms')}`)
    );

    console.log(chalk.bold.white('═'.repeat(80)) + '\n');
  }

  /**
   * Print detailed results table
   */
  static printDetailedResults(results) {
    console.log(chalk.bold.cyan('DETAILED TEST RESULTS') + '\n');

    const table = new Table({
      head: [
        chalk.bold('Device'),
        chalk.bold('Platform'),
        chalk.bold('Status'),
        chalk.bold('Expected'),
        chalk.bold('Actual'),
        chalk.bold('Time')
      ],
      colWidths: [35, 10, 10, 13, 13, 10],
      wordWrap: true,
      style: {
        head: ['cyan']
      }
    });

    results.forEach(result => {
      let statusText;
      if (result.status === 'PASS') {
        statusText = chalk.green('✓ PASS');
      } else if (result.status === 'FAIL') {
        statusText = chalk.red('✗ FAIL');
      } else if (result.status === 'ERROR') {
        statusText = chalk.gray('✕ ERROR');
      } else {
        statusText = chalk.yellow('⚠ WARN');
      }

      const platformColor = result.platform === 'iOS' ? chalk.blue : chalk.green;

      table.push([
        result.device,
        platformColor(result.platform),
        statusText,
        result.expectedStore,
        result.actualStore || chalk.gray('N/A'),
        `${result.responseTime}ms`
      ]);
    });

    console.log(table.toString());
  }

  /**
   * Print failed tests with details
   */
  static printFailures(results) {
    const failures = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');

    if (failures.length === 0) {
      console.log(chalk.green('\n✓ All tests passed! Your redirects are working correctly.\n'));
      return;
    }

    console.log(chalk.bold.red('\n⚠ FAILED TESTS - ACTION REQUIRED\n'));

    failures.forEach((failure, index) => {
      console.log(chalk.red(`${index + 1}. ${failure.device} (${failure.platform})`));
      console.log(chalk.white(`   Expected: ${failure.expectedStore}`));
      console.log(chalk.white(`   Actual: ${failure.actualStore || 'No redirect detected'}`));

      if (failure.error) {
        console.log(chalk.yellow(`   Error: ${failure.error}`));
      }

      if (failure.finalUrl) {
        console.log(chalk.gray(`   Final URL: ${failure.finalUrl}`));
      }

      if (failure.redirectChain && failure.redirectChain.length > 0) {
        console.log(chalk.gray(`   Redirect chain (${failure.redirectChain.length} steps):`));
        failure.redirectChain.forEach((url, i) => {
          const prefix = i === 0 ? '   → Start' : i === failure.redirectChain.length - 1 ? '   → End' : '   →';
          const displayUrl = url.length > 70 ? url.substring(0, 70) + '...' : url;
          console.log(chalk.gray(`   ${prefix}: ${displayUrl}`));
        });
      }

      console.log(''); // Empty line between failures
    });
  }

  /**
   * Print redirect chain analysis
   */
  static printRedirectAnalysis(results) {
    console.log(chalk.bold.cyan('\nREDIRECT CHAIN ANALYSIS\n'));

    // Group results by similar redirect patterns
    const redirectPatterns = new Map();

    results.forEach(result => {
      if (!result.redirectChain || result.redirectChain.length === 0) return;

      const chainKey = result.redirectChain.length + '-' + result.actualStore;

      if (!redirectPatterns.has(chainKey)) {
        redirectPatterns.set(chainKey, {
          count: 0,
          devices: [],
          chain: result.redirectChain,
          store: result.actualStore,
          platform: []
        });
      }

      const pattern = redirectPatterns.get(chainKey);
      pattern.count++;
      pattern.devices.push(result.device);

      if (!pattern.platform.includes(result.platform)) {
        pattern.platform.push(result.platform);
      }
    });

    redirectPatterns.forEach((pattern, key) => {
      console.log(chalk.white(`Pattern ${pattern.platform.join(' & ')}: ${pattern.count} devices`));
      console.log(chalk.gray(`  Final destination: ${pattern.store || 'Unknown'}`));
      console.log(chalk.gray(`  Redirect steps: ${pattern.chain.length}`));

      // Show first few devices using this pattern
      const deviceList = pattern.devices.slice(0, 3).join(', ');
      const more = pattern.devices.length > 3 ? ` +${pattern.devices.length - 3} more` : '';
      console.log(chalk.gray(`  Devices: ${deviceList}${more}\n`));
    });
  }

  /**
   * Print complete report
   */
  static printReport(results, url) {
    console.log('\n');
    console.log(chalk.bold.white('═'.repeat(80)));
    console.log(chalk.bold.cyan('           LINKEDIN AD REDIRECT TEST REPORT'));
    console.log(chalk.bold.white('═'.repeat(80)));
    console.log(chalk.white(`Tested URL: ${chalk.underline(url)}`));
    console.log(chalk.gray(`Timestamp: ${new Date().toLocaleString()}`));
    console.log(chalk.bold.white('═'.repeat(80)));

    const summary = this.generateSummary(results);

    this.printSummary(summary);
    this.printDetailedResults(results);
    this.printFailures(results);
    this.printRedirectAnalysis(results);

    // Final recommendation
    if (summary.successRate === 100) {
      console.log(chalk.green.bold('✓ RECOMMENDATION: Your ad redirects are working perfectly across all devices!\n'));
    } else if (summary.successRate >= 80) {
      console.log(chalk.yellow.bold('⚠ RECOMMENDATION: Most redirects work, but some devices need attention.\n'));
    } else {
      console.log(chalk.red.bold('✗ RECOMMENDATION: Critical issues detected. Fix redirects before launching ads.\n'));
    }
  }

  /**
   * Generate summary from results
   */
  static generateSummary(results) {
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

  /**
   * Export results to JSON file
   */
  static exportToJSON(results, url, filename = 'test-results.json') {
    const report = {
      timestamp: new Date().toISOString(),
      testedUrl: url,
      summary: this.generateSummary(results),
      results: results
    };

    return JSON.stringify(report, null, 2);
  }
}
