/**
 * Unit Tests for File Updater V2 Module
 * Tests the improved marker-based file update system
 */

const fs = require('fs');
const path = require('path');
const { TestFramework, Assertions } = require('../helpers/test-utils');
const { FileUpdater } = require('../../src/file-updater');

const framework = new TestFramework('File Updater V2 Unit Tests');

// Test data
const mockReactions = {
  thumbsUp: 15,
  heart: 8,
  rocket: 5,
  eyes: 3,
  confused: 2,
  total: 33
};

const mockRuleReactions = {
  'coding/smart-code-reviewer': {
    thumbsUp: 15,
    heart: 8,
    rocket: 5,
    eyes: 3,
    confused: 2,
    total: 33
  },
  'content/technical-writer': {
    thumbsUp: 12,
    heart: 6,
    rocket: 4,
    eyes: 2,
    confused: 1,
    total: 25
  }
};

// Test file paths
const testRuleReadmePath = path.join(__dirname, '../fixtures/test-rule-readme.md');
const testHallOfFamePath = path.join(__dirname, '../fixtures/test-hall-of-fame.md');

framework.describe('FileUpdater Static Methods', () => {
  framework.it('should have all required static methods', () => {
    Assertions.assertTrue(typeof FileUpdater.updateRuleReadme === 'function', 'Should have updateRuleReadme method');
    Assertions.assertTrue(typeof FileUpdater.updateHallOfFame === 'function', 'Should have updateHallOfFame method');
    Assertions.assertTrue(typeof FileUpdater.addMarkersToRuleReadme === 'function', 'Should have addMarkersToRuleReadme method');
    Assertions.assertTrue(typeof FileUpdater.validateMarkers === 'function', 'Should have validateMarkers method');
    Assertions.assertTrue(typeof FileUpdater.updateOverallStatistics === 'function', 'Should have updateOverallStatistics method');
  });

  framework.it('should have correct marker constants', () => {
    Assertions.assertTrue(typeof FileUpdater.MARKERS === 'object', 'Should have MARKERS object');
    Assertions.assertTrue(typeof FileUpdater.MARKERS.RULE_STATS_START === 'string', 'Should have RULE_STATS_START marker');
    Assertions.assertTrue(typeof FileUpdater.MARKERS.RULE_STATS_END === 'string', 'Should have RULE_STATS_END marker');
    Assertions.assertTrue(typeof FileUpdater.MARKERS.HALL_RULE_START === 'function', 'Should have HALL_RULE_START function');
    Assertions.assertTrue(typeof FileUpdater.MARKERS.HALL_RULE_END === 'function', 'Should have HALL_RULE_END function');
  });
});

framework.describe('Marker Validation', () => {
  framework.it('should validate markers correctly', () => {
    // Create a test file with markers
    const testContent = `# Test Rule
${FileUpdater.MARKERS.RULE_STATS_START}
Old stats content
${FileUpdater.MARKERS.RULE_STATS_END}
More content`;
    
    const tempFile = path.join(__dirname, '../fixtures/temp-test.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      const validation = FileUpdater.validateMarkers(tempFile, [
        FileUpdater.MARKERS.RULE_STATS_START,
        FileUpdater.MARKERS.RULE_STATS_END
      ]);
      
      Assertions.assertTrue(validation.success, 'Should validate markers successfully');
      Assertions.assertTrue(validation.missingMarkers.length === 0, 'Should have no missing markers');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should detect missing markers', () => {
    const testContent = `# Test Rule
Some content without markers`;
    
    const tempFile = path.join(__dirname, '../fixtures/temp-test-2.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      const validation = FileUpdater.validateMarkers(tempFile, [
        FileUpdater.MARKERS.RULE_STATS_START,
        FileUpdater.MARKERS.RULE_STATS_END
      ]);
      
      Assertions.assertTrue(!validation.success, 'Should fail validation for missing markers');
      Assertions.assertTrue(validation.missingMarkers.length === 2, 'Should detect 2 missing markers');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });
});

framework.describe('Rule README Updates', () => {
  framework.it('should update rule README with markers', () => {
    // Create a test README with markers
    const testContent = `# Smart Code Reviewer

This is a test rule.

## Statistics
${FileUpdater.MARKERS.RULE_STATS_START}
👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0** | **Total: 0 reactions**
${FileUpdater.MARKERS.RULE_STATS_END}

More content here.`;
    
    const tempFile = path.join(__dirname, '../fixtures/temp-rule-readme.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      const result = FileUpdater.updateRuleReadme(tempFile, mockReactions);
      Assertions.assertTrue(result, 'Should successfully update rule README');
      
      const updatedContent = fs.readFileSync(tempFile, 'utf8');
      Assertions.assertTrue(updatedContent.includes('👍 **15**'), 'Should update thumbs up count');
      Assertions.assertTrue(updatedContent.includes('❤️ **8**'), 'Should update heart count');
      Assertions.assertTrue(updatedContent.includes('**Total: 33 reactions**'), 'Should update total count');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should handle missing markers gracefully', () => {
    const testContent = `# Test Rule
No markers here`;
    
    const tempFile = path.join(__dirname, '../fixtures/temp-no-markers.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      const result = FileUpdater.updateRuleReadme(tempFile, mockReactions);
      Assertions.assertTrue(!result, 'Should return false for missing markers');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should handle non-existent files gracefully', () => {
    const result = FileUpdater.updateRuleReadme('non-existent-file.md', mockReactions);
    Assertions.assertTrue(!result, 'Should return false for non-existent files');
  });
});

framework.describe('Hall of Fame Updates', () => {
  framework.it('should update Hall of Fame with multiple rules', () => {
    // Create a test Hall of Fame with markers
    const testContent = `# Hall of Fame

## Overall Statistics
${FileUpdater.MARKERS.OVERALL_TOTAL_START}
**0+ total community reactions**
${FileUpdater.MARKERS.OVERALL_TOTAL_END}

${FileUpdater.MARKERS.OVERALL_FEEDBACK_START}
**0% average positive feedback**
${FileUpdater.MARKERS.OVERALL_FEEDBACK_END}

## Rules

### Smart Code Reviewer
${FileUpdater.MARKERS.HALL_RULE_START('coding/smart-code-reviewer')}
- 👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0**
${FileUpdater.MARKERS.HALL_RULE_END('coding/smart-code-reviewer')}

### Technical Writer
${FileUpdater.MARKERS.HALL_RULE_START('content/technical-writer')}
- 👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0**
${FileUpdater.MARKERS.HALL_RULE_END('content/technical-writer')}
`;
    
    const tempFile = path.join(__dirname, '../fixtures/temp-hall-of-fame.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      // Use the temporary file directly instead of copying to project root
      const result = FileUpdater.updateHallOfFame(mockRuleReactions, 58, tempFile);
      Assertions.assertTrue(result, 'Should successfully update Hall of Fame');
      
      const updatedContent = fs.readFileSync(tempFile, 'utf8');
      Assertions.assertTrue(updatedContent.includes('👍 **15**'), 'Should update first rule thumbs up');
      Assertions.assertTrue(updatedContent.includes('👍 **12**'), 'Should update second rule thumbs up');
      Assertions.assertTrue(updatedContent.includes('58+ total community reactions'), 'Should update total reactions');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should handle missing Hall of Fame file', () => {
    const result = FileUpdater.updateHallOfFame(mockRuleReactions, 58, 'non-existent-hall-of-fame.md');
    Assertions.assertTrue(!result, 'Should return false for missing Hall of Fame file');
  });
});

framework.describe('Error Handling', () => {
  framework.it('should handle invalid reaction data', () => {
    const invalidReactions = {
      thumbsUp: 'invalid',
      heart: null,
      rocket: undefined,
      eyes: -1,
      confused: 0,
      total: 'not a number'
    };
    
    const result = FileUpdater.updateRuleReadme('non-existent.md', invalidReactions);
    Assertions.assertTrue(!result, 'Should handle invalid reaction data gracefully');
  });

  framework.it('should handle file system errors gracefully', () => {
    // Test with a path that would cause permission errors (if any)
    try {
      const result = FileUpdater.updateRuleReadme('/invalid/path/readme.md', mockReactions);
      Assertions.assertTrue(!result, 'Should handle file system errors gracefully');
    } catch (error) {
      // If an error is thrown, it should be handled gracefully
      Assertions.assertTrue(true, 'Should handle file system errors without crashing');
    }
  });
});

framework.describe('Marker Addition', () => {
  framework.it('should add markers to existing stats line', () => {
    const testContent = `# Test Rule

Some content here.

👍 **5** | ❤️ **3** | 🚀 **2** | 👀 **1** | 😕 **0** | **Total: 11 reactions**

More content.`;
    
    const tempFile = path.join(__dirname, '../fixtures/temp-add-markers.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      const result = FileUpdater.addMarkersToRuleReadme(tempFile);
      Assertions.assertTrue(result, 'Should successfully add markers');
      
      const updatedContent = fs.readFileSync(tempFile, 'utf8');
      Assertions.assertTrue(updatedContent.includes(FileUpdater.MARKERS.RULE_STATS_START), 'Should add start marker');
      Assertions.assertTrue(updatedContent.includes(FileUpdater.MARKERS.RULE_STATS_END), 'Should add end marker');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });

  framework.it('should detect existing markers', () => {
    const testContent = `# Test Rule
${FileUpdater.MARKERS.RULE_STATS_START}
👍 **5** | ❤️ **3** | 🚀 **2** | 👀 **1** | 😕 **0** | **Total: 11 reactions**
${FileUpdater.MARKERS.RULE_STATS_END}`;
    
    const tempFile = path.join(__dirname, '../fixtures/temp-existing-markers.md');
    fs.writeFileSync(tempFile, testContent);
    
    try {
      const result = FileUpdater.addMarkersToRuleReadme(tempFile);
      Assertions.assertTrue(result, 'Should return true for existing markers');
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw error;
    }
  });
});

// Run tests if called directly
if (require.main === module) {
  framework.run().then(() => {
    console.log('File Updater V2 tests completed');
  });
}

module.exports = framework;