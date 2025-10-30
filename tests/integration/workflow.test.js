/**
 * Integration Tests for File Updater V2 Workflow
 * Tests the complete workflow of updating rule statistics
 */

const fs = require('fs');
const path = require('path');
const { TestFramework, Assertions } = require('../helpers/test-utils');
const { FileUpdater } = require('../../src/file-updater');

const framework = new TestFramework('File Updater V2 Workflow Integration Tests');

framework.describe('Complete Workflow Integration', () => {
  framework.it('should complete full update workflow for rule README', () => {
    // Create a realistic rule README
    const testContent = `# Smart Code Reviewer

An AI-powered code review assistant that provides intelligent feedback on code quality, best practices, and potential improvements.

## Example Prompts

- "Review this JavaScript function for performance issues"
- "Check this Python code for security vulnerabilities"
- "Suggest improvements for this React component"

## Community Feedback

We value your feedback! Please react to this rule to help us improve it.

### Current Community Reactions
${FileUpdater.MARKERS.RULE_STATS_START}
👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0** | **Total: 0 reactions**
${FileUpdater.MARKERS.RULE_STATS_END}

## Usage Guidelines

This rule works best when you provide specific code snippets and context about what you're trying to achieve.`;
    
    const tempFile = path.join(__dirname, '../fixtures/workflow-rule-readme.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      // Test the complete workflow
      const reactions = {
        thumbsUp: 25,
        heart: 12,
        rocket: 8,
        eyes: 5,
        confused: 2,
        total: 52
      };
      
      const result = FileUpdater.updateRuleReadme(tempFile, reactions);
      Assertions.assertTrue(result, 'Should successfully complete workflow');
      
      // Verify the update
      const updatedContent = fs.readFileSync(tempFile, 'utf8');
      Assertions.assertTrue(updatedContent.includes('👍 **25**'), 'Should update thumbs up');
      Assertions.assertTrue(updatedContent.includes('❤️ **12**'), 'Should update hearts');
      Assertions.assertTrue(updatedContent.includes('🚀 **8**'), 'Should update rockets');
      Assertions.assertTrue(updatedContent.includes('👀 **5**'), 'Should update eyes');
      Assertions.assertTrue(updatedContent.includes('😕 **2**'), 'Should update confused');
      Assertions.assertTrue(updatedContent.includes('**Total: 52 reactions**'), 'Should update total');
      
      // Verify original content is preserved
      Assertions.assertTrue(updatedContent.includes('Smart Code Reviewer'), 'Should preserve title');
      Assertions.assertTrue(updatedContent.includes('Example Prompts'), 'Should preserve sections');
      Assertions.assertTrue(updatedContent.includes('Usage Guidelines'), 'Should preserve guidelines');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should complete full update workflow for Hall of Fame', () => {
    // Create a realistic Hall of Fame
    const testContent = `# Hall of Fame

Welcome to the Rule Hall of Fame! This page showcases our most popular and effective AI rules based on community feedback.

## Overall Statistics

${FileUpdater.MARKERS.OVERALL_TOTAL_START}
**0+ total community reactions**
${FileUpdater.MARKERS.OVERALL_TOTAL_END}

${FileUpdater.MARKERS.OVERALL_FEEDBACK_START}
**0% average positive feedback**
${FileUpdater.MARKERS.OVERALL_FEEDBACK_END}

## Top Rules

### 🏆 Smart Code Reviewer
*An AI-powered code review assistant*

${FileUpdater.MARKERS.HALL_RULE_START('coding/smart-code-reviewer')}
- 👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0**
${FileUpdater.MARKERS.HALL_RULE_END('coding/smart-code-reviewer')}

### 📝 Technical Writer
*Professional technical documentation assistant*

${FileUpdater.MARKERS.HALL_RULE_START('content/technical-writer')}
- 👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0**
${FileUpdater.MARKERS.HALL_RULE_END('content/technical-writer')}

### 📊 Insights Generator
*Data analysis and insights extraction*

${FileUpdater.MARKERS.HALL_RULE_START('data-analysis/insights-generator')}
- 👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0**
${FileUpdater.MARKERS.HALL_RULE_END('data-analysis/insights-generator')}

## Contributing

Want to see your rule featured here? Create amazing rules that help the community!`;
    
    const tempHallFile = path.join(__dirname, '../fixtures/temp-hall-of-fame.md');
    fs.writeFileSync(tempHallFile, testContent);
    
    try {
      // Test the complete Hall of Fame workflow
      const ruleReactions = {
        'coding/smart-code-reviewer': {
          thumbsUp: 45,
          heart: 23,
          rocket: 15,
          eyes: 8,
          confused: 3,
          total: 94
        },
        'content/technical-writer': {
          thumbsUp: 38,
          heart: 19,
          rocket: 12,
          eyes: 6,
          confused: 2,
          total: 77
        },
        'data-analysis/insights-generator': {
          thumbsUp: 32,
          heart: 16,
          rocket: 10,
          eyes: 5,
          confused: 1,
          total: 64
        }
      };
      
      const totalReactions = 235;
      const result = FileUpdater.updateHallOfFame(ruleReactions, totalReactions, tempHallFile);
      Assertions.assertTrue(result, 'Should successfully complete Hall of Fame workflow');
      
      // Verify the updates
      const updatedContent = fs.readFileSync(tempHallFile, 'utf8');
      
      // Check individual rule updates
      Assertions.assertTrue(updatedContent.includes('👍 **45**'), 'Should update smart-code-reviewer thumbs up');
      Assertions.assertTrue(updatedContent.includes('👍 **38**'), 'Should update technical-writer thumbs up');
      Assertions.assertTrue(updatedContent.includes('👍 **32**'), 'Should update insights-generator thumbs up');
      
      // Check overall statistics
      Assertions.assertTrue(updatedContent.includes('235+ total community reactions'), 'Should update total reactions');
      
      // Verify original content is preserved
      Assertions.assertTrue(updatedContent.includes('Hall of Fame'), 'Should preserve title');
      Assertions.assertTrue(updatedContent.includes('Top Rules'), 'Should preserve sections');
      Assertions.assertTrue(updatedContent.includes('Contributing'), 'Should preserve contributing section');
      
      // Clean up
      fs.unlinkSync(tempHallFile);
    } catch (error) {
      if (fs.existsSync(tempHallFile)) fs.unlinkSync(tempHallFile);
      throw error;
    }
  });

  framework.it('should handle workflow with marker validation', () => {
    const testContent = `# Test Rule
${FileUpdater.MARKERS.RULE_STATS_START}
👍 **10** | ❤️ **5** | 🚀 **3** | 👀 **2** | 😕 **1** | **Total: 21 reactions**
${FileUpdater.MARKERS.RULE_STATS_END}`;
    
    const tempFile = path.join(__dirname, '../fixtures/validation-test.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      // First validate markers
      const validation = FileUpdater.validateMarkers(tempFile, [
        FileUpdater.MARKERS.RULE_STATS_START,
        FileUpdater.MARKERS.RULE_STATS_END
      ]);
      
      Assertions.assertTrue(validation.success, 'Should validate markers successfully');
      
      // Then update
      const reactions = {
        thumbsUp: 20,
        heart: 10,
        rocket: 6,
        eyes: 4,
        confused: 2,
        total: 42
      };
      
      const result = FileUpdater.updateRuleReadme(tempFile, reactions);
      Assertions.assertTrue(result, 'Should update after successful validation');
      
      // Verify update
      const updatedContent = fs.readFileSync(tempFile, 'utf8');
      Assertions.assertTrue(updatedContent.includes('👍 **20**'), 'Should update to new values');
      Assertions.assertTrue(updatedContent.includes('**Total: 42 reactions**'), 'Should update total');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should handle workflow with missing markers gracefully', () => {
    const testContent = `# Test Rule Without Markers
This rule doesn't have the required markers.
👍 **5** | ❤️ **3** | 🚀 **2** | 👀 **1** | 😕 **0** | **Total: 11 reactions**`;
    
    const tempFile = path.join(__dirname, '../fixtures/no-markers-test.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      // Validate markers (should fail)
      const validation = FileUpdater.validateMarkers(tempFile, [
        FileUpdater.MARKERS.RULE_STATS_START,
        FileUpdater.MARKERS.RULE_STATS_END
      ]);
      
      Assertions.assertTrue(!validation.success, 'Should fail validation for missing markers');
      Assertions.assertTrue(validation.missingMarkers.length > 0, 'Should report missing markers');
      
      // Try to update (should fail gracefully)
      const reactions = {
        thumbsUp: 10,
        heart: 6,
        rocket: 4,
        eyes: 2,
        confused: 1,
        total: 23
      };
      
      const result = FileUpdater.updateRuleReadme(tempFile, reactions);
      Assertions.assertTrue(!result, 'Should return false for missing markers');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });
});

framework.describe('End-to-End Workflow Simulation', () => {
  framework.it('should simulate complete stats update cycle', () => {
    // Simulate the complete cycle that would happen in production
    
    // 1. Create rule README with initial stats
    const initialContent = `# Production Test Rule

## Community Feedback
${FileUpdater.MARKERS.RULE_STATS_START}
👍 **5** | ❤️ **2** | 🚀 **1** | 👀 **1** | 😕 **0** | **Total: 9 reactions**
${FileUpdater.MARKERS.RULE_STATS_END}`;
    
    const ruleFile = path.join(__dirname, '../fixtures/production-rule.md');
    fs.writeFileSync(ruleFile, initialContent);
    
    // 2. Create Hall of Fame with initial stats
    const initialHallContent = `# Hall of Fame

## Overall Statistics
${FileUpdater.MARKERS.OVERALL_TOTAL_START}
**50+ total community reactions**
${FileUpdater.MARKERS.OVERALL_TOTAL_END}

${FileUpdater.MARKERS.OVERALL_FEEDBACK_START}
**85% average positive feedback**
${FileUpdater.MARKERS.OVERALL_FEEDBACK_END}

## Rules
### Production Test Rule
${FileUpdater.MARKERS.HALL_RULE_START('test/production-test-rule')}
- 👍 **5** | ❤️ **2** | 🚀 **1** | 👀 **1** | 😕 **0**
${FileUpdater.MARKERS.HALL_RULE_END('test/production-test-rule')}`;
    
    const hallFile = path.join(__dirname, '../fixtures/temp-hall-of-fame-e2e.md');
    fs.writeFileSync(hallFile, initialHallContent);
    
    try {
      // 3. Simulate new reactions coming in
      const newReactions = {
        thumbsUp: 15,
        heart: 8,
        rocket: 5,
        eyes: 3,
        confused: 1,
        total: 32
      };
      
      // 4. Update rule README
      const ruleResult = FileUpdater.updateRuleReadme(ruleFile, newReactions);
      Assertions.assertTrue(ruleResult, 'Should update rule README successfully');
      
      // 5. Update Hall of Fame
      const hallReactions = {
        'test/production-test-rule': newReactions
      };
      const hallResult = FileUpdater.updateHallOfFame(hallReactions, 150, hallFile);
      Assertions.assertTrue(hallResult, 'Should update Hall of Fame successfully');
      
      // 6. Verify both files were updated correctly
      const updatedRuleContent = fs.readFileSync(ruleFile, 'utf8');
      const updatedHallContent = fs.readFileSync(hallFile, 'utf8');
      
      // Check rule file
      Assertions.assertTrue(updatedRuleContent.includes('👍 **15**'), 'Rule should have updated thumbs up');
      Assertions.assertTrue(updatedRuleContent.includes('**Total: 32 reactions**'), 'Rule should have updated total');
      
      // Check Hall of Fame
      Assertions.assertTrue(updatedHallContent.includes('👍 **15**'), 'Hall should have updated thumbs up');
      Assertions.assertTrue(updatedHallContent.includes('150+ total community reactions'), 'Hall should have updated total');
      
      // Clean up
      fs.unlinkSync(ruleFile);
      fs.unlinkSync(hallFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(ruleFile)) fs.unlinkSync(ruleFile);
      if (fs.existsSync(hallFile)) fs.unlinkSync(hallFile);
      throw error;
    }
  });
});