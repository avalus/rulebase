/**
 * Template for generating reaction statistics content
 * Provides consistent formatting for reaction data across all files
 */
class ReactionStatsTemplate {
  /**
   * Generate reaction statistics line for rule READMEs
   * @param {Object} reactions - Reaction data object (can use emoji keys or property names)
   * @returns {string} Formatted reaction statistics line
   */
  static generateRuleStats(reactions) {
    // Handle both emoji keys and property names
    const thumbsUp = reactions.thumbsUp || reactions['👍'] || 0;
    const thumbsDown = reactions.thumbsDown || reactions['👎'] || 0;
    const heart = reactions.heart || reactions['❤️'] || 0;
    const rocket = reactions.rocket || reactions['🚀'] || 0;
    const eyes = reactions.eyes || reactions['👀'] || 0;
    const confused = reactions.confused || reactions['😕'] || 0;
    const laugh = reactions.laugh || reactions['😄'] || 0;
    const hooray = reactions.hooray || reactions['🎉'] || 0;
    const total = reactions.total || (thumbsUp + thumbsDown + heart + rocket + eyes + confused + laugh + hooray);
    
    return `👍 **${thumbsUp}** | 👎 **${thumbsDown}** | ❤️ **${heart}** | 🚀 **${rocket}** | 👀 **${eyes}** | 😕 **${confused}** | 😄 **${laugh}** | 🎉 **${hooray}** | **Total: ${total} reactions**`;
  }

  /**
   * Generate reaction statistics for Hall of Fame entries
   * @param {Object} reactions - Reaction data object (can use emoji keys or property names)
   * @returns {string} Formatted reaction statistics for Hall of Fame
   */
  static generateHallOfFameStats(reactions) {
    // Handle both emoji keys and property names
    const thumbsUp = reactions.thumbsUp || reactions['👍'] || 0;
    const thumbsDown = reactions.thumbsDown || reactions['👎'] || 0;
    const heart = reactions.heart || reactions['❤️'] || 0;
    const rocket = reactions.rocket || reactions['🚀'] || 0;
    const eyes = reactions.eyes || reactions['👀'] || 0;
    const confused = reactions.confused || reactions['😕'] || 0;
    const laugh = reactions.laugh || reactions['😄'] || 0;
    const hooray = reactions.hooray || reactions['🎉'] || 0;
    const total = reactions.total || (thumbsUp + thumbsDown + heart + rocket + eyes + confused + laugh + hooray);
    
    return `- 👍 **${thumbsUp}** | 👎 **${thumbsDown}** | ❤️ **${heart}** | 🚀 **${rocket}** | 👀 **${eyes}** | 😕 **${confused}** | 😄 **${laugh}** | 🎉 **${hooray}**
- **${total} total community reactions**${total === 0 ? ' - *Help us by sharing your experience!*' : ''}`;
  }

  /**
   * Generate overall statistics summary
   * @param {number} totalReactions - Total reactions across all rules
   * @param {number} avgPositivePercentage - Average positive feedback percentage
   * @returns {Object} Object with formatted statistics
   */
  static generateOverallStats(totalReactions, avgPositivePercentage) {
    return {
      totalReactionsText: `${totalReactions.toLocaleString()}+ total community reactions`,
      avgFeedbackText: `${avgPositivePercentage}% average positive feedback`
    };
  }

  /**
   * Validate reaction data structure
   * @param {Object} reactions - Reaction data to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static validateReactionData(reactions) {
    if (!reactions || typeof reactions !== 'object') {
      return false;
    }
    
    // Check if it has either emoji keys or property names
    const hasEmojiKeys = ['👍', '👎', '❤️', '🚀', '👀', '😕', '😄', '🎉'].some(emoji => reactions.hasOwnProperty(emoji));
    const hasPropertyNames = ['thumbsUp', 'thumbsDown', 'heart', 'rocket', 'eyes', 'confused', 'laugh', 'hooray'].some(prop => reactions.hasOwnProperty(prop));
    
    return hasEmojiKeys || hasPropertyNames;
  }
}

module.exports = { ReactionStatsTemplate };