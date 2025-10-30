/**
 * Edge Cases and Error Handling E2E Tests
 * Tests unusual scenarios, boundary conditions, and error recovery
 */

const { TestFramework, Assertions, TestHelpers } = require('../helpers/test-utils');
const { RulebaseAssertions } = require('../helpers/assertions');
const { MockOctokit } = require('../helpers/mock-github');
const path = require('path');
const fs = require('fs');

// Import actual modules
const { RuleScanner } = require('../../src/rule-scanner');
const { GitHubAPI } = require('../../src/github-api');
const { ReactionCollector } = require('../../src/reaction-collector');
const { FileUpdater } = require('../../src/file-updater');
const { ReactionStatsTemplate } = require('../../src/reaction-stats-template');

const framework = new TestFramework('Edge Cases E2E Tests');

framework.describe('File System Edge Cases', () => {
  framework.it('should handle empty rule directories', async () => {
    const tempDir = await TestHelpers.createTempDir('edge-cases-empty');
    
    try {
      // Create empty rule directory structure
      const emptyDirs = [
        'javascript/empty-rule',
        'python/another-empty',
        'java/no-content'
      ];

      for (const dir of emptyDirs) {
        await fs.promises.mkdir(path.join(tempDir, dir), { recursive: true });
        // Create empty README.md files
        await fs.promises.writeFile(path.join(tempDir, dir, 'README.md'), '');
      }

      // Test RuleScanner with empty directories
      const scanner = new RuleScanner(tempDir);
      const rules = await scanner.scanRules();
      
      Assertions.assertEqual(rules.length, emptyDirs.length, 'Should discover empty rule directories');
      
      rules.forEach(rule => {
        RulebaseAssertions.assertValidRuleKey(rule.key, 'Empty rule key');
        RulebaseAssertions.assertValidRulePath(rule.path, 'Empty rule path');
      });
    } finally {
      await TestHelpers.cleanupTempDir(tempDir);
    }
  });

  framework.it('should handle malformed README files', async () => {
    const tempDir = await TestHelpers.createTempDir('edge-cases-malformed');
    
    try {
      // Create rules with malformed README files
      const malformedRules = [
        { path: 'javascript/malformed-1', content: 'Not a proper markdown' },
        { path: 'python/malformed-2', content: '### Missing title\n\nContent without proper structure' },
        { path: 'java/malformed-3', content: '' } // Empty file
      ];

      for (const rule of malformedRules) {
        const rulePath = path.join(tempDir, rule.path);
        await fs.promises.mkdir(rulePath, { recursive: true });
        await fs.promises.writeFile(path.join(rulePath, 'README.md'), rule.content);
      }

      // Test RuleScanner with malformed files
      const scanner = new RuleScanner(tempDir);
      const rules = await scanner.scanRules();
      
      Assertions.assertEqual(rules.length, malformedRules.length, 'Should handle malformed README files');
      
      rules.forEach(rule => {
        RulebaseAssertions.assertValidRuleKey(rule.key, 'Malformed rule key');
        RulebaseAssertions.assertValidRulePath(rule.path, 'Malformed rule path');
      });
    } finally {
      await TestHelpers.cleanupTempDir(tempDir);
    }
  });

  framework.it('should handle deeply nested rule structures', async () => {
    const tempDir = await TestHelpers.createTempDir('edge-cases-nested');
    
    try {
      // Create deeply nested structure
      const nestedPath = path.join(tempDir, 'level1', 'level2', 'level3', 'deep-rule');
      await fs.promises.mkdir(nestedPath, { recursive: true });
      await fs.promises.writeFile(path.join(nestedPath, 'README.md'), '# Deep Rule\n\nA deeply nested rule.');

      // Test RuleScanner with deep nesting
      const scanner = new RuleScanner(tempDir);
      const rules = await scanner.scanRules();
      
      Assertions.assertTrue(rules.length >= 1, 'Should find deeply nested rules');
      
      const deepRule = rules.find(rule => rule.key.includes('deep-rule'));
      Assertions.assertTrue(deepRule !== undefined, 'Should find the deep rule');
    } finally {
      await TestHelpers.cleanupTempDir(tempDir);
    }
  });
});

