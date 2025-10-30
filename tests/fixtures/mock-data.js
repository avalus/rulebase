/**
 * Mock Data and Test Fixtures for Rulebase Testing
 * Centralized location for all test data to ensure consistency
 */

const mockRules = {
  // Standard rule with positive reactions
  'javascript/avoid-var': {
    key: 'javascript/avoid-var',
    path: 'rules/javascript/avoid-var/README.md',
    reactions: {
      thumbsUp: 45,
      heart: 23,
      rocket: 18,
      eyes: 12,
      confused: 2,
      total: 100,
      positivePercentage: 98
    }
  },

  // Medium reaction rule
  'python/use-list-comprehension': {
    key: 'python/use-list-comprehension',
    path: 'rules/python/use-list-comprehension/README.md',
    reactions: {
      thumbsUp: 15,
      heart: 8,
      rocket: 5,
      eyes: 7,
      confused: 3,
      total: 38,
      positivePercentage: 92
    }
  },

  // Mixed reactions rule
  'css/avoid-important': {
    key: 'css/avoid-important',
    path: 'rules/css/avoid-important/README.md',
    reactions: {
      thumbsUp: 8,
      heart: 2,
      rocket: 1,
      eyes: 3,
      confused: 6,
      total: 20,
      positivePercentage: 70
    }
  },

  // New rule with minimal reactions
  'react/use-hooks': {
    key: 'react/use-hooks',
    path: 'rules/react/use-hooks/README.md',
    reactions: {
      thumbsUp: 3,
      heart: 1,
      rocket: 0,
      eyes: 1,
      confused: 0,
      total: 5,
      positivePercentage: 100
    }
  },

  // Rule with very few reactions
  'html/semantic-tags': {
    key: 'html/semantic-tags',
    path: 'rules/html/semantic-tags/README.md',
    reactions: {
      thumbsUp: 1,
      heart: 0,
      rocket: 0,
      eyes: 1,
      confused: 0,
      total: 2,
      positivePercentage: 100
    }
  }
};

const mockOverallStats = {
  totalReactions: 165,
  avgPositiveFeedback: 92.4,
  totalRules: 5
};


// GitHub API mock responses
const mockGitHubResponses = {
  searchIssues: {
    data: {
      items: [
        {
          number: 123,
          title: 'Rule: javascript/avoid-var',
          body: 'This rule suggests avoiding var declarations...',
          reactions: {
            '+1': 45,
            'heart': 23,
            'rocket': 18,
            'eyes': 12,
            'confused': 2
          }
        },
        {
          number: 124,
          title: 'Rule: python/use-list-comprehension',
          body: 'Use list comprehensions for better readability...',
          reactions: {
            '+1': 15,
            'heart': 8,
            'rocket': 5,
            'eyes': 7,
            'confused': 3
          }
        }
      ]
    }
  },

  listComments: {
    data: [
      {
        id: 1,
        body: 'Great rule! Very helpful.',
        reactions: {
          '+1': 5,
          'heart': 2,
          'rocket': 1,
          'eyes': 0,
          'confused': 0
        }
      },
      {
        id: 2,
        body: 'I disagree with this approach.',
        reactions: {
          '+1': 0,
          'heart': 0,
          'rocket': 0,
          'eyes': 1,
          'confused': 3
        }
      }
    ]
  },

  rateLimit: {
    data: {
      rate: {
        limit: 5000,
        remaining: 4950,
        reset: Math.floor(Date.now() / 1000) + 3600
      }
    }
  }
};

// Test file content templates
const testFileTemplates = {
  hallOfFame: `# 🏆 Hall of Fame

## Top Rules by Community Reactions

### javascript/avoid-var
- 👍 **45** | ❤️ **23** | 🚀 **18** | 👀 **12** | 😕 **2**
- **100 total community reactions** (98% positive)

### python/use-list-comprehension
- 👍 **15** | ❤️ **8** | 🚀 **5** | 👀 **7** | 😕 **3**
- **38 total community reactions** (92% positive)

### css/avoid-important
- 👍 **8** | ❤️ **2** | 🚀 **1** | 👀 **3** | 😕 **6**
- **20 total community reactions** (70% positive)

### react/use-hooks
- 👍 **3** | ❤️ **1** | 🚀 **0** | 👀 **1** | 😕 **0**
- **5 total community reactions** (100% positive)

## 📊 Overall Statistics
- **Total Community Reactions:** 165
- **Average Positive Feedback:** 92.4%`,

  ruleReadme: `# Rule: javascript/avoid-var

## Description
Avoid using \`var\` declarations in modern JavaScript. Use \`let\` or \`const\` instead.

## Why?
- \`var\` has function scope, which can lead to unexpected behavior
- \`let\` and \`const\` have block scope, which is more predictable
- \`const\` prevents accidental reassignment

## Examples

### ❌ Bad
\`\`\`javascript
var name = 'John';
var age = 30;
\`\`\`

### ✅ Good
\`\`\`javascript
const name = 'John';
let age = 30;
\`\`\`

## References
- [MDN: var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [MDN: let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)`
};

