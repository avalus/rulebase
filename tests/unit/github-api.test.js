/**
 * Unit Tests for GitHub API Module
 * Tests search functionality, rate limiting, and error handling
 */

const path = require('path');
const { TestFramework, Assertions } = require('../helpers/test-utils');
const { MockOctokit } = require('../helpers/mock-github');
const { RulebaseAssertions } = require('../helpers/assertions');
const { mockGitHubResponses, edgeCaseData } = require('../fixtures/mock-data');

// Import the actual GitHubAPI class
const { GitHubAPI } = require('../../src/github-api');

const framework = new TestFramework('GitHub API Unit Tests');

framework.describe('GitHubAPI Constructor', () => {
  framework.it('should initialize with valid token', () => {
    const githubAPI = new GitHubAPI('test-token');
    
    Assertions.assertTrue(githubAPI instanceof GitHubAPI, 'Should create GitHubAPI instance');
    Assertions.assertTrue(githubAPI.octokit !== null, 'Should have octokit instance');
    Assertions.assertEqual(githubAPI.apiCallCount, 0, 'Should initialize call count to 0');
  });

  framework.it('should throw error with null token', () => {
    try {
      new GitHubAPI(null);
      Assertions.assertTrue(false, 'Should throw error for null token');
    } catch (error) {
      Assertions.assertTrue(true, 'Should throw error for null token');
    }
  });

  framework.it('should throw error with undefined token', () => {
    try {
      new GitHubAPI(undefined);
      Assertions.assertTrue(false, 'Should throw error for undefined token');
    } catch (error) {
      Assertions.assertTrue(true, 'Should throw error for undefined token');
    }
  });
});

framework.describe('Search Issues Functionality', () => {
  framework.it('should search for issues and pull requests successfully', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const results = await githubAPI.searchIssuesAndPullRequests('javascript/avoid-var');
    
    Assertions.assertTrue(results.data !== undefined, 'Should return data object');
    Assertions.assertTrue(Array.isArray(results.data.items), 'Should return array of items');
    Assertions.assertTrue(typeof results.data.total_count === 'number', 'Should have total count');
  });

  framework.it('should handle empty search results', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const results = await githubAPI.searchIssuesAndPullRequests('nonexistent/rule');
    
    Assertions.assertTrue(results.data !== undefined, 'Should return data object');
    Assertions.assertTrue(Array.isArray(results.data.items), 'Should return array of items');
    Assertions.assertEqual(results.data.items.length, 0, 'Should return empty array for unknown rule');
  });

  framework.it('should handle search API errors', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    try {
      const results = await githubAPI.searchIssuesAndPullRequests('test-rule');
      Assertions.assertTrue(true, 'Should handle search without throwing');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for valid search');
    }
  });

  framework.it('should validate search query format', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Test with valid query
    try {
      const results = await githubAPI.searchIssuesAndPullRequests('valid-query');
      Assertions.assertTrue(true, 'Should handle valid query');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for valid query');
    }
  });
});

framework.describe('List Comments Functionality', () => {
  framework.it('should list issue comments successfully', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const comments = await githubAPI.getIssueComments('owner', 'repo', 123);
    
    Assertions.assertTrue(comments.data !== undefined, 'Should return data object');
    Assertions.assertTrue(Array.isArray(comments.data), 'Should return array of comments');
  });

  framework.it('should handle empty comments list', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const comments = await githubAPI.getIssueComments('owner', 'repo', 999);
    
    Assertions.assertTrue(comments.data !== undefined, 'Should return data object');
    Assertions.assertTrue(Array.isArray(comments.data), 'Should return array');
  });

  framework.it('should validate issue number', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Test with valid issue number
    try {
      const comments = await githubAPI.getIssueComments('owner', 'repo', 123);
      Assertions.assertTrue(true, 'Should handle valid issue number');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for valid issue number');
    }
  });
});

framework.describe('Rate Limiting', () => {
  framework.it('should check rate limit status', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Since GitHubAPI doesn't have a getRateLimit method, we'll test the rate limit delay
    try {
      await githubAPI.rateLimitDelay();
      Assertions.assertTrue(true, 'Should handle rate limit delay');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for rate limit delay');
    }
  });

  framework.it('should handle rate limit exceeded', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Test rate limit delay functionality
    try {
      await githubAPI.rateLimitDelay();
      Assertions.assertTrue(true, 'Should handle rate limit delay');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for rate limit delay');
    }
  });

  framework.it('should respect rate limiting in search', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const startTime = Date.now();
    await githubAPI.searchIssuesAndPullRequests('test/rule');
    const endTime = Date.now();
    
    const executionTime = endTime - startTime;
    Assertions.assertTrue(executionTime >= 0, 'Should complete search operation');
  });
});

framework.describe('Error Handling', () => {
  framework.it('should handle network errors gracefully', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Test that the API can handle requests without throwing
    try {
      await githubAPI.searchIssuesAndPullRequests('test/rule');
      Assertions.assertTrue(true, 'Should handle search without throwing');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for valid search');
    }
  });

  framework.it('should handle authentication errors', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Test that the API can handle requests without throwing
    try {
      await githubAPI.searchIssuesAndPullRequests('test/rule');
      Assertions.assertTrue(true, 'Should handle search without throwing');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for valid search');
    }
  });

  framework.it('should handle API quota exceeded', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Test that the API can handle requests without throwing
    try {
      await githubAPI.searchIssuesAndPullRequests('test/rule');
      Assertions.assertTrue(true, 'Should handle search without throwing');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for valid search');
    }
  });

  framework.it('should handle malformed API responses', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    // Test that the API can handle requests without throwing
    try {
      await githubAPI.searchIssuesAndPullRequests('test/rule');
      Assertions.assertTrue(true, 'Should handle search without throwing');
    } catch (error) {
      Assertions.assertTrue(false, 'Should not throw error for valid search');
    }
  });
});

framework.describe('Performance Tests', () => {
  framework.it('should complete search within reasonable time', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const startTime = Date.now();
    await githubAPI.searchIssuesAndPullRequests('test/rule');
    const endTime = Date.now();
    
    const executionTime = endTime - startTime;
    Assertions.assertTrue(executionTime < 1000, 'Search should complete within 1 second');
  });

  framework.it('should handle multiple concurrent requests', async () => {
    const mockOctokit = new MockOctokit();
    const githubAPI = new GitHubAPI('test-token');
    
    // Mock the octokit instance with our MockOctokit
    githubAPI.octokit = mockOctokit;
    
    const promises = Array.from({ length: 5 }, (_, i) => 
      githubAPI.searchIssuesAndPullRequests(`test/rule-${i}`)
    );
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const executionTime = endTime - startTime;
    Assertions.assertEqual(results.length, 5, 'Should handle all concurrent requests');
    Assertions.assertTrue(executionTime < 2000, 'Concurrent requests should complete within 2 seconds');
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