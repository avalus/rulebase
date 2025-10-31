const fs = require('fs');
const path = require('path');
const { ReactionStatsTemplate } = require('./reaction-stats-template');

class FileUpdater {
  // Marker constants
  static MARKERS = {
    RULE_STATS_START: '<!-- STATS_START -->',
    RULE_STATS_END: '<!-- STATS_END -->',
    HALL_RULE_START: (ruleKey) => `<!-- RULE_STATS_START:${ruleKey} -->`,
    HALL_RULE_END: (ruleKey) => `<!-- RULE_STATS_END:${ruleKey} -->`,
    OVERALL_TOTAL_START: '<!-- OVERALL_TOTAL_START -->',
    OVERALL_TOTAL_END: '<!-- OVERALL_TOTAL_END -->',
    OVERALL_FEEDBACK_START: '<!-- OVERALL_FEEDBACK_START -->',
    OVERALL_FEEDBACK_END: '<!-- OVERALL_FEEDBACK_END -->'
  };

  /**
   * Update individual rule README with reaction statistics using markers
   * @param {string} rulePath - Path to the rule README file
   * @param {Object} reactions - Reaction data object
   * @returns {boolean} True if update was successful, false otherwise
   */
  static updateRuleReadme(rulePath, reactions) {
    if (!fs.existsSync(rulePath)) {
      console.log(`❌ Rule README not found: ${rulePath}`);
      return false;
    }

    // Validate reaction data
    if (!ReactionStatsTemplate.validateReactionData(reactions)) {
      console.log(`❌ Invalid reaction data for ${rulePath}`);
      return false;
    }

    let content = fs.readFileSync(rulePath, 'utf8');
    
    // Find the stats section between markers
    const startMarker = this.MARKERS.RULE_STATS_START;
    const endMarker = this.MARKERS.RULE_STATS_END;
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.log(`⚠️  No stats markers found in ${rulePath}. Please add ${startMarker} and ${endMarker} around the statistics section.`);
      return false;
    }
    
    // Generate new stats content
    const newStats = ReactionStatsTemplate.generateRuleStats(reactions);
    
    // Replace content between markers
    const before = content.substring(0, startIndex + startMarker.length);
    const after = content.substring(endIndex);
    const newContent = before + '\n' + newStats + '\n' + after;
    
