#!/usr/bin/env node

/**
 * Main script for updating Rulebase reaction statistics
 * This script collects reactions and updates individual rule README files
 */

const { GitHubAPI } = require('./src/github-api');
const { ReactionCollector } = require('./src/reaction-collector');
const { RuleScanner } = require('./src/rule-scanner');
const { FileUpdater } = require('./src/file-updater');

async function updateStats() {
  try {
    // Check if running in GitHub Actions environment
    if (!process.env.GITHUB_REPOSITORY) {
      console.log('⚠️  GITHUB_REPOSITORY environment variable not set. Running in local mode.');
      console.log('This script is designed to run in GitHub Actions environment.');
      console.log('For local testing, use the test files instead.');
      return;
    }
    
    const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    
    console.log(`Updating reaction statistics for ${owner}/${repo}`);
    
    // Initialize GitHub API
    const githubAPI = new GitHubAPI(process.env.GITHUB_TOKEN);
    const reactionCollector = new ReactionCollector(githubAPI);
    
    // Get repository statistics
    const { data: repoData } = await githubAPI.getRepository(owner, repo);
    
    // Count rules by scanning directories
    const { totalRules, categories } = RuleScanner.scanRules('./rules');
    console.log(`Found ${totalRules} rules across ${Object.keys(categories).length} categories`);
    
    // Get all rule paths for reaction collection
    const rulePaths = RuleScanner.getAllRulePaths('./rules');
    let ruleReactions = {};
    
    // Collect reactions for each rule
    for (const rulePath of rulePaths) {
      try {
        const ruleKey = RuleScanner.getRuleKeyFromPath(rulePath);
        const reactions = await reactionCollector.getRuleReactions(owner, repo, rulePath);
        ruleReactions[ruleKey] = reactions;
        
        // Update the individual rule README with reactions
        FileUpdater.updateRuleReadme(rulePath, reactions);
        
      } catch (error) {
        console.log(`Could not get reactions for ${rulePath}: ${error.message}`);
        // Use default reaction counts if API fails
        const ruleKey = RuleScanner.getRuleKeyFromPath(rulePath);
        ruleReactions[ruleKey] = {
          thumbsUp: 0, thumbsDown: 0, heart: 0, rocket: 0, eyes: 0, confused: 0, laugh: 0, hooray: 0,
          total: 0, positivePercentage: 0
        };
      }
    }
    
    // Get contributor count
    const { data: contributors } = await githubAPI.getContributors(owner, repo);
    
    // Calculate total reactions across all rules
    const totalReactions = Object.values(ruleReactions).reduce((sum, reactions) => sum + reactions.total, 0);
    
    // Update HALL_OF_FAME.md with reaction statistics
    FileUpdater.updateHallOfFame(ruleReactions, totalReactions);
    
    console.log(`Updated reaction statistics: ${totalRules} rules, ${contributors.length} contributors, ${totalReactions} total reactions`);
    
  } catch (error) {
    console.error('Error updating reaction statistics:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  updateStats,
  GitHubAPI,
  ReactionCollector,
  RuleScanner,
  FileUpdater
};

// Run if called directly
if (require.main === module) {
  updateStats().catch(console.error);
}