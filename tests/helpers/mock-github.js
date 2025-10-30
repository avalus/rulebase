/**
 * Mock GitHub API for Testing
 * Provides realistic mock responses without making actual API calls
 */

class MockOctokit {
  constructor(options = {}) {
    this.mockData = options.mockData || {};
    this.callCount = 0;
    this.rateLimitRemaining = 5000;
    this.rateLimitReset = Date.now() + 3600000; // 1 hour from now
    
    this.rest = {
      search: {
        issuesAndPullRequests: this.mockSearchIssuesAndPullRequests.bind(this)
      },
      issues: {
        listComments: this.mockListComments.bind(this)
      },
      pulls: {
        listReviewComments: this.mockListReviewComments.bind(this),
        list: this.mockListPulls.bind(this)
      },
      repos: {
        getContent: this.mockGetContent.bind(this)
      },
      rateLimit: {
        get: this.mockGetRateLimit.bind(this)
      }
    };
  }

  async mockSearchIssuesAndPullRequests(params) {
    this.callCount++;
    this.rateLimitRemaining--;
    
    console.log(`🔍 Mock API: Searching for "${params.q}"`);
    
    // Extract rule name from search query
    const ruleMatch = params.q.match(/"([^"]+)"/);
    const ruleName = ruleMatch ? ruleMatch[1] : 'unknown-rule';
    
    // Return mock data based on rule name or use default
    const mockItems = this.mockData[ruleName] || this.getDefaultMockItems(ruleName);
    