// Edge case test data
const edgeCaseData = {
  // Rule with zero reactions
  noReactions: {
    key: 'test/no-reactions',
    path: 'rules/test/no-reactions/README.md',
    reactions: {
      thumbsUp: 0,
      heart: 0,
      rocket: 0,
      eyes: 0,
      confused: 0,
      total: 0,
      positivePercentage: 0
    }
  },

  // Rule with only negative reactions
  onlyNegative: {
    key: 'test/only-negative',
    path: 'rules/test/only-negative/README.md',
    reactions: {
      thumbsUp: 0,
      heart: 0,
      rocket: 0,
      eyes: 0,
      confused: 10,
      total: 10,
      positivePercentage: 0
    }
  },

  // Rule with extremely high reactions
  extremelyHigh: {
    key: 'test/extremely-high',
    path: 'rules/test/extremely-high/README.md',
    reactions: {
      thumbsUp: 500,
      heart: 300,
      rocket: 200,
      eyes: 150,
      confused: 5,
      total: 1155,
      positivePercentage: 99
    }
  },

  // Invalid rule key formats
  invalidKeys: [
    'invalid-key-no-slash',
    'invalid/key/too/many/slashes',
    'INVALID/UPPERCASE',
    'invalid/key with spaces',
    'invalid/key_with_underscores',
    '',
    null,
    undefined
  ],

  // Malformed content
  malformedContent: {
    noHeadings: 'This is content without any headings or structure.',
    invalidMarkdown: '# Heading\n\nSome content\n\n## Invalid **bold without closing',
    emptyContent: '',
    onlyWhitespace: '   \n\t  \n   '
  }
};

// Performance test data
const performanceTestData = {
  largeRuleSet: Array.from({ length: 1000 }, (_, i) => ({
    key: `category${Math.floor(i / 100)}/rule-${i}`,
    path: `rules/category${Math.floor(i / 100)}/rule-${i}/README.md`,
    reactions: {
      thumbsUp: Math.floor(Math.random() * 50),
      heart: Math.floor(Math.random() * 30),
      rocket: Math.floor(Math.random() * 20),
      eyes: Math.floor(Math.random() * 15),
      confused: Math.floor(Math.random() * 10),
      total: 0, // Will be calculated
      positivePercentage: 0 // Will be calculated
    }
  })).map(rule => {
    rule.reactions.total = rule.reactions.thumbsUp + rule.reactions.heart + 
                          rule.reactions.rocket + rule.reactions.eyes + rule.reactions.confused;
    const positive = rule.reactions.thumbsUp + rule.reactions.heart + 
                    rule.reactions.rocket + rule.reactions.eyes;
    rule.reactions.positivePercentage = rule.reactions.total > 0 ? 
      Math.round((positive / rule.reactions.total) * 100) : 0;
    return rule;
  })
};

// Helper functions for generating test data
const testDataGenerators = {
  randomReactions: (min = 0, max = 100) => {
    const thumbsUp = Math.floor(Math.random() * max) + min;
    const heart = Math.floor(Math.random() * (max / 2));
    const rocket = Math.floor(Math.random() * (max / 3));
    const eyes = Math.floor(Math.random() * (max / 4));
    const confused = Math.floor(Math.random() * (max / 10));
    const total = thumbsUp + heart + rocket + eyes + confused;
    const positive = thumbsUp + heart + rocket + eyes;
    
    return {
      thumbsUp,
      heart,
      rocket,
      eyes,
      confused,
      total,
      positivePercentage: total > 0 ? Math.round((positive / total) * 100) : 0
    };
  },

  randomRule: (category = 'test', name = null) => {
    const ruleName = name || `rule-${Math.floor(Math.random() * 1000)}`;
    const key = `${category}/${ruleName}`;
    const reactions = testDataGenerators.randomReactions();
    
    return {
      key,
      path: `rules/${key}/README.md`,
      reactions
    };
  },

  ruleSet: (count = 10) => {
    return Array.from({ length: count }, (_, i) => 
      testDataGenerators.randomRule('test', `rule-${i}`)
    );
  }
};

module.exports = {
  mockRules,
  mockOverallStats,
  mockGitHubResponses,
  testFileTemplates,
  edgeCaseData,
  performanceTestData,
  testDataGenerators
};