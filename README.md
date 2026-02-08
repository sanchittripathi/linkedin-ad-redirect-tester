# LinkedIn Ad Redirect Tester

> Automated testing tool to verify mobile app store redirections from LinkedIn ads across 15 different devices

## What This Tool Does

This tool simulates what you would do manually with 15 different phones:
1. Opens your LinkedIn ad URL in LinkedIn's in-app browser
2. Follows all redirects
3. Verifies users land on the correct app store (App Store for iOS, Play Store for Android)
4. Provides detailed reports on what worked and what failed

## Why You Need This

LinkedIn ads are expensive. If your redirects aren't working correctly, you're:
- ❌ Losing potential customers
- ❌ Wasting ad spend
- ❌ Missing conversions

This tool ensures **100% correct redirection** across all devices **before** you launch your ads.

## Device Coverage

### iOS Devices (8 devices)
- iPhone 15 Pro Max (iOS 18.2)
- iPhone 15 (iOS 18.1)
- iPhone 14 Pro (iOS 17.5)
- iPhone 13 (iOS 17.0)
- iPhone 12 (iOS 16.7)
- iPhone SE (iOS 16.5)
- iPad Pro 12.9" (iPadOS 18.1)
- iPad Air (iPadOS 17.5)

### Android Devices (7 devices)
- Samsung Galaxy S24 Ultra (Android 14)
- Samsung Galaxy S23 (Android 14)
- Google Pixel 8 Pro (Android 15)
- Google Pixel 7 (Android 14)
- OnePlus 12 (Android 14)
- Xiaomi 13 Pro (Android 13)
- Samsung Galaxy Tab S9 (Android 14)

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Quick Start (Interactive Mode)

```bash
npm test
```

You'll be prompted to enter your LinkedIn ad URL, and the tool will test it across all 15 devices.

### Test a Specific URL

```bash
node src/cli.js https://your-linkedin-ad-url.com
```

### Test Only iOS Devices

```bash
node src/cli.js https://your-ad-url.com --platform ios
```

### Test Only Android Devices

```bash
node src/cli.js https://your-ad-url.com --platform android
```

### Export Results to JSON

```bash
node src/cli.js https://your-ad-url.com --output results.json
```

### List All Available Devices

```bash
node src/cli.js list-devices
```

### Show Example Commands

```bash
node src/cli.js examples
```

## Understanding the Results

### Test Report Sections

1. **Summary Banner**: Shows overall pass/fail rate
2. **Detailed Results Table**: Device-by-device breakdown
3. **Failed Tests**: Detailed information about what went wrong
4. **Redirect Chain Analysis**: Shows the path users take
5. **Recommendation**: Action items based on results

### Status Indicators

- ✓ **PASS**: Redirect worked correctly
- ✗ **FAIL**: Wrong app store or no redirect
- ⚠ **WARNING**: Redirect detected but unclear destination
- ✕ **ERROR**: Technical error during testing

### Example Output

```
═══════════════════════════════════════════════════════════════════════════════
                         TEST SUMMARY
═══════════════════════════════════════════════════════════════════════════════
  Total Devices Tested: 15  │  Success Rate: 100%
  ✓ Passed: 15  │  ✗ Failed: 0  │  ⚠ Warnings: 0  │  ✕ Errors: 0
───────────────────────────────────────────────────────────────────────────────
  iOS Devices: 8/8 (100%)  │  Android Devices: 7/7 (100%)
  Avg Response Time: 1234ms
═══════════════════════════════════════════════════════════════════════════════
```

## How It Works

1. **Device Simulation**: Uses Playwright to simulate LinkedIn's in-app browser with accurate user agents
2. **Redirect Tracking**: Follows all HTTP redirects and captures the full chain
3. **Validation**: Checks if final destination matches expected app store
4. **Reporting**: Generates comprehensive reports with actionable insights

## What Makes This Tool Accurate

