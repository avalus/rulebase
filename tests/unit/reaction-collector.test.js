/**
 * Unit tests for ReactionCollector
 */

const { TestFramework, Assertions } = require('../helpers/test-utils');
const { RulebaseAssertions } = require('../helpers/assertions');
const { MockOctokit } = require('../helpers/mock-github');
const { mockGitHubResponses, mockRules, edgeCaseData } = require('../fixtures/mock-data');

// Import the classes to test
const { ReactionCollector } = require('../../src/reaction-collector');
const { GitHubAPI } = require('../../src/github-api');

const framework = new TestFramework('Reaction Collector Unit Tests');

framework.describe('ReactionCollector Constructor', () => {
  framework.it('should initialize with valid GitHub API instance', () => {
    const githubAPI = new GitHubAPI('test-token');
    const collector = new ReactionCollector(githubAPI);
    
    Assertions.assertTrue(collector instanceof ReactionCollector, 'Should create ReactionCollector instance');
    Assertions.assertTrue(typeof collector.getRuleReactions === 'function', 'Should have getRuleReactions method');
    Assertions.assertTrue(collector.githubAPI !== null, 'Should have githubAPI instance');
  });

  framework.it('should throw error with invalid GitHub API instance', () => {
    try {
      new ReactionCollector(null);
      Assertions.assertTrue(false, 'Should throw error for null instance');
    } catch (error) {
      Assertions.assertTrue(true, 'Should throw error for null instance');
    }
    
    try {
      new ReactionCollector(undefined);
      Assertions.assertTrue(false, 'Should throw error for undefined instance');
    } catch (error) {
      Assertions.assertTrue(true, 'Should throw error for undefined instance');
    }
  });
});

framework.describe('Reaction Collection', () => {
  framework.it('should collect reactions for a single rule', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const collector = new ReactionCollector(githubAPI);
    
    try {
      const reactions = await collector.getRuleReactions('owner', 'repo', 'rules/coding/smart-code-reviewer/README.md');
      
      Assertions.assertTrue(typeof reactions === 'object', 'Should return reactions object');
      Assertions.assertTrue(typeof reactions.total === 'number', 'Should have total count');
      Assertions.assertTrue(typeof reactions.thumbsUp === 'number', 'Should have thumbsUp count');
      Assertions.assertTrue(typeof reactions.heart === 'number', 'Should have heart count');
    } catch (error) {
      Assertions.assertTrue(false, `Should not throw error: ${error.message}`);
    }
  });

  framework.it('should handle rules with no GitHub issues', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    githubAPI.octokit = mockOctokit;
    const collector = new ReactionCollector(githubAPI);
    
    mockOctokit.setSearchResponse({ data: { items: [] } });
    
    try {
      const reactions = await collector.getRuleReactions('owner', 'repo', 'rules/nonexistent/rule/README.md');
      
      Assertions.assertTrue(typeof reactions === 'object', 'Should return reactions object');
      Assertions.assertTrue(typeof reactions.total === 'number', 'Should have total count');
      Assertions.assertEqual(reactions.total, 0, 'Should have zero total reactions');
    } catch (error) {
      Assertions.assertTrue(false, `Should not throw error: ${error.message}`);
    }
  });

  framework.it('should handle API errors gracefully', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    githubAPI.octokit = mockOctokit;
    const collector = new ReactionCollector(githubAPI);
    
    mockOctokit.setSearchError(new Error('API rate limit exceeded'));
    
    try {
      await collector.getRuleReactions('owner', 'repo', 'rules/javascript/avoid-var/README.md');
      Assertions.assertTrue(false, 'Should throw error for API failure');
    } catch (error) {
      Assertions.assertTrue(true, 'Should propagate API errors');
    }
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  framework.run().then(() => {
    console.log('All tests completed');
  });
}

module.exports = framework;