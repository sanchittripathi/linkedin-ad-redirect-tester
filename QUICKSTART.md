# Quick Start Guide

Get up and running in 2 minutes.

## Prerequisites

- Node.js 18+ installed
- Terminal/Command Line access

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browser (one-time setup)
npx playwright install chromium
```

## First Test

### Option 1: Interactive Mode (Easiest)

```bash
npm test
```

Then paste your LinkedIn ad URL when prompted.

### Option 2: Direct Command

```bash
node src/cli.js https://your-linkedin-ad-url.com
```

## What to Expect

The tool will:
1. Test your URL on 15 different devices (8 iOS + 7 Android)
2. Show progress as it tests each device
3. Display a detailed report showing pass/fail for each device
4. Give you a recommendation

**Testing takes about 30-45 seconds total.**

## Reading Results

### ✓ PASS = Good
Your redirect is working correctly for this device.

### ✗ FAIL = Fix Required
Users on this device are not getting to the right app store.

### ⚠ WARNING = Check Manually
Redirect detected but destination unclear.

### ✕ ERROR = Technical Issue
Network or timeout error during testing.

## Example Success Report

```
═══════════════════════════════════════════════════════════════════════
                         TEST SUMMARY
═══════════════════════════════════════════════════════════════════════
  Total Devices Tested: 15  │  Success Rate: 100%
  ✓ Passed: 15  │  ✗ Failed: 0
───────────────────────────────────────────────────────────────────────
  iOS Devices: 8/8 (100%)  │  Android Devices: 7/7 (100%)
═══════════════════════════════════════════════════════════════════════

✓ RECOMMENDATION: Your ad redirects are working perfectly across all devices!
```

## Common First-Time Issues

### "Cannot find module"
Run: `npm install`

### "chromium not found"
Run: `npx playwright install chromium`

### "Invalid URL"
Make sure your URL includes `https://` at the beginning

### "All tests failing"
- Check if the URL is accessible from your browser
- Make sure you're testing a public URL (not localhost)
- Verify your redirect logic is live

## Testing Tips

1. **Test before launching ads**: Run this tool before spending ad budget
2. **Test after changes**: Re-run after any updates to your redirect logic
3. **Export results**: Use `--output results.json` to keep records
4. **Focus on failures**: Pay close attention to failed devices

## What's a Good Success Rate?

- **100%**: Perfect! Launch your ads with confidence
- **80-99%**: Good, but investigate failures
- **Below 80%**: Fix issues before launching ads

## Next Steps

- Read the full [README.md](README.md) for advanced usage
- Set up automated testing in your CI/CD pipeline
- Check out [example.js](example.js) for programmatic usage

## Support

Stuck? Check:
1. This guide
2. [README.md](README.md) troubleshooting section
3. Run `node src/cli.js examples` for usage examples

---

**Time to test your first ad!** Run `npm test` now.
