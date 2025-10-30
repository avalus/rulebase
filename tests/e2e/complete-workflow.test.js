/**
 * End-to-End Tests for Complete Workflow
 * Tests the entire system working together from start to finish
 */

const fs = require('fs');
const path = require('path');
const { TestFramework, Assertions } = require('../helpers/test-utils');
const { GitHubAPI } = require('../../src/github-api');
const { ReactionCollector } = require('../../src/reaction-collector');
const { RuleScanner } = require('../../src/rule-scanner');
const { FileUpdater } = require('../../src/file-updater');
const { MockOctokit } = require('../helpers/mock-github');

const framework = new TestFramework('Complete Workflow E2E Tests');

framework.describe('Full System Integration', () => {
  framework.it('should run complete workflow from scanning to file updates', async () => {
    // 1. Initialize all components
    const githubAPI = new GitHubAPI('test-token');
    const mockOctokit = new MockOctokit();
    githubAPI.octokit = mockOctokit;
    
    const reactionCollector = new ReactionCollector(githubAPI);
    
    // 2. Scan for rules
    const { totalRules, categories } = RuleScanner.scanRules('./rules');
    Assertions.assertTrue(totalRules >= 0, 'Should scan rules successfully');
    
    // 3. Collect reactions for available rules
    const ruleReactions = {};
    let totalReactions = 0;
    
    // Use mock data for testing
    const testRules = ['coding/smart-code-reviewer', 'content/technical-writer'];
    
    for (const ruleKey of testRules) {
      const reactions = await reactionCollector.getRuleReactions('test-owner', 'test-repo', `rules/${ruleKey}/README.md`);
      ruleReactions[ruleKey] = reactions;
      totalReactions += reactions.total;
    }
    
    // 4. Update Hall of Fame
    try {
      FileUpdater.updateHallOfFame({}, 0, 'non-existent-hall-of-fame.md');
      Assertions.assertTrue(true, 'Should handle Hall of Fame update gracefully');
    } catch (error) {
      throw new Error('Should handle Hall of Fame update gracefully: ' + error.message);
    }
    
    // 5. Verify workflow completed
    Assertions.assertTrue(typeof ruleReactions === 'object', 'Should collect reaction data');
    Assertions.assertTrue(totalReactions >= 0, 'Should calculate total reactions');
  });

  framework.it('should handle complete workflow with real file operations', () => {
    // Create temporary test files
    const testRuleContent = `# Test Rule

## Community Feedback
<!-- STATS_START -->
👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0** | **Total: 0 reactions**
<!-- STATS_END -->`;

    const testHallContent = `# Hall of Fame

## Overall Statistics
<!-- OVERALL_TOTAL_START -->
**0+ total community reactions**
<!-- OVERALL_TOTAL_END -->

<!-- OVERALL_FEEDBACK_START -->
**0% average positive feedback**
<!-- OVERALL_FEEDBACK_END -->

## Rules
### Test Rule
<!-- HALL_RULE_START:test/rule -->
- 👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0**
<!-- HALL_RULE_END:test/rule -->`;

    const tempRuleFile = path.join(__dirname, '../fixtures/e2e-rule.md');
    const tempHallFile = path.join(__dirname, '../fixtures/temp-hall-of-fame.md');
    
    fs.writeFileSync(tempRuleFile, testRuleContent);
    fs.writeFileSync(tempHallFile, testHallContent);
    
    try {
      // Test complete workflow
      const mockReactions = {
        thumbsUp: 10,
        heart: 5,
        rocket: 3,
        eyes: 2,
        confused: 1,
        total: 21
      };
      
      // Update rule README
      const ruleResult = FileUpdater.updateRuleReadme(tempRuleFile, mockReactions);
      Assertions.assertTrue(ruleResult, 'Should update rule README');
      
      // Update Hall of Fame
      const hallResult = FileUpdater.updateHallOfFame({ 'test/rule': mockReactions }, 21, tempHallFile);
      Assertions.assertTrue(hallResult, 'Should update Hall of Fame');
      
      // Verify updates
      const updatedRuleContent = fs.readFileSync(tempRuleFile, 'utf8');
      const updatedHallContent = fs.readFileSync(tempHallFile, 'utf8');
      
      Assertions.assertTrue(updatedRuleContent.includes('👍 **10**'), 'Rule should be updated');
      Assertions.assertTrue(updatedHallContent.includes('👍 **10**'), 'Hall should be updated');
      
      // Clean up
      fs.unlinkSync(tempRuleFile);
      fs.unlinkSync(tempHallFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempRuleFile)) fs.unlinkSync(tempRuleFile);
      if (fs.existsSync(tempHallFile)) fs.unlinkSync(tempHallFile);
      throw error;
    }
  });
});

framework.describe('Error Recovery and Resilience', () => {
  framework.it('should recover from API failures gracefully', async () => {
    // Initialize with failing API
    const githubAPI = new GitHubAPI('invalid-token');
    const mockOctokit = new MockOctokit();
    mockOctokit.shouldFail = true;
    githubAPI.octokit = mockOctokit;
    
    const reactionCollector = new ReactionCollector(githubAPI);
    
    // Should handle failures without crashing
    const reactions = await reactionCollector.getRuleReactions('test-owner', 'test-repo', 'test/rule');
    
    Assertions.assertTrue(typeof reactions === 'object', 'Should return reaction object on failure');
    Assertions.assertTrue(reactions.total === 0, 'Should return zero reactions on failure');
    
    // File operations should still work
    try {
      FileUpdater.updateHallOfFame({}, 0, 'non-existent-hall-of-fame.md');
      Assertions.assertTrue(true, 'Should handle file operations after API failure');
    } catch (error) {
      throw new Error('Should handle file operations after API failure: ' + error.message);
    }
  });

  framework.it('should handle missing files gracefully in complete workflow', () => {
    // Test workflow with missing files
    const mockReactions = {
      'non-existent/rule': {
        thumbsUp: 5, heart: 3, rocket: 2, eyes: 1, confused: 0, total: 11
      }
    };
    
    try {
      // Should handle missing Hall of Fame
      FileUpdater.updateHallOfFame(mockReactions, 11, 'non-existent-hall-of-fame.md');
      
      // Should handle missing rule README
      FileUpdater.updateRuleReadme('non-existent-rule.md', mockReactions['non-existent/rule']);
      
      Assertions.assertTrue(true, 'Should handle missing files gracefully');
    } catch (error) {
      throw new Error('Should handle missing files gracefully: ' + error.message);
    }
  });
});