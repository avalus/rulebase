const fs = require('fs');
const path = require('path');

/**
 * Rule scanning utilities
 */
class RuleScanner {
  /**
   * Scan rules directory and count rules by category
   */
  static scanRules(rulesDir = './rules') {
    let totalRules = 0;
    let categories = {};
    
    if (!fs.existsSync(rulesDir)) {
      console.log('Rules directory not found:', rulesDir);
      return { totalRules, categories };
    }

    const categoryDirs = fs.readdirSync(rulesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const category of categoryDirs) {
      const categoryPath = path.join(rulesDir, category);
      const ruleDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());
      
      categories[category] = ruleDirs.length;
      totalRules += ruleDirs.length;
    }

    return { totalRules, categories };
  }

  /**
   * Get all rule paths for reaction collection
   */
  static getAllRulePaths(rulesDir = './rules') {
    const rulePaths = [];
    
    if (!fs.existsSync(rulesDir)) {
      return rulePaths;
    }

    const categoryDirs = fs.readdirSync(rulesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const category of categoryDirs) {
      const categoryPath = path.join(rulesDir, category);
      const ruleDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());
      
      for (const ruleDir of ruleDirs) {
        const rulePath = path.join(categoryPath, ruleDir.name, 'README.md');
        if (fs.existsSync(rulePath)) {
          rulePaths.push(`rules/${category}/${ruleDir.name}/README.md`);
        }
      }
    }

    return rulePaths;
  }

  /**
   * Get rule key from file path
   */
  static getRuleKeyFromPath(filePath) {
    return filePath.replace('rules/', '').replace('/README.md', '');
  }

  /**
   * Check if a rule directory exists
   */
  static ruleExists(ruleKey, rulesDir = './rules') {
    const rulePath = path.join(rulesDir, ruleKey, 'README.md');
    return fs.existsSync(rulePath);
  }
}

module.exports = { RuleScanner };