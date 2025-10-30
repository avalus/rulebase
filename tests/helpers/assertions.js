/**
 * Custom Assertions for Rulebase Testing
 * Specialized assertions for testing reactions and patterns
 */

const { Assertions } = require('./test-utils');

class RulebaseAssertions extends Assertions {
  
  // Reaction-specific assertions
  static assertValidReactions(reactions, message = 'Invalid reactions object') {
    this.assertTrue(typeof reactions === 'object', `${message}: must be object`);
    this.assertTrue(typeof reactions.thumbsUp === 'number', `${message}: thumbsUp must be number`);
    this.assertTrue(typeof reactions.heart === 'number', `${message}: heart must be number`);
    this.assertTrue(typeof reactions.rocket === 'number', `${message}: rocket must be number`);
    this.assertTrue(typeof reactions.eyes === 'number', `${message}: eyes must be number`);
    this.assertTrue(typeof reactions.confused === 'number', `${message}: confused must be number`);
    
    // All reaction counts should be non-negative
    this.assertTrue(reactions.thumbsUp >= 0, `${message}: thumbsUp must be >= 0`);
    this.assertTrue(reactions.heart >= 0, `${message}: heart must be >= 0`);
    this.assertTrue(reactions.rocket >= 0, `${message}: rocket must be >= 0`);
    this.assertTrue(reactions.eyes >= 0, `${message}: eyes must be >= 0`);
    this.assertTrue(reactions.confused >= 0, `${message}: confused must be >= 0`);
  }

  static assertReactionTotals(reactions, message = 'Reaction totals mismatch') {
    const calculatedTotal = reactions.thumbsUp + reactions.heart + reactions.rocket + 
                           reactions.eyes + reactions.confused;
    
    if (reactions.total !== undefined) {
      this.assertEqual(reactions.total, calculatedTotal, 
        `${message}: total should equal sum of individual reactions`);
    }
    
    if (reactions.positivePercentage !== undefined && calculatedTotal > 0) {
      const positiveReactions = reactions.thumbsUp + reactions.heart + reactions.rocket + reactions.eyes;
      const expectedPercentage = Math.round((positiveReactions / calculatedTotal) * 100);
      this.assertEqual(reactions.positivePercentage, expectedPercentage,
        `${message}: positivePercentage calculation incorrect`);
    }
  }

  // Pattern matching assertions
  static assertPatternMatches(content, pattern, expectedCount, message = 'Pattern match failed') {
    const matches = [...content.matchAll(pattern)];
    this.assertEqual(matches.length, expectedCount, 
      `${message}: expected ${expectedCount} matches, got ${matches.length}`);
    return matches;
  }

  static assertReactionPatternInContent(content, expectedReactions, message = 'Reaction pattern not found') {
    const reactionPattern = /- 👍 \*\*(\d+)\*\* \| ❤️ \*\*(\d+)\*\* \| 🚀 \*\*(\d+)\*\* \| 👀 \*\*(\d+)\*\* \| 😕 \*\*(\d+)\*\*/;
    const match = content.match(reactionPattern);
    
    this.assertTrue(match !== null, `${message}: reaction pattern not found in content`);
    
    if (expectedReactions) {
      this.assertEqual(parseInt(match[1]), expectedReactions.thumbsUp, 
        `${message}: thumbsUp mismatch`);
      this.assertEqual(parseInt(match[2]), expectedReactions.heart, 
        `${message}: heart mismatch`);
      this.assertEqual(parseInt(match[3]), expectedReactions.rocket, 
        `${message}: rocket mismatch`);
      this.assertEqual(parseInt(match[4]), expectedReactions.eyes, 
        `${message}: eyes mismatch`);
      this.assertEqual(parseInt(match[5]), expectedReactions.confused, 
        `${message}: confused mismatch`);
    }
    
    return match;
  }

  static assertScorePatternInContent(content, expectedScore, message = 'Score pattern not found') {
    const scorePattern = /\*\*Score:\*\* ([\d.]+) points/;
    const match = content.match(scorePattern);
    
    this.assertTrue(match !== null, `${message}: score pattern not found in content`);
    
    if (expectedScore !== undefined) {
      this.assertEqual(parseFloat(match[1]), expectedScore, 
        `${message}: score value mismatch`);
    }
    
    return match;
  }

  static assertTotalReactionsPatternInContent(content, expectedTotal, message = 'Total reactions pattern not found') {
    const totalPattern = /- \*\*(\d+) total community reactions\*\*/;
    const match = content.match(totalPattern);
    
    this.assertTrue(match !== null, `${message}: total reactions pattern not found in content`);
    
    if (expectedTotal !== undefined) {
      this.assertEqual(parseInt(match[1]), expectedTotal, 
        `${message}: total reactions value mismatch`);
    }
    
    return match;
  }

  // File and content assertions
  static assertFileExists(filePath, message = 'File does not exist') {
    const fs = require('fs');
    this.assertTrue(fs.existsSync(filePath), `${message}: ${filePath}`);
  }

  static assertFileContains(filePath, searchString, message = 'File does not contain expected content') {
    const fs = require('fs');
    this.assertFileExists(filePath, message);
    
    const content = fs.readFileSync(filePath, 'utf8');
    this.assertContains(content, searchString, `${message}: ${filePath}`);
  }

  static assertValidMarkdownStructure(content, message = 'Invalid markdown structure') {
    // Check for basic markdown elements
    this.assertMatches(content, /^# /, `${message}: missing main heading`);
    this.assertMatches(content, /^## /m, `${message}: missing section headings`);
    this.assertMatches(content, /^### /m, `${message}: missing subsection headings`);
  }

  // Rule-specific assertions
  static assertValidRuleKey(ruleKey, message = 'Invalid rule key') {
    this.assertTrue(typeof ruleKey === 'string', `${message}: must be string`);
    this.assertTrue(ruleKey.includes('/'), `${message}: must contain category separator`);
    this.assertMatches(ruleKey, /^[a-z0-9-]+\/[a-z0-9-]+$/, 
      `${message}: must match pattern category/rule-name`);
  }

  static assertValidRulePath(rulePath, message = 'Invalid rule path') {
    this.assertTrue(typeof rulePath === 'string', `${message}: must be string`);
    this.assertTrue(rulePath.startsWith('rules/'), `${message}: must start with 'rules/'`);
    this.assertTrue(rulePath.endsWith('/README.md'), `${message}: must end with '/README.md'`);
  }

  // Performance assertions
  static assertExecutionTime(callback, maxTimeMs, message = 'Execution time exceeded') {
    const startTime = Date.now();
    callback();
    const executionTime = Date.now() - startTime;
    
    this.assertTrue(executionTime <= maxTimeMs, 
      `${message}: took ${executionTime}ms, expected <= ${maxTimeMs}ms`);
  }

  static async assertExecutionTimeAsync(callback, maxTimeMs, message = 'Async execution time exceeded') {
    const startTime = Date.now();
    await callback();
    const executionTime = Date.now() - startTime;
    
    this.assertTrue(executionTime <= maxTimeMs, 
      `${message}: took ${executionTime}ms, expected <= ${maxTimeMs}ms`);
  }
}

module.exports = {
  RulebaseAssertions
};