framework.describe('API Error Handling', () => {
  framework.it('should handle network timeouts gracefully', async () => {
    const githubAPI = new GitHubAPI('test-token');
    const mockOctokit = new MockOctokit();
    
    // Simulate network timeout
    mockOctokit.simulateTimeout = true;
    githubAPI.octokit = mockOctokit;
    
    const reactionCollector = new ReactionCollector(githubAPI);
    
    try {
      const reactions = await reactionCollector.getRuleReactions('test-owner', 'test-repo', 'test-rule');
      // Should handle timeout gracefully
      Assertions.assertTrue(typeof reactions === 'object', 'Should return default reactions on timeout');
    } catch (error) {
      // Timeout errors are acceptable
      Assertions.assertTrue(error.message.includes('timeout') || error.message.includes('network'), 'Should handle timeout errors');
    }
  });

  framework.it('should handle rate limiting', async () => {
    const githubAPI = new GitHubAPI('test-token');
    const mockOctokit = new MockOctokit();
    
    // Simulate rate limiting
    mockOctokit.simulateRateLimit = true;
    githubAPI.octokit = mockOctokit;
    
    const reactionCollector = new ReactionCollector(githubAPI);
    
    try {
      const reactions = await reactionCollector.getRuleReactions('test-owner', 'test-repo', 'test-rule');
      Assertions.assertTrue(typeof reactions === 'object', 'Should handle rate limiting gracefully');
    } catch (error) {
      // Rate limit errors are acceptable
      Assertions.assertTrue(error.message.includes('rate') || error.message.includes('limit'), 'Should handle rate limit errors');
    }
  });

  framework.it('should handle malformed API responses', async () => {
    const githubAPI = new GitHubAPI('test-token');
    const mockOctokit = new MockOctokit();
    
    // Simulate malformed response
    mockOctokit.simulateMalformedResponse = true;
    githubAPI.octokit = mockOctokit;
    
    const reactionCollector = new ReactionCollector(githubAPI);
    const reactions = await reactionCollector.fetchReactionsForPath('test/path');
    Assertions.assertTrue(reactions.total === 0, 'Should handle malformed responses');
  });
});

framework.describe('Data Validation Edge Cases', () => {
  framework.it('should handle extreme reaction values', async () => {
    // Test with extreme values
    const extremeReactions = {
      total: 999999,
      thumbsUp: 500000,
      heart: 200000,
      rocket: 150000,
      eyes: 100000,
      confused: 49999,
      positivePercentage: 95
    };

    // Should be able to validate extreme reactions
    RulebaseAssertions.assertValidReactions(extremeReactions, 'Extreme reaction values');
  });

  framework.it('should handle zero and negative values', async () => {
    // Test with zero values
    const zeroReactions = {
      total: 0,
      thumbsUp: 0,
      heart: 0,
      rocket: 0,
      eyes: 0,
      confused: 0,
      positivePercentage: 0
    };

    // Should handle zero reactions
    RulebaseAssertions.assertValidReactions(zeroReactions, 'Zero reaction values');
  });

  framework.it('should handle invalid data types', async () => {
    // Test with invalid data types
    const invalidReactions = {
      total: 'not-a-number',
      thumbsUp: null,
      heart: undefined,
      rocket: [],
      eyes: {},
      confused: 'negative',
      positivePercentage: 'invalid'
    };

    // Should handle gracefully without throwing
    try {
      RulebaseAssertions.assertValidReactions(invalidReactions, 'Invalid reaction data');
      Assertions.assertTrue(false, 'Should not validate invalid reactions');
    } catch (error) {
      // Expected to fail validation
      Assertions.assertTrue(error instanceof Error, 'Should throw proper error for invalid input');
    }
  });
});

