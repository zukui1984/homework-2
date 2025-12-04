# PyShare Backend Testing Guide

This document explains how to run the integration tests for the PyShare backend server.

## Overview

The integration tests verify that the Socket.io server correctly:
- Accepts client connections
- Sends initial code to newly connected clients
- Broadcasts code updates to all connected clients
- Handles multiple sequential updates
- Persists code across client reconnections
- Handles edge cases (empty code, large payloads, disconnections)

## Prerequisites

Before running tests, ensure you have:
- Node.js (v14 or higher)
- npm installed

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies (including test dependencies):
```bash
npm install
```

## Running Tests

### Run All Tests (Once)
```bash
npm test
```

This will:
- Run all test suites
- Force exit after completion (recommended for CI/CD)
- Show a detailed report of all test results
- Collect code coverage information

### Run Tests in Watch Mode
```bash
npm run test:watch
```

This will:
- Run tests automatically whenever files change
- Stay active until you manually stop it (Ctrl+C)
- Show updated results after each file modification
- Useful for development and debugging

### Run Specific Test File
```bash
npm test -- index.test.js
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

## Test Suite Details

### Test 1: Client Connection
**What it tests**: Verifies a client can successfully connect to the server

**Expected result**: ✅ Client should connect without errors

### Test 2: Initial Code on Connection
**What it tests**: Verifies that newly connected clients receive the current code

**Expected result**: ✅ Client receives the initial code stored on the server

### Test 3: Broadcasting Code Changes (Multi-client)
**What it tests**: Verifies that when one client sends a code update, all clients receive it

**Expected result**: ✅ All 3 connected clients receive the broadcast

**This is the main integration test** - it demonstrates the core functionality of PyShare:
1. Three clients connect
2. Client 1 sends a code update
3. All clients (including Client 1) receive the update
4. Broadcast is verified on all clients

### Test 4: Multiple Sequential Updates
**What it tests**: Verifies the server can handle rapid, consecutive code updates

**Expected result**: ✅ All sequential updates are processed and broadcast correctly

### Test 5: Graceful Disconnection
**What it tests**: Verifies that disconnecting a client is handled properly

**Expected result**: ✅ Client disconnects without errors, connection status is updated

### Test 6: Code Persistence Across Connections
**What it tests**: Verifies that code persists in server memory when clients disconnect and reconnect

**Expected result**: ✅ New client receives the code from the first client

**This is important** - demonstrates that code is stored server-side and available to new clients

### Test 7: Empty Code Updates
**What it tests**: Verifies the server can handle clearing code (empty string updates)

**Expected result**: ✅ Empty code is properly broadcast and persisted

### Test 8: Large Code Payloads
**What it tests**: Verifies the server can handle large code updates without corruption or loss

**Expected result**: ✅ Large code payload is correctly broadcast to all clients

## Understanding Test Output

When you run `npm test`, you'll see output similar to this:

```
PASS  index.test.js
  PyShare Socket.io Server Integration Tests
    ✓ should connect a client to the server (45ms)
    ✓ should receive initial code on connection (32ms)
    ✓ should broadcast code changes to all connected clients (156ms)
    ✓ should handle multiple sequential code updates (412ms)
    ✓ should handle disconnection gracefully (56ms)
    ✓ should persist code across client connections (234ms)
    ✓ should handle empty code updates (89ms)
    ✓ should handle large code payloads (178ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        2.456 s
```

## Troubleshooting

### "EADDRINUSE: address already in use"
**Cause**: Another process is using port 3001

**Solution**:
- Close any other running servers
- Or wait a few seconds and try again
- Or modify the port in `index.test.js`

### "Test timeout"
**Cause**: Clients couldn't connect or communication was too slow

**Solution**:
- Ensure your network connection is stable
- Try running tests again
- Increase timeout values in `jest.config.js` if needed

### "Cannot find module 'socket.io-client'"
**Cause**: Dependencies not installed

**Solution**:
```bash
npm install
```

### Tests Pass but Seem Slow
**Cause**: Test environment or network latency

**Solution**:
- This is normal for Socket.io tests with multiple connections
- Each test intentionally uses delays to ensure proper message delivery
- This is more realistic than instant tests

## CI/CD Integration

To integrate these tests into your CI/CD pipeline:

```bash
npm test -- --coverage
```

This will:
- Run all tests
- Generate a coverage report
- Exit with status 0 if all tests pass
- Exit with status 1 if any tests fail

## Architecture of Tests

The test file creates its own Express + Socket.io server for testing:

```
┌─────────────────────────────────────────┐
│    Test File (index.test.js)            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Test Server                    │   │
│  │  - Express App                  │   │
│  │  - Socket.io Server             │   │
│  │  - In-memory code storage       │   │
│  │  - Port 3001                    │   │
│  └─────────────────────────────────┘   │
│           ↑                             │
│  ┌────────┴────────────────────────┐   │
│  │                                 │   │
│  │  Test Clients                   │   │
│  │  - Socket.io Clients            │   │
│  │  - Connected via localhost      │   │
│  │  - Simulate real users          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Key Concepts

### beforeAll Hook
- Runs once before all tests
- Creates the Express + Socket.io server
- Server listens on port 3001

### afterAll Hook
- Runs once after all tests complete
- Closes the Socket.io server
- Closes the HTTP server
- Cleans up resources

### beforeEach Hook
- Runs before each individual test
- Resets `sharedCode` to empty string
- Ensures test isolation

### Async Testing with done()
- Jest calls `done()` when async work is complete
- Tests using Socket.io callbacks use this pattern
- Timeout after 10 seconds if `done()` isn't called

## Next Steps

1. **Run tests**: `npm test`
2. **Watch tests**: `npm run test:watch` (for development)
3. **Review results**: Check which tests pass/fail
4. **Debug issues**: Use the troubleshooting section if needed
5. **Deploy with confidence**: Tests verify server works correctly

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Socket.io Testing Guide](https://socket.io/docs/v4/testing/)

---

**Happy Testing! 🚀**