- ✅ Uses **real LinkedIn in-app browser user agents** (not generic mobile user agents)
- ✅ Tests both **iOS and Android** across multiple OS versions
- ✅ Includes **tablets** (iPad and Android tablets)
- ✅ Follows **complete redirect chains** (some ads use multiple redirects)
- ✅ Validates **final destination** (not just the first redirect)
- ✅ Measures **response times** to catch slow redirects

## Common Issues Detected

### Issue 1: No Mobile Detection
**Symptom**: All devices get redirected to the same URL
**Solution**: Add user-agent detection to your redirect logic

### Issue 2: Wrong Store for Platform
**Symptom**: iOS users see Play Store link (or vice versa)
**Solution**: Fix your platform detection logic

### Issue 3: iPad Misidentification
**Symptom**: iPads treated as desktop instead of iOS
**Solution**: iPadOS 13+ reports as "Mac" - add specific iPad detection

### Issue 4: No Redirect
**Symptom**: Users stay on landing page
**Solution**: Add app store redirect logic

## Best Practices for LinkedIn Ad Redirects

### 1. Use Smart Links
Consider using services like:
- Branch.io
- AppsFlyer
- Adjust
- Firebase Dynamic Links

### 2. Server-Side Detection
Detect platform server-side (not JavaScript) for faster redirects:

```javascript
// Example: Node.js/Express
app.get('/ad-landing', (req, res) => {
  const userAgent = req.headers['user-agent'].toLowerCase();

  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    res.redirect('https://apps.apple.com/app/your-app-id');
  } else if (userAgent.includes('android')) {
    res.redirect('https://play.google.com/store/apps/details?id=your.package.name');
  } else {
    res.redirect('https://your-website.com');
  }
});
```

### 3. Fallback URLs
Always have a fallback for edge cases:
- Unknown devices → Website
- Old browsers → Website
- Desktop users → Website with QR code

### 4. Track Redirects
Add analytics to track:
- Which devices are clicking
- Conversion rates by platform
- Failed redirects

## Troubleshooting

### "No redirect detected"
- Your URL might not have mobile redirect logic
- Check if the URL works manually on a mobile device

### "Wrong app store"
- Your platform detection logic needs fixing
- Test with both iOS and Android user agents

### "Timeout errors"
- Your redirect chain is too slow (>30s)
- Simplify the redirect chain
- Check your server response times

### "All tests failing"
- Check if the URL is accessible
- Verify your redirect logic is working
- Test manually with a mobile device

## Advanced Usage

### Run Tests in CI/CD

Add to your GitHub Actions workflow:

```yaml
name: Test LinkedIn Ad Redirects

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-redirects:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install chromium
      - run: node src/cli.js https://your-ad-url.com --output results.json
```

### Integration with Monitoring

Set up alerts when redirects fail:

```bash
# Run tests and get exit code
node src/cli.js https://your-url.com
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  # Send alert (Slack, email, etc.)
  echo "LinkedIn ad redirects failing!"
fi
```

## Technical Details

- **Engine**: Playwright (Chromium)
- **Node Version**: 18+ required
- **Headless**: Runs without opening browser windows
- **Speed**: ~2-3 seconds per device (30-45 seconds total)

## Limitations

- Does not test actual app installation
- Cannot test deep linking into already-installed apps
- Simulates but doesn't replace real device testing for 100% accuracy
- Cannot test private/authenticated LinkedIn ad campaigns

## Roadmap

Planned features:
- [ ] Real device testing via BrowserStack integration
- [ ] Webhook notifications for failed tests
- [ ] Historical tracking of redirect success rates
- [ ] Screenshot capture of redirect pages
- [ ] Testing of deep link functionality

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run with `--verbose` flag for detailed logs
3. Export results to JSON for analysis
4. Test manually with a real device to confirm

## License

MIT

---

**Made with ❤️ to save your ad budget**