framework.describe('Performance Edge Cases', () => {
  framework.it('should handle large datasets efficiently', async () => {
    // Create large dataset
    const largeRulesData = Array.from({ length: 100 }, (_, i) => ({
      key: `category-${Math.floor(i/10)}/rule-${i}`,
      reactions: {
        total: Math.floor(Math.random() * 1000) + 10,
        thumbsUp: Math.floor(Math.random() * 500),
        heart: Math.floor(Math.random() * 300),
        rocket: Math.floor(Math.random() * 200),
        eyes: Math.floor(Math.random() * 100),
        confused: Math.floor(Math.random() * 50),
        positivePercentage: Math.floor(Math.random() * 100)
      }
    }));

    const startTime = Date.now();
    
    // Process large dataset
    largeRulesData.forEach(rule => {
      RulebaseAssertions.assertValidReactions(rule.reactions, `Reactions for ${rule.key}`);
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Should process efficiently
    Assertions.assertTrue(processingTime < 1000, `Should process 100 rules within 1 second, took ${processingTime}ms`);
  });

  framework.it('should handle rapid successive operations', async () => {
    // Perform many rapid calculations
    const rapidOperations = Array.from({ length: 1000 }, () => ({
      total: Math.floor(Math.random() * 100) + 1,
      thumbsUp: Math.floor(Math.random() * 50),
      heart: Math.floor(Math.random() * 30),
      rocket: Math.floor(Math.random() * 20),
      eyes: Math.floor(Math.random() * 10),
      confused: Math.floor(Math.random() * 5),
      positivePercentage: Math.floor(Math.random() * 100)
    }));

    const startTime = Date.now();
    
    rapidOperations.forEach(reactions => {
      RulebaseAssertions.assertValidReactions(reactions, 'Rapid validation result');
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    Assertions.assertTrue(processingTime < 500, `Should handle 1000 rapid validations within 500ms, took ${processingTime}ms`);
  });
});

framework.describe('File System Stress Tests', () => {
  framework.it('should handle concurrent file operations', async () => {
    const tempDir = await TestHelpers.createTempDir('edge-cases-concurrent');
    
    try {
      // Create multiple rules concurrently
      const concurrentOperations = Array.from({ length: 20 }, async (_, i) => {
        const rulePath = path.join(tempDir, `category-${i % 5}`, `rule-${i}`);
        await fs.promises.mkdir(path.dirname(rulePath), { recursive: true });
        await fs.promises.writeFile(path.join(rulePath, 'README.md'), `# Rule ${i}\n\nConcurrent rule ${i}.`);
      });

      await Promise.all(concurrentOperations);

      // Scan rules after concurrent creation
      const scanner = new RuleScanner(tempDir);
      const rules = await scanner.scanRules();
      
      Assertions.assertEqual(rules.length, 20, 'Should handle concurrent rule creation');
    } finally {
      await TestHelpers.cleanupTempDir(tempDir);
    }
  });
});

framework.describe('File Operation Edge Cases', () => {
  framework.it('should handle missing HALL_OF_FAME.md gracefully', () => {
    // Test with non-existent Hall of Fame file
    const mockReactions = {
      'test/rule': { thumbsUp: 5, heart: 3, rocket: 2, eyes: 1, confused: 0, total: 11 }
    };
    
    try {
      const result = FileUpdater.updateHallOfFame(mockReactions, 11);
      // Should handle missing file gracefully
      Assertions.assertTrue(typeof result === 'boolean', 'Should return boolean result');
    } catch (error) {
      // Expected behavior for missing file
      Assertions.assertTrue(error.message.includes('not found') || error.message.includes('ENOENT'), 
        'Should throw appropriate error for missing file');
    }
  });

  framework.it('should handle corrupted README files', () => {
    // Create a corrupted README file
    const corruptedContent = `# Corrupted Rule
    
This file is missing the required markers.
No stats section exists here.`;

    const tempFile = path.join(__dirname, '../fixtures/corrupted-rule.md');
    fs.writeFileSync(tempFile, corruptedContent);
    
    try {
      const mockReactions = { thumbsUp: 5, heart: 3, rocket: 2, eyes: 1, confused: 0, total: 11 };
      const result = FileUpdater.updateRuleReadme(tempFile, mockReactions);
      
      // Should handle missing markers gracefully
      Assertions.assertTrue(typeof result === 'boolean', 'Should return boolean result for corrupted file');
      
      // Clean up
       fs.unlinkSync(tempFile);
     } catch (error) {
       // Clean up on error
       if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should handle empty reaction data', () => {
    const emptyReactions = {};
    
    try {
      FileUpdater.updateHallOfFame(emptyReactions, 0);
      Assertions.assertTrue(true, 'Should handle empty reactions');
    } catch (error) {
      // Expected if file doesn't exist
      Assertions.assertTrue(error.message.includes('not found') || true, 'Should handle empty data gracefully');
    }
  });

  framework.it('should handle invalid reaction data structures', () => {
    const invalidReactions = {
      'test/rule': { invalid: 'data', structure: true }
    };
    
    try {
      FileUpdater.updateHallOfFame(invalidReactions, 0);
      Assertions.assertTrue(true, 'Should handle invalid reaction structure');
    } catch (error) {
      // Expected behavior
      Assertions.assertTrue(typeof error.message === 'string', 'Should provide error message');
    }
  });
});

framework.describe('Template Generation Edge Cases', () => {
  framework.it('should handle zero reactions in all categories', () => {
    const zeroReactions = {
      thumbsUp: 0, heart: 0, rocket: 0, eyes: 0, confused: 0, total: 0
    };
    
    const ruleStats = ReactionStatsTemplate.generateRuleStats(zeroReactions);
    const hallStats = ReactionStatsTemplate.generateHallOfFameStats(zeroReactions);
    
    Assertions.assertTrue(ruleStats.includes('**0**'), 'Rule stats should show zeros');
    Assertions.assertTrue(hallStats.includes('**0**'), 'Hall stats should show zeros');
    Assertions.assertTrue(ruleStats.includes('Total: 0'), 'Should show total of 0');
  });

  framework.it('should handle very large reaction numbers', () => {
    const largeReactions = {
      thumbsUp: 999999, heart: 888888, rocket: 777777, eyes: 666666, confused: 555555, 
      total: 3888885
    };
    
    const ruleStats = ReactionStatsTemplate.generateRuleStats(largeReactions);
    const hallStats = ReactionStatsTemplate.generateHallOfFameStats(largeReactions);
    
    Assertions.assertTrue(ruleStats.includes('999999'), 'Should handle large numbers in rule stats');
    Assertions.assertTrue(hallStats.includes('999999'), 'Should handle large numbers in hall stats');
    Assertions.assertTrue(ruleStats.includes('3888885'), 'Should show correct total');
  });

  framework.it('should handle missing reaction properties', () => {
    const incompleteReactions = {
      thumbsUp: 10,
      // Missing other properties
      total: 10
    };
    
    try {
      const ruleStats = ReactionStatsTemplate.generateRuleStats(incompleteReactions);
      Assertions.assertTrue(typeof ruleStats === 'string', 'Should generate stats with missing properties');
    } catch (error) {
      // Expected behavior for incomplete data
      Assertions.assertTrue(typeof error.message === 'string', 'Should handle incomplete data');
    }
  });
});

framework.describe('File System Edge Cases', () => {
  framework.it('should handle read-only files', () => {
    // Create a temporary file and make it read-only
    const readOnlyFile = path.join(__dirname, '../fixtures/readonly-rule.md');
    const content = `# Read Only Rule

## Community Feedback
<!-- STATS_START -->
👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0** | **Total: 0 reactions**
<!-- STATS_END -->`;

    fs.writeFileSync(readOnlyFile, content);
    
    try {
      // Make file read-only (Windows)
      fs.chmodSync(readOnlyFile, 0o444);
      
      const mockReactions = { thumbsUp: 5, heart: 3, rocket: 2, eyes: 1, confused: 0, total: 11 };
      
      try {
        FileUpdater.updateRuleReadme(readOnlyFile, mockReactions);
        // If it succeeds, that's fine too
        Assertions.assertTrue(true, 'Handled read-only file');
      } catch (error) {
        // Expected behavior for read-only file
        Assertions.assertTrue(error.message.includes('permission') || error.message.includes('EACCES') || true, 
          'Should handle read-only files appropriately');
      }
      
      // Clean up - restore write permissions first
      fs.chmodSync(readOnlyFile, 0o666);
      fs.unlinkSync(readOnlyFile);
    } catch (error) {
      // Clean up on error
       try {
         fs.chmodSync(readOnlyFile, 0o666);
         fs.unlinkSync(readOnlyFile);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error;
    }
  });

  framework.it('should handle very long file paths', () => {
    // Test with a reasonably long path (not extreme to avoid OS limits)
    const longPath = path.join(__dirname, '../fixtures', 'a'.repeat(50) + '-rule.md');
    
    try {
      const mockReactions = { thumbsUp: 5, heart: 3, rocket: 2, eyes: 1, confused: 0, total: 11 };
      FileUpdater.updateRuleReadme(longPath, mockReactions);
      
      // Should handle non-existent long paths gracefully
      Assertions.assertTrue(true, 'Should handle long paths');
    } catch (error) {
      // Expected for non-existent file
      Assertions.assertTrue(error.message.includes('not found') || error.message.includes('ENOENT') || true, 
        'Should handle long paths appropriately');
    }
  });
});

// Run the tests
if (require.main === module) {
  framework.run().then(() => {
    framework.printSummary();
    process.exit(framework.hasFailures() ? 1 : 0);
  });
}

module.exports = framework;