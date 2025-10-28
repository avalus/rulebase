#!/usr/bin/env node

/**
 * Local Test Script for GitHub Workflow Logic
 * This script tests the core functionality without GitHub Actions
 */

const fs = require('fs');
const path = require('path');

// Mock Octokit for local testing
class MockOctokit {
  constructor() {
    this.rest = {
      search: {
        issuesAndPullRequests: async (params) => {
          console.log(`🔍 Mock API: Searching for "${params.q}"`);
          // Return mock data for testing
          return {
            data: {
              items: [
                {
                  number: 123,
                  title: "Test issue mentioning smart-code-reviewer",
                  reactions: {
                    '+1': 5,
                    '-1': 1,
                    'laugh': 0,
                    'hooray': 2,
                    'confused': 0,
                    'heart': 3,
                    'rocket': 1,
                    'eyes': 2
                  }
                }
              ]
            }
          };
        }
      },
      issues: {
        listComments: async () => ({
          data: [
            {
              reactions: {
                '+1': 2,
                'heart': 1,
                'rocket': 0,
                'eyes': 1,
                'confused': 0
              }
            }
          ]
        })
      },
      pulls: {
        listReviewComments: async () => ({ data: [] }),
        list: async () => ({ data: [] })
      }
    };
  }
}

// Test environment setup
process.env.GITHUB_TOKEN = 'mock-token-for-testing';
process.env.GITHUB_REPOSITORY = 'testuser/rulebase';

const octokit = new MockOctokit();