    return {
      data: {
        items: mockItems,
        total_count: mockItems.length,
        incomplete_results: false
      }
    };
  }

  async mockListComments(params) {
    this.callCount++;
    this.rateLimitRemaining--;
    
    const issueNumber = params.issue_number;
    const mockComments = this.getMockComments(issueNumber);
    
    return {
      data: mockComments
    };
  }

  async mockListReviewComments(params) {
    this.callCount++;
    this.rateLimitRemaining--;
    
    return {
      data: [] // Usually empty for testing
    };
  }

  async mockListPulls(params) {
    this.callCount++;
    this.rateLimitRemaining--;
    
    return {
      data: [] // Usually empty for testing
    };
  }

  async mockGetRateLimit() {
    return {
      data: {
        rate: {
          limit: 5000,
          remaining: this.rateLimitRemaining,
          reset: Math.floor(this.rateLimitReset / 1000),
          used: 5000 - this.rateLimitRemaining
        }
      }
    };
  }

  async mockGetContent(params) {
    this.callCount++;
    this.rateLimitRemaining--;
    
    console.log(`📄 Mock API: Getting content for "${params.path}"`);
    
    // Mock README content based on the path
    let content = '';
    if (params.path.includes('smart-code-reviewer')) {
      content = '# Smart Code Reviewer\n\nAn AI agent rule that performs comprehensive code reviews...';
    } else if (params.path.includes('technical-writer')) {
      content = '# Technical Writer\n\nAn AI agent rule that creates clear, comprehensive technical documentation...';
    } else if (params.path.includes('insights-generator')) {
      content = '# Insights Generator\n\nAn AI agent rule that analyzes data and generates actionable insights...';
    } else {
      // Default content for unknown rules
      const ruleName = params.path.split('/').pop().replace('.md', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      content = `# ${ruleName}\n\nA sample rule description...`;
    }
    
    return {
      data: {
        content: Buffer.from(content).toString('base64'),
        encoding: 'base64'
      }
    };
  }

  getDefaultMockItems(ruleName) {
    // Generate realistic mock data based on rule name
    const baseReactions = this.generateMockReactions(ruleName);
    
    return [
      {
        number: 123,
        title: `Discussion about ${ruleName}`,
        body: `This is a test issue mentioning ${ruleName}`,
        state: 'open',
        reactions: baseReactions,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      },
      {
        number: 124,
        title: `Feature request for ${ruleName}`,
        body: `Enhancement suggestion for ${ruleName}`,
        state: 'closed',
        reactions: this.generateMockReactions(ruleName, 0.7), // 70% of base reactions
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-18T12:00:00Z'
      }
    ];
  }

  getMockComments(issueNumber) {
    // Generate mock comments with reactions
    return [
      {
        id: 1001,
        body: 'Great suggestion!',
        reactions: {
          '+1': 3,
          '-1': 0,
          'laugh': 0,
          'hooray': 1,
          'confused': 0,
          'heart': 2,
          'rocket': 1,
          'eyes': 1
        },
        created_at: '2024-01-16T11:00:00Z'
      },
      {
        id: 1002,
        body: 'I agree with this approach.',
        reactions: {
          '+1': 2,
          '-1': 0,
          'laugh': 0,
          'hooray': 0,
          'confused': 0,
          'heart': 1,
          'rocket': 0,
          'eyes': 0
        },
        created_at: '2024-01-17T14:30:00Z'
      }
    ];
  }

  generateMockReactions(ruleName, multiplier = 1.0) {
    // Generate reactions based on rule name characteristics
    let baseThumbsUp = 10;
    let baseHeart = 5;
    let baseRocket = 3;
    let baseEyes = 2;
    let baseConfused = 1;

    // Adjust based on rule name
    if (ruleName.includes('smart-code-reviewer')) {
      baseThumbsUp = 25;
      baseHeart = 8;
      baseRocket = 5;
      baseEyes = 3;
      baseConfused = 1;
    } else if (ruleName.includes('technical-writer')) {
      baseThumbsUp = 15;
      baseHeart = 12;
      baseRocket = 3;
      baseEyes = 2;
      baseConfused = 0;
    } else if (ruleName.includes('insights-generator')) {
      baseThumbsUp = 35;
      baseHeart = 18;
      baseRocket = 12;
      baseEyes = 5;
      baseConfused = 2;
    }

    // Apply multiplier and add some randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    const finalMultiplier = multiplier * randomFactor;

    return {
      '+1': Math.floor(baseThumbsUp * finalMultiplier),
      '-1': Math.floor(baseConfused * finalMultiplier),
      'laugh': 0,
      'hooray': Math.floor((baseRocket / 2) * finalMultiplier),
      'confused': Math.floor(baseConfused * finalMultiplier),
      'heart': Math.floor(baseHeart * finalMultiplier),
      'rocket': Math.floor(baseRocket * finalMultiplier),
      'eyes': Math.floor(baseEyes * finalMultiplier)
    };
  }

  // Utility methods for testing
  getCallCount() {
    return this.callCount;
  }

  getRateLimitRemaining() {
    return this.rateLimitRemaining;
  }

  resetCallCount() {
    this.callCount = 0;
    this.rateLimitRemaining = 5000;
  }

  setMockData(ruleName, mockItems) {
    this.mockData[ruleName] = mockItems;
  }

  simulateRateLimit() {
    this.rateLimitRemaining = 0;
  }

  simulateError(errorType = 'network') {
    const errors = {
      network: new Error('Network error: ECONNRESET'),
      auth: new Error('Bad credentials'),
      rateLimit: new Error('API rate limit exceeded'),
      notFound: new Error('Not Found')
    };
    
    throw errors[errorType] || new Error('Unknown error');
  }
}

// Mock data presets for common testing scenarios
const MockDataPresets = {
  // New rule with minimal reactions
  newRule: {
    'new-rule': [
      {
        number: 200,
        title: 'New rule discussion',
        reactions: {
          '+1': 2,
          'heart': 1,
          'rocket': 0,
          'eyes': 1,
          'confused': 0
        }
      }
    ]
  },

  // Rule with mixed reactions
  mixedReactions: {
    'controversial-rule': [
      {
        number: 300,
        title: 'Controversial rule discussion',
        reactions: {
          '+1': 15,
          '-1': 8,
          'heart': 5,
          'rocket': 2,
          'eyes': 3,
          'confused': 5
        }
      }
    ]
  },

  // Empty results
  noResults: {}
};

module.exports = {
  MockOctokit,
  MockDataPresets
};