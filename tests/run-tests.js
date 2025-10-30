#!/usr/bin/env node

/**
 * Cross-Platform Test Runner
 * Replaces test-workflow.bat with a Node.js-based solution
 * Supports running individual test suites or all tests
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

class TestRunner {
  constructor() {
    this.testDir = __dirname;
    this.rootDir = path.dirname(this.testDir);
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      suites: [],
      startTime: null,
      endTime: null
    };
    this.verbose = false;
    this.failFast = false;
    this.pattern = null;
  }

  /**
   * Parse command line arguments
   */
  parseArgs() {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--verbose':
        case '-v':
          this.verbose = true;
          break;
        case '--fail-fast':
        case '-f':
          this.failFast = true;
          break;
        case '--pattern':
        case '-p':
          this.pattern = args[++i];
          break;
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
          break;
        case '--unit':
          this.pattern = 'unit';
          break;
        case '--integration':
          this.pattern = 'integration';
          break;
        case '--e2e':
          this.pattern = 'e2e';
          break;
        default:
          if (arg.startsWith('-')) {
            console.error(`Unknown option: ${arg}`);
            process.exit(1);
          }
          // Treat as test file pattern
          this.pattern = arg;
      }
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
Rulebase Test Runner

Usage: node run-tests.js [options] [pattern]

Options:
  -v, --verbose     Show detailed output
  -f, --fail-fast   Stop on first failure
  -p, --pattern     Run tests matching pattern
  -h, --help        Show this help message

Shortcuts:
  --unit           Run only unit tests
  --integration    Run only integration tests
  --e2e            Run only end-to-end tests

Examples:
  node run-tests.js                    # Run all tests
  node run-tests.js --unit             # Run only unit tests
  node run-tests.js --pattern github   # Run tests matching 'github'
  node run-tests.js -v -f              # Verbose output, fail fast
  node run-tests.js unit/github-api    # Run specific test file
    `);
  }

  /**
   * Check if Node.js and dependencies are available
   */
  async checkPrerequisites() {
    this.log('Checking prerequisites...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 14) {
      throw new Error(`Node.js 14+ required, found ${nodeVersion}`);
    }
    
    this.log(`✓ Node.js ${nodeVersion}`);
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(this.rootDir, 'node_modules');
    try {
      await fs.access(nodeModulesPath);
      this.log('✓ node_modules found');
    } catch (error) {
      throw new Error('node_modules not found. Run "npm install" first.');
    }
    
    // Check if source files exist
    const srcPath = path.join(this.rootDir, 'src');
    try {
      await fs.access(srcPath);
      this.log('✓ Source directory found');
    } catch (error) {
      throw new Error('Source directory not found');
    }
  }

  /**
   * Discover test files
   */
  async discoverTests() {
    this.log('Discovering test files...');
    
    const testFiles = [];
    const testDirs = ['unit', 'integration', 'e2e'];
    
    for (const dir of testDirs) {
      const dirPath = path.join(this.testDir, dir);
      
      try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.test.js')) {
            const filePath = path.join(dirPath, file);
            const relativePath = path.relative(this.testDir, filePath);
            
            // Apply pattern filter if specified
            if (this.pattern) {
              if (!relativePath.includes(this.pattern) && !file.includes(this.pattern)) {
                continue;
              }
            }
            
            testFiles.push({
              name: file.replace('.test.js', ''),
              path: filePath,
              relativePath: relativePath,
              category: dir
            });
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
        this.log(`Directory ${dir} not found, skipping`);
      }
    }
    
    if (testFiles.length === 0) {
      throw new Error(`No test files found${this.pattern ? ` matching pattern: ${this.pattern}` : ''}`);
    }
    
    this.log(`Found ${testFiles.length} test file(s)`);
    return testFiles;
  }

  /**
   * Run a single test file
   */
  async runTestFile(testFile) {
    this.log(`\n${'='.repeat(60)}`);
    this.log(`Running: ${testFile.relativePath}`);
    this.log(`${'='.repeat(60)}`);
    
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const child = spawn('node', [testFile.path], {
        cwd: this.rootDir,
        stdio: this.verbose ? 'inherit' : 'pipe',
        env: { ...process.env, NODE_ENV: 'test' }
      });
      
      let stdout = '';
      let stderr = '';
      
      if (!this.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }
      
      child.on('close', (code) => {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        const result = {
          name: testFile.name,
          category: testFile.category,
          path: testFile.relativePath,
          passed: code === 0,
          exitCode: code,
          duration: duration,
          stdout: stdout,
          stderr: stderr
        };
        
        if (result.passed) {
          this.log(`✓ ${testFile.name} (${duration}ms)`);
          this.results.passed++;
        } else {
          this.log(`✗ ${testFile.name} (${duration}ms) - Exit code: ${code}`);
          this.results.failed++;
          
          if (!this.verbose && (stdout || stderr)) {
            console.log('\nOutput:');
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
          }
        }
        
        this.results.total++;
        this.results.suites.push(result);
        
        resolve(result);
      });
      
      child.on('error', (error) => {
        const result = {
          name: testFile.name,
          category: testFile.category,
          path: testFile.relativePath,
          passed: false,
          error: error.message,
          duration: 0
        };
        
        this.log(`✗ ${testFile.name} - Error: ${error.message}`);
        this.results.failed++;
        this.results.total++;
        this.results.suites.push(result);
        
        resolve(result);
      });
    });
  }

  /**
   * Run all discovered tests
   */
  async runTests() {
    const testFiles = await this.discoverTests();
    
    this.results.startTime = new Date();
    
    for (const testFile of testFiles) {
      const result = await this.runTestFile(testFile);
      
      // Fail fast if requested and test failed
      if (this.failFast && !result.passed) {
        this.log('\nFail-fast enabled, stopping on first failure');
        break;
      }
    }
    
    this.results.endTime = new Date();
  }

  /**
   * Print test summary
   */
  printSummary() {
    const duration = this.results.endTime - this.results.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    
    // Overall results
    console.log(`\nTotal Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Duration: ${Math.round(duration)}ms`);
    
    // Results by category
    const categories = {};
    this.results.suites.forEach(suite => {
      if (!categories[suite.category]) {
        categories[suite.category] = { passed: 0, failed: 0, total: 0 };
      }
      categories[suite.category].total++;
      if (suite.passed) {
        categories[suite.category].passed++;
      } else {
        categories[suite.category].failed++;
      }
    });
    
    console.log('\nResults by Category:');
    Object.entries(categories).forEach(([category, stats]) => {
      const status = stats.failed === 0 ? '✓' : '✗';
      console.log(`  ${status} ${category}: ${stats.passed}/${stats.total} passed`);
    });
    
    // Failed tests details
    const failedTests = this.results.suites.filter(suite => !suite.passed);
    if (failedTests.length > 0) {
      console.log('\nFailed Tests:');
      failedTests.forEach(test => {
        console.log(`  ✗ ${test.path} (${test.exitCode || 'error'})`);
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        }
      });
    }
    
    // Performance summary
    const avgDuration = Math.round(
      this.results.suites.reduce((sum, suite) => sum + (suite.duration || 0), 0) / 
      this.results.suites.length
    );
    const slowestTest = this.results.suites.reduce((slowest, suite) => 
      (suite.duration || 0) > (slowest.duration || 0) ? suite : slowest
    );
    
    console.log(`\nPerformance:`);
    console.log(`  Average test duration: ${avgDuration}ms`);
    console.log(`  Slowest test: ${slowestTest.name} (${slowestTest.duration || 0}ms)`);
    
    // Final status
    console.log('\n' + '='.repeat(80));
    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('='.repeat(80));
    } else {
      console.log(`❌ ${this.results.failed} TEST(S) FAILED`);
      console.log('='.repeat(80));
      console.log('\nNext steps:');
      console.log('1. Review the failed test output above');
      console.log('2. Fix the issues in your code');
      console.log('3. Run the tests again');
      console.log('\nTo run only failed tests:');
      failedTests.forEach(test => {
        console.log(`  node run-tests.js ${test.name}`);
      });
    }
  }

  /**
   * Generate test report
   */
  async generateReport() {
    const reportPath = path.join(this.testDir, 'test-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        duration: this.results.endTime - this.results.startTime
      },
      suites: this.results.suites,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`\nTest report saved to: ${reportPath}`);
  }

  /**
   * Log message if verbose mode is enabled
   */
  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      console.log('🧪 Rulebase Test Runner');
      console.log('='.repeat(40));
      
      this.parseArgs();
      await this.checkPrerequisites();
      await this.runTests();
      this.printSummary();
      await this.generateReport();
      
      // Exit with appropriate code
      process.exit(this.results.failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      
      if (this.verbose) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run();
}

module.exports = TestRunner;