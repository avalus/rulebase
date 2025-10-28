#!/usr/bin/env node

/**
 * Test script to verify fallback values and pattern matching work correctly
 */

const fs = require('fs');

// Test the fallback values logic
function testFallbackValues() {
  console.log('🧪 Testing Fallback Values Logic\n');
  
  // Simulate the fallback values from the workflow
  const fallbackValues = {
    'coding/smart-code-reviewer': {
      thumbsUp: 847, heart: 234, rocket: 156, eyes: 45, confused: 12,
      total: 1294, positivePercentage: 96
    },
    'content/technical-writer': {
      thumbsUp: 723, heart: 189, rocket: 134, eyes: 67, confused: 8,
      total: 1121, positivePercentage: 98
    },
    'data-analysis/insights-generator': {
      thumbsUp: 612, heart: 167, rocket: 98, eyes: 89, confused: 15,
      total: 981, positivePercentage: 98
    }
  };
  
  // Test each rule key
  const testRules = ['coding/smart-code-reviewer', 'content/technical-writer', 'data-analysis/insights-generator'];
  
  testRules.forEach(ruleKey => {
    const filePath = `rules/${ruleKey}/README.md`;
    const ruleKeyFromPath = filePath.replace('rules/', '').replace('/README.md', '');
    const fallback = fallbackValues[ruleKeyFromPath];
    
    console.log(`📋 Rule: ${ruleKey}`);
    console.log(`   File Path: ${filePath}`);
    console.log(`   Rule Key: ${ruleKeyFromPath}`);
    console.log(`   Fallback Found: ${fallback ? '✅' : '❌'}`);
    if (fallback) {
      console.log(`   Values: 👍 ${fallback.thumbsUp} | ❤️ ${fallback.heart} | 🚀 ${fallback.rocket} | 👀 ${fallback.eyes} | 😕 ${fallback.confused}`);
      console.log(`   Total: ${fallback.total} | Positive: ${fallback.positivePercentage}%`);
    }
    console.log('');
  });
}

// Test the regex pattern matching
function testPatternMatching() {
  console.log('🔍 Testing Pattern Matching Logic\n');
  
  // Read the current HALL_OF_FAME.md
  if (!fs.existsSync('HALL_OF_FAME.md')) {
    console.log('❌ HALL_OF_FAME.md not found');
    return;
  }
  
  const hallOfFameContent = fs.readFileSync('HALL_OF_FAME.md', 'utf8');
  
  console.log('📋 Testing simplified patterns:\n');
  
  // Test reaction pattern: - 👍 **847** | ❤️ **234** | 🚀 **156** | 👀 **45** | 😕 **12**
  const reactionPattern = new RegExp(
    `(- 👍 \\*\\*)(\\d+)(\\*\\* \\| ❤️ \\*\\*)(\\d+)(\\*\\* \\| 🚀 \\*\\*)(\\d+)(\\*\\* \\| 👀 \\*\\*)(\\d+)(\\*\\* \\| 😕 \\*\\*)(\\d+)(\\*\\*)`,
    'g'
  );
  
  let match;
  let reactionMatches = 0;
  while ((match = reactionPattern.exec(hallOfFameContent)) !== null) {
    reactionMatches++;
    console.log(`   ✅ Reaction pattern match ${reactionMatches}:`);
    console.log(`      👍 ${match[2]} | ❤️ ${match[4]} | 🚀 ${match[6]} | 👀 ${match[8]} | 😕 ${match[10]}`);
  }
  
  if (reactionMatches === 0) {
    console.log('   ❌ No reaction patterns matched');
  }
  
  // Test total reactions pattern: - **1,294 total community reactions** with 96% positive feedback
  const totalReactionsPattern = new RegExp(
    `(- \\*\\*)(\\d+,?\\d*)(\\s+total community reactions\\*\\* with )(\\d+)(% positive feedback)`,
    'g'
  );
  
  let totalMatches = 0;
  while ((match = totalReactionsPattern.exec(hallOfFameContent)) !== null) {
    totalMatches++;
    console.log(`   ✅ Total reactions pattern match ${totalMatches}:`);
    console.log(`      Total: ${match[2]} | Positive: ${match[4]}%`);
  }
  
  if (totalMatches === 0) {
    console.log('   ❌ No total reactions patterns matched');
  }
  
  // Test score pattern: **Score:** 847 points
  const scorePattern = new RegExp(
    `(\\*\\*Score:\\*\\* )(\\d+)( points)`,
    'g'
  );
  
  let scoreMatches = 0;
  while ((match = scorePattern.exec(hallOfFameContent)) !== null) {
    scoreMatches++;
    console.log(`   ✅ Score pattern match ${scoreMatches}:`);
    console.log(`      Score: ${match[2]} points`);
  }
  
  if (scoreMatches === 0) {
    console.log('   ❌ No score patterns matched');
  }
  
  console.log(`\n📊 Summary: ${reactionMatches} reaction matches, ${totalMatches} total matches, ${scoreMatches} score matches`);
}

// Run tests
console.log('🚀 Testing Workflow Updates\n');
testFallbackValues();
testPatternMatching();
console.log('✅ Test completed!');