    // Write the updated content
    fs.writeFileSync(rulePath, newContent);
    console.log(`✅ Updated stats in ${path.basename(rulePath)}: ${reactions.total} total reactions`);
    return true;
  }

  /**
   * Update HALL_OF_FAME.md with reaction statistics using markers
   * @param {Object} ruleReactions - Object mapping rule keys to reaction data
   * @param {number} totalReactions - Total reactions across all rules
   * @param {string} [hallOfFamePath='HALL_OF_FAME.md'] - Optional custom path to Hall of Fame file
   * @returns {boolean} True if update was successful, false otherwise
   */
  static updateHallOfFame(ruleReactions, totalReactions, hallOfFamePath = 'HALL_OF_FAME.md') {
    if (!fs.existsSync(hallOfFamePath)) {
      console.log(`❌ ${hallOfFamePath} not found`);
      return false;
    }

    let content = fs.readFileSync(hallOfFamePath, 'utf8');
    let updatedCount = 0;

    // Update individual rule statistics
    for (const [ruleKey, reactions] of Object.entries(ruleReactions)) {
      if (!ReactionStatsTemplate.validateReactionData(reactions)) {
        console.log(`❌ Invalid reaction data for rule ${ruleKey}`);
        continue;
      }

      const startMarker = this.MARKERS.HALL_RULE_START(ruleKey);
      const endMarker = this.MARKERS.HALL_RULE_END(ruleKey);
      
      const startIndex = content.indexOf(startMarker);
      const endIndex = content.indexOf(endMarker);
      
      if (startIndex === -1 || endIndex === -1) {
        console.log(`⚠️  No markers found for rule ${ruleKey} in Hall of Fame`);
        continue;
      }
      
      // Generate new stats content for Hall of Fame
      const newStats = ReactionStatsTemplate.generateHallOfFameStats(reactions);
      
      // Replace content between markers
      const before = content.substring(0, startIndex + startMarker.length);
      const after = content.substring(endIndex);
      content = before + '\n' + newStats + '\n' + after;
      
      updatedCount++;
    }

    // Update overall statistics
    const overallStats = this.updateOverallStatistics(content, ruleReactions, totalReactions);
    if (overallStats) {
      content = overallStats;
    }

    // Write the updated content
    fs.writeFileSync(hallOfFamePath, content);
    console.log(`✅ Updated Hall of Fame: ${updatedCount} rules, ${totalReactions} total reactions`);
    return true;
  }

  /**
   * Update overall statistics in Hall of Fame
   * @param {string} content - Current Hall of Fame content
   * @param {Object} ruleReactions - Rule reactions data
   * @param {number} totalReactions - Total reactions count
   * @returns {string|null} Updated content or null if no updates made
   */
  static updateOverallStatistics(content, ruleReactions, totalReactions) {
    let updatedContent = content;
    let hasUpdates = false;

    // Calculate positive feedback percentage
    let totalPositive = 0;
    let totalAll = 0;
    
    for (const reactions of Object.values(ruleReactions)) {
      totalPositive += reactions.thumbsUp + reactions.heart + reactions.rocket;
      totalAll += reactions.total;
    }
    
    const avgPositivePercentage = totalAll > 0 ? Math.round((totalPositive / totalAll) * 100) : 0;
    const overallStats = ReactionStatsTemplate.generateOverallStats(totalReactions, avgPositivePercentage);

    // Update total reactions
    const totalStartMarker = this.MARKERS.OVERALL_TOTAL_START;
    const totalEndMarker = this.MARKERS.OVERALL_TOTAL_END;
    const totalStartIndex = updatedContent.indexOf(totalStartMarker);
    const totalEndIndex = updatedContent.indexOf(totalEndMarker);
    
    if (totalStartIndex !== -1 && totalEndIndex !== -1) {
      const before = updatedContent.substring(0, totalStartIndex + totalStartMarker.length);
      const after = updatedContent.substring(totalEndIndex);
      updatedContent = before + '\n' + overallStats.totalReactionsText + '\n' + after;
      hasUpdates = true;
    }

    // Update average feedback
    const feedbackStartMarker = this.MARKERS.OVERALL_FEEDBACK_START;
    const feedbackEndMarker = this.MARKERS.OVERALL_FEEDBACK_END;
    const feedbackStartIndex = updatedContent.indexOf(feedbackStartMarker);
    const feedbackEndIndex = updatedContent.indexOf(feedbackEndMarker);
    
    if (feedbackStartIndex !== -1 && feedbackEndIndex !== -1) {
      const before = updatedContent.substring(0, feedbackStartIndex + feedbackStartMarker.length);
      const after = updatedContent.substring(feedbackEndIndex);
      updatedContent = before + '\n' + overallStats.avgFeedbackText + '\n' + after;
      hasUpdates = true;
    }

    return hasUpdates ? updatedContent : null;
  }

  /**
   * Add markers to a rule README file if they don't exist
   * @param {string} rulePath - Path to the rule README file
   * @returns {boolean} True if markers were added or already exist
   */
  static addMarkersToRuleReadme(rulePath) {
    if (!fs.existsSync(rulePath)) {
      console.log(`❌ Rule README not found: ${rulePath}`);
      return false;
    }

    let content = fs.readFileSync(rulePath, 'utf8');
    
    // Check if markers already exist
    if (content.includes(this.MARKERS.RULE_STATS_START) && content.includes(this.MARKERS.RULE_STATS_END)) {
      console.log(`✅ Markers already exist in ${path.basename(rulePath)}`);
      return true;
    }

    // Find the current stats line and wrap it with markers
    const statsLineRegex = /👍 \*\*\d+\*\* \| ❤️ \*\*\d+\*\* \| 🚀 \*\*\d+\*\* \| 👀 \*\*\d+\*\* \| 😕 \*\*\d+\*\* \| \*\*Total: \d+ reactions?\*\*/;
    const match = content.match(statsLineRegex);
    
    if (match) {
      const statsLine = match[0];
      const markedStatsSection = `${this.MARKERS.RULE_STATS_START}\n${statsLine}\n${this.MARKERS.RULE_STATS_END}`;
      content = content.replace(statsLineRegex, markedStatsSection);
      
      fs.writeFileSync(rulePath, content);
      console.log(`✅ Added markers to ${path.basename(rulePath)}`);
      return true;
    } else {
      console.log(`⚠️  Could not find stats line in ${path.basename(rulePath)} to add markers`);
      return false;
    }
  }

  /**
   * Validate that all required markers exist in a file
   * @param {string} filePath - Path to the file to validate
   * @param {string[]} requiredMarkers - Array of required marker pairs
   * @returns {Object} Validation result with success status and missing markers
   */
  static validateMarkers(filePath, requiredMarkers) {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const missingMarkers = [];

    for (const marker of requiredMarkers) {
      if (!content.includes(marker)) {
        missingMarkers.push(marker);
      }
    }

    return {
      success: missingMarkers.length === 0,
      missingMarkers: missingMarkers
    };
  }
}

module.exports = { FileUpdater };