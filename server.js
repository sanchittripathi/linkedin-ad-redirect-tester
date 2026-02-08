import express from 'express';
import cors from 'cors';
import { RedirectTester } from './src/redirect-tester.js';
import { getAllDevices } from './src/device-profiles.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased for screenshots
app.use(express.static('public'));

// Store active tests (in production, use Redis or similar)
const activeTests = new Map();

// Store custom devices (in production, use database)
const customDevices = new Map();

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Start a test
app.post('/api/test', async (req, res) => {
  const { url, captureScreenshots = true, deviceIds = [] } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({
      error: 'Invalid URL. Must start with http:// or https://'
    });
  }

  const testId = Date.now().toString();

  // Store test metadata
  activeTests.set(testId, {
    url,
    status: 'running',
    progress: 0,
    results: [],
    startTime: Date.now(),
    captureScreenshots,
    deviceIds
  });

  // Start test in background
  runTest(testId, url, captureScreenshots, deviceIds);

  res.json({ testId, message: 'Test started' });
});

// API: Get test status
app.get('/api/test/:testId', (req, res) => {
  const { testId } = req.params;
  const test = activeTests.get(testId);

  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }

  res.json(test);
});

// API: Get all devices
app.get('/api/devices', (req, res) => {
  const builtInDevices = getAllDevices();
  const customDevicesList = Array.from(customDevices.values());

  res.json({
    builtIn: builtInDevices.map(d => ({
      id: d.name.toLowerCase().replace(/\s+/g, '-'),
      name: d.name,
      platform: d.platform,
      expectedStore: d.expectedStore
    })),
    custom: customDevicesList,
    total: builtInDevices.length + customDevicesList.length
  });
});

// API: Add custom device
app.post('/api/devices/custom', (req, res) => {
  const { name, platform, userAgent, viewport } = req.body;

  if (!name || !platform || !userAgent) {
    return res.status(400).json({
      error: 'Missing required fields: name, platform, userAgent'
    });
  }

  const deviceId = `custom-${Date.now()}`;
  const customDevice = {
    id: deviceId,
    name,
    platform,
    userAgent,
    viewport: viewport || { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedStore: platform === 'iOS' ? 'App Store' : 'Google Play',
    isCustom: true
  };

  customDevices.set(deviceId, customDevice);

  res.json({ success: true, device: customDevice });
});

// API: Delete custom device
app.delete('/api/devices/custom/:deviceId', (req, res) => {
  const { deviceId } = req.params;

  if (customDevices.has(deviceId)) {
    customDevices.delete(deviceId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Device not found' });
  }
});

// Run test function
async function runTest(testId, url, captureScreenshots = true, deviceIds = []) {
  const testData = activeTests.get(testId);
  const tester = new RedirectTester();

  try {
    await tester.initialize();

    // Get devices to test
    let devices = [];
    if (deviceIds && deviceIds.length > 0) {
      // Test specific devices
      const allBuiltIn = getAllDevices();
      deviceIds.forEach(id => {
        const builtIn = allBuiltIn.find(d => d.name.toLowerCase().replace(/\s+/g, '-') === id);
        if (builtIn) {
          devices.push(builtIn);
        } else if (customDevices.has(id)) {
          devices.push(customDevices.get(id));
        }
      });
    } else {
      // Test all built-in devices
      devices = getAllDevices();
    }

    const total = devices.length;

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];

      // Update progress
      testData.progress = Math.floor(((i + 1) / total) * 100);
      testData.currentDevice = device.name;

      // Run test with optional screenshots
      const result = await tester.testRedirect(url, device, captureScreenshots);
      testData.results.push(result);

      // Update test data
      activeTests.set(testId, testData);
    }

    await tester.close();

    // Calculate summary
    const summary = tester.generateSummary(testData.results);

    testData.status = 'completed';
    testData.progress = 100;
    testData.summary = summary;
    testData.completedTime = Date.now();
    testData.duration = testData.completedTime - testData.startTime;

    activeTests.set(testId, testData);

  } catch (error) {
    testData.status = 'error';
    testData.error = error.message;
    activeTests.set(testId, testData);

    await tester.close();
  }
}

// Cleanup old tests every hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [testId, test] of activeTests.entries()) {
    if (test.startTime < oneHourAgo) {
      activeTests.delete(testId);
    }
  }
}, 60 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   LinkedIn Ad Redirect Tester - Web Server               ║
║                                                           ║
║   Server running on http://0.0.0.0:${PORT}              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