// Copy the core functions from the workflow
async function rateLimitDelay(callCount) {
  const maxCallsPerMinute = 50;
  if (callCount > 0 && callCount % maxCallsPerMinute === 0) {
    const delayMs = 60000; // 1 minute
    console.log(`⏳ Rate limit delay: ${delayMs/1000}s (after ${callCount} calls)`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

async function getRuleReactions(ruleName) {
  console.log(`\n📊 Getting reactions for rule: ${ruleName}`);
  
  try {
    const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    
    let totalReactions = {
      thumbsUp: 0,
      thumbsDown: 0,
      laugh: 0,
      hooray: 0,
      confused: 0,
      heart: 0,
      rocket: 0,
      eyes: 0
    };

    // Search for issues and PRs mentioning the rule
    const searchQuery = `repo:${owner}/${repo} "${ruleName}" in:title,body`;
    console.log(`🔍 Search query: ${searchQuery}`);
    
    const searchResults = await octokit.rest.search.issuesAndPullRequests({
      q: searchQuery,
      sort: 'updated',
      order: 'desc',
      per_page: 30
    });

    console.log(`📝 Found ${searchResults.data.items.length} items`);

    for (const item of searchResults.data.items) {
      console.log(`  - ${item.title} (#${item.number})`);
      
      // Add reactions from the item itself
      if (item.reactions) {
        totalReactions.thumbsUp += item.reactions['+1'] || 0;
        totalReactions.thumbsDown += item.reactions['-1'] || 0;
        totalReactions.laugh += item.reactions['laugh'] || 0;
        totalReactions.hooray += item.reactions['hooray'] || 0;
        totalReactions.confused += item.reactions['confused'] || 0;
        totalReactions.heart += item.reactions['heart'] || 0;
        totalReactions.rocket += item.reactions['rocket'] || 0;
        totalReactions.eyes += item.reactions['eyes'] || 0;
      }

      // Get comments for this item
      try {
        const comments = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: item.number,
          per_page: 100
        });

        for (const comment of comments.data) {
          if (comment.reactions) {
            totalReactions.thumbsUp += comment.reactions['+1'] || 0;
            totalReactions.thumbsDown += comment.reactions['-1'] || 0;
            totalReactions.laugh += comment.reactions['laugh'] || 0;
            totalReactions.hooray += comment.reactions['hooray'] || 0;
            totalReactions.confused += comment.reactions['confused'] || 0;
            totalReactions.heart += comment.reactions['heart'] || 0;
            totalReactions.rocket += comment.reactions['rocket'] || 0;
            totalReactions.eyes += comment.reactions['eyes'] || 0;
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Could not fetch comments: ${error.message}`);
      }
    }

    console.log(`✅ Total reactions collected:`, totalReactions);
    return totalReactions;

  } catch (error) {
    console.error(`❌ Error fetching reactions for ${ruleName}:`, error.message);
    return {
      thumbsUp: 0, thumbsDown: 0, laugh: 0, hooray: 0,
      confused: 0, heart: 0, rocket: 0, eyes: 0
    };
  }
}

function calculateQualityScore(reactions) {
  const weights = {
    thumbsUp: 1.0,
    heart: 1.2,
    rocket: 1.5,
    eyes: 0.8,
    confused: -0.3
  };

  const positiveScore = 
    (reactions.thumbsUp * weights.thumbsUp) +
    (reactions.heart * weights.heart) +
    (reactions.rocket * weights.rocket) +
    (reactions.eyes * weights.eyes);

  const negativeScore = 
    (reactions.thumbsDown * 1.0) +
    (reactions.confused * Math.abs(weights.confused));

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  
  if (totalReactions === 0) return 0;

  const rawScore = Math.max(0, positiveScore - negativeScore);
  const normalizedScore = Math.min(100, (rawScore / totalReactions) * 20);
  
  return Math.round(normalizedScore * 10) / 10;
}

function getStarRating(score) {
  if (score >= 90) return '⭐⭐⭐⭐⭐';
  if (score >= 75) return '⭐⭐⭐⭐';
  if (score >= 60) return '⭐⭐⭐';
  if (score >= 40) return '⭐⭐';
  if (score >= 20) return '⭐';
  return '';
}

function getTier(score, totalReactions) {
  if (score >= 80 && totalReactions >= 20) return 'Gold';
  if (score >= 65 && totalReactions >= 10) return 'Silver';
  if (score >= 50 && totalReactions >= 5) return 'Bronze';
  if (totalReactions >= 3) return 'Rising Star';
  return 'Unrated';
}

// Main test function
async function testWorkflow() {
  console.log('🚀 Starting Local Workflow Test\n');
  
  // Test with existing rules
  const rulesDir = path.join(__dirname, 'rules');
  
  if (!fs.existsSync(rulesDir)) {
    console.log('❌ Rules directory not found. Make sure you run this from the project root.');
    return;
  }

  const testRules = [];
  
  // Scan for rules
  function scanDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const ruleName = prefix ? `${prefix}/${item}` : item;
        testRules.push(ruleName);
        scanDirectory(itemPath, ruleName);
      }
    }
  }
  
  scanDirectory(rulesDir);
  
  console.log(`📋 Found ${testRules.length} rules to test:`);
  testRules.forEach(rule => console.log(`  - ${rule}`));
  
  console.log('\n' + '='.repeat(50));
  
  // Test each rule
  for (const ruleName of testRules.slice(0, 2)) { // Test first 2 rules
    const reactions = await getRuleReactions(ruleName);
    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
    const positiveReactions = reactions.thumbsUp + reactions.heart + reactions.rocket + reactions.eyes;
    const positivePercentage = totalReactions > 0 ? Math.round((positiveReactions / totalReactions) * 100) : 0;
    const qualityScore = calculateQualityScore(reactions);
    const starRating = getStarRating(qualityScore);
    const tier = getTier(qualityScore, totalReactions);
    
    console.log(`\n📊 Results for "${ruleName}":`);
    console.log(`   Total Reactions: ${totalReactions}`);
    console.log(`   Positive %: ${positivePercentage}%`);
    console.log(`   Quality Score: ${qualityScore}/100`);
    console.log(`   Star Rating: ${starRating}`);
    console.log(`   Tier: ${tier}`);
    console.log('   ' + '-'.repeat(30));
  }
  
  console.log('\n✅ Local test completed!');
  console.log('\n💡 To test with real data, set a real GITHUB_TOKEN environment variable');
}

// Run the test
if (require.main === module) {
  testWorkflow().catch(console.error);
}

module.exports = { getRuleReactions, calculateQualityScore, getStarRating, getTier };