#!/usr/bin/env node

/**
 * Test runner for OpenClaw Email Channel Plugin
 * 
 * This script runs all tests and provides a summary report.
 */

const { run } = require('node:test');
const { spec } = require('node:test/reporters');
const { stdout } = require('node:process');

async function runTests() {
  console.log('🧪 Running OpenClaw Email Channel Plugin Tests...');
  console.log('===============================================\n');
  
  const startTime = Date.now();
  
  try {
    // Run tests using Node.js test runner
    await run({
      files: ['test/unit.test.js', 'test/integration.test.js'],
      concurrency: true,
      timeout: 30000
    }).compose(spec).pipe(stdout);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n✅ Tests completed in ${duration.toFixed(2)} seconds`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Test runner error: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`\n⚠️  Uncaught exception: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`\n⚠️  Unhandled rejection at:`, promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error(`\n❌ Failed to run tests: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };