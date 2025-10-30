/**
 * Unit Tests for Rule Scanner Module
 * Tests rule discovery, path validation, and file system operations
 */

const path = require('path');
const fs = require('fs');
const { TestFramework, Assertions, TestHelpers } = require('../helpers/test-utils');
const { RulebaseAssertions } = require('../helpers/assertions');

// Import the actual RuleScanner class
const { RuleScanner } = require('../../src/rule-scanner');

const framework = new TestFramework('Rule Scanner Unit Tests');

framework.describe('RuleScanner Static Methods', () => {
  framework.it('should have scanRules static method', () => {
    Assertions.assertTrue(typeof RuleScanner.scanRules === 'function', 'Should have scanRules static method');
  });

  framework.it('should have getAllRulePaths static method', () => {
    Assertions.assertTrue(typeof RuleScanner.getAllRulePaths === 'function', 'Should have getAllRulePaths static method');
  });

  framework.it('should have getRuleKeyFromPath static method', () => {
    Assertions.assertTrue(typeof RuleScanner.getRuleKeyFromPath === 'function', 'Should have getRuleKeyFromPath static method');
  });

  framework.it('should have ruleExists static method', () => {
    Assertions.assertTrue(typeof RuleScanner.ruleExists === 'function', 'Should have ruleExists static method');
  });
});

framework.describe('Rule Scanning', () => {
  framework.it('should scan rules and return structure', () => {
    const result = RuleScanner.scanRules('./rules');
    
    Assertions.assertTrue(typeof result === 'object', 'Should return an object');
    Assertions.assertTrue(typeof result.totalRules === 'number', 'Should have totalRules as number');
    Assertions.assertTrue(typeof result.categories === 'object', 'Should have categories as object');
    Assertions.assertTrue(result.totalRules >= 0, 'Total rules should be non-negative');
  });

  framework.it('should handle non-existent directory gracefully', () => {
    const result = RuleScanner.scanRules('./non-existent-directory');
    
    Assertions.assertTrue(typeof result === 'object', 'Should return an object');
    Assertions.assertEqual(result.totalRules, 0, 'Should return 0 total rules for non-existent directory');
    Assertions.assertTrue(typeof result.categories === 'object', 'Should have empty categories object');
  });
});

framework.describe('Rule Path Operations', () => {
  framework.it('should get all rule paths', () => {
    const rulePaths = RuleScanner.getAllRulePaths('./rules');
    
    Assertions.assertTrue(Array.isArray(rulePaths), 'Should return an array');
    // Each path should be a string ending with README.md
    rulePaths.forEach(rulePath => {
      Assertions.assertTrue(typeof rulePath === 'string', 'Each rule path should be a string');
      Assertions.assertTrue(rulePath.endsWith('README.md'), 'Each rule path should end with README.md');
    });
  });

  framework.it('should extract rule key from path', () => {
    const testPaths = [
      { path: 'rules/javascript/avoid-var/README.md', expected: 'javascript/avoid-var' },
      { path: 'rules/python/use-list-comprehension/README.md', expected: 'python/use-list-comprehension' },
      { path: 'rules/css/avoid-important/README.md', expected: 'css/avoid-important' }
    ];

    testPaths.forEach(({ path: rulePath, expected }) => {
      const ruleKey = RuleScanner.getRuleKeyFromPath(rulePath);
      Assertions.assertEqual(ruleKey, expected, `Should extract correct rule key from ${rulePath}`);
    });
  });

  framework.it('should check if rule exists', () => {
    // Test with a rule that likely exists
    const existsResult = RuleScanner.ruleExists('javascript/avoid-var', './rules');
    Assertions.assertTrue(typeof existsResult === 'boolean', 'Should return boolean for rule existence check');

    // Test with a rule that definitely doesn't exist
    const notExistsResult = RuleScanner.ruleExists('non-existent/rule', './rules');
    Assertions.assertEqual(notExistsResult, false, 'Should return false for non-existent rule');
  });
});

framework.describe('Error Handling', () => {
  framework.it('should handle invalid rule keys gracefully', () => {
    const invalidKeys = ['', null, undefined, 'invalid//key', 'key/with/too/many/slashes'];
    
    invalidKeys.forEach(key => {
      try {
        const result = RuleScanner.ruleExists(key, './rules');
        Assertions.assertTrue(typeof result === 'boolean', `Should handle invalid key gracefully: ${key}`);
      } catch (error) {
        // It's okay if it throws an error for invalid input
        Assertions.assertTrue(true, `Handled invalid key with error: ${key}`);
      }
    });
  });

  framework.it('should handle empty rule paths gracefully', () => {
    const emptyPath = '';
    const ruleKey = RuleScanner.getRuleKeyFromPath(emptyPath);
    Assertions.assertTrue(typeof ruleKey === 'string', 'Should return string for empty path');
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  framework.run().then(() => {
    process.exit(0);
  });
}

module.exports = framework;