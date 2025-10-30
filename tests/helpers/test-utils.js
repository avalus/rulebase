/**
 * Test Utilities - Shared testing framework and helpers
 */

class TestFramework {
  constructor() {
    this.tests = [];
    this.currentSuite = null;
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  describe(suiteName, callback) {
    const previousSuite = this.currentSuite;
    this.currentSuite = suiteName;
    console.log(`\n📋 ${suiteName}`);
    console.log('='.repeat(50));
    
    try {
      callback();
    } finally {
      this.currentSuite = previousSuite;
    }
  }

  it(testName, callback) {
    this.stats.total++;
    const fullTestName = this.currentSuite ? `${this.currentSuite} - ${testName}` : testName;
    
    try {
      console.log(`\n🧪 ${testName}`);
      callback();
      console.log(`✅ PASSED: ${testName}`);
      this.stats.passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
      }
      this.stats.failed++;
    }
  }

  skip(testName, callback) {
    this.stats.total++;
    this.stats.skipped++;
    console.log(`⏭️  SKIPPED: ${testName}`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️  Skipped: ${this.stats.skipped}`);
    
    const successRate = this.stats.total > 0 ? 
      Math.round((this.stats.passed / this.stats.total) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.stats.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${this.stats.failed} test(s) failed`);
    }
    
    return this.stats.failed === 0;
  }

  async run() {
    const success = this.printSummary();
    process.exit(success ? 0 : 1);
  }
}

// Assertion helpers
class Assertions {
  static assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  }

  static assertNotEqual(actual, expected, message = '') {
    if (actual === expected) {
      throw new Error(`${message}\nExpected values to be different, but both were: ${actual}`);
    }
  }

  static assertTrue(value, message = '') {
    if (!value) {
      throw new Error(`${message}\nExpected truthy value, got: ${value}`);
    }
  }

  static assertFalse(value, message = '') {
    if (value) {
      throw new Error(`${message}\nExpected falsy value, got: ${value}`);
    }
  }

  static assertGreaterThan(actual, expected, message = '') {
    if (actual <= expected) {
      throw new Error(`${message}\nExpected ${actual} to be greater than ${expected}`);
    }
  }

  static assertLessThan(actual, expected, message = '') {
    if (actual >= expected) {
      throw new Error(`${message}\nExpected ${actual} to be less than ${expected}`);
    }
  }

  static assertContains(container, item, message = '') {
    if (Array.isArray(container)) {
      if (!container.includes(item)) {
        throw new Error(`${message}\nExpected array to contain: ${item}`);
      }
    } else if (typeof container === 'string') {
      if (!container.includes(item)) {
        throw new Error(`${message}\nExpected string to contain: ${item}`);
      }
    } else {
      throw new Error(`${message}\nContainer must be array or string`);
    }
  }

  static assertMatches(actual, pattern, message = '') {
    if (!pattern.test(actual)) {
      throw new Error(`${message}\nExpected "${actual}" to match pattern: ${pattern}`);
    }
  }

  static assertThrows(callback, expectedError = null, message = '') {
    try {
      callback();
      throw new Error(`${message}\nExpected function to throw an error`);
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(`${message}\nExpected error containing "${expectedError}", got: ${error.message}`);
      }
    }
  }

  static async assertThrowsAsync(callback, expectedError = null, message = '') {
    try {
      await callback();
      throw new Error(`${message}\nExpected async function to throw an error`);
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(`${message}\nExpected error containing "${expectedError}", got: ${error.message}`);
      }
    }
  }
}

// Test data helpers
class TestHelpers {
  static createMockReactions(overrides = {}) {
    return {
      thumbsUp: 0,
      heart: 0,
      rocket: 0,
      eyes: 0,
      confused: 0,
      total: 0,
      positivePercentage: 0,
      ...overrides
    };
  }

  static generateRandomReactions(maxReactions = 100) {
    const thumbsUp = Math.floor(Math.random() * maxReactions);
    const heart = Math.floor(Math.random() * (maxReactions / 2));
    const rocket = Math.floor(Math.random() * (maxReactions / 3));
    const eyes = Math.floor(Math.random() * (maxReactions / 4));
    const confused = Math.floor(Math.random() * (maxReactions / 10));
    
    const total = thumbsUp + heart + rocket + eyes + confused;
    const positivePercentage = total > 0 ? 
      Math.round(((thumbsUp + heart + rocket + eyes) / total) * 100) : 0;
    
    return {
      thumbsUp,
      heart,
      rocket,
      eyes,
      confused,
      total,
      positivePercentage
    };
  }

  static async withTimeout(callback, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Test timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      Promise.resolve(callback())
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static captureConsoleOutput(callback) {
    const originalLog = console.log;
    const originalError = console.error;
    const logs = [];
    const errors = [];

    console.log = (...args) => logs.push(args.join(' '));
    console.error = (...args) => errors.push(args.join(' '));

    try {
      callback();
      return { logs, errors };
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  }

  static createTempFile(content, filename = null) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const tempDir = os.tmpdir();
    const tempFile = filename || `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`;
    const fullPath = path.join(tempDir, tempFile);
    
    fs.writeFileSync(fullPath, content);
    
    return {
      path: fullPath,
      cleanup: () => {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    };
  }

  static cleanupFiles(filePaths) {
    const fs = require('fs');
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

// Export everything
module.exports = {
  TestFramework,
  Assertions,
  TestHelpers
};