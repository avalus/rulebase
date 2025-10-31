# AI Agent Rules: Best Practices Guide

This guide provides comprehensive best practices for creating, combining, and maintaining AI agent rules. It covers how to take general rules and adapt them with project-specific requirements to create effective, maintainable rule systems.

## Table of Contents

1. [Rule Design Principles](#rule-design-principles)
2. [Combining General and Project-Specific Rules](#combining-general-and-project-specific-rules)
3. [Rule Architecture Patterns](#rule-architecture-patterns)
4. [Implementation Best Practices](#implementation-best-practices)
5. [Testing and Validation](#testing-and-validation)
6. [Maintenance and Evolution](#maintenance-and-evolution)
7. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)

## Rule Design Principles

### 1. Atomic and Focused Rules
- **One responsibility per rule**: Each rule should address a single concern or behavior
- **Clear scope definition**: Explicitly state what phases of the agent loop the rule applies to
- **Measurable outcomes**: Rules should have clear success/failure criteria

```markdown
# Good: Atomic rule
## Code Safety - File System Access
Scope: tool_use
- Only allow file operations within project directories
- Block access to system directories (/etc, /sys, C:\Windows)

# Bad: Multiple concerns in one rule
## General Development Rules
- Only edit project files AND use proper commit messages AND run tests
```

### 2. Hierarchical Rule Structure
Organize rules from general to specific:
- **Universal rules**: Apply to all agents (security, safety)
- **Domain rules**: Apply to specific domains (coding, support, analysis)
- **Project rules**: Apply to specific projects or contexts
- **Instance rules**: Apply to individual agent instances

### 3. Clear Action Semantics
Use consistent action types across your rule system:
- **BLOCK**: Prevent action entirely
- **REQUIRE**: Add mandatory prerequisites
- **PREFER**: Bias toward certain options
- **TRANSFORM**: Modify inputs/outputs
- **MONITOR**: Allow but log for review
- **VALIDATE**: Check conditions before proceeding

## Combining General and Project-Specific Rules

### Layered Rule Application

```markdown
# Layer 1: Universal Security Rules (applies to all agents)
## Security - Credential Protection
Scope: planning, tool_use, output
- BLOCK: Never log, display, or store credentials
- TRANSFORM: Mask sensitive data in outputs
- REQUIRE: Approval for external API calls

# Layer 2: Domain Rules (applies to coding agents)
## Coding - Quality Standards
Scope: execution, output
- REQUIRE: Tests for new functionality
- PREFER: Existing patterns and libraries
- VALIDATE: Code style compliance

# Layer 3: Project Rules (specific to this codebase)
## Project - Rulebase Contribution Standards
Scope: planning, execution
- REQUIRE: Update HALL_OF_FAME.md for new popular rules
- PREFER: Markdown format for rule documentation
- VALIDATE: Rule examples include scope and policies sections
```

### Rule Inheritance and Overrides

```markdown
# Base Rule: General File Operations
## File Operations - Safety Base
Scope: tool_use
- BLOCK: Operations outside allowed directories
- REQUIRE: Backup before destructive operations

# Project Override: Specific Directory Structure
## File Operations - Rulebase Project
Inherits: File Operations - Safety Base
Scope: tool_use
- ALLOW: Operations in ./rules/, ./src/, ./tests/
- BLOCK: Direct edits to README.md (require PR process)
- REQUIRE: Update package.json version for releases
```

### Context-Aware Rule Selection

```markdown
# Environment-Specific Rules
## Development Environment
Scope: all
Conditions: NODE_ENV=development
- ALLOW: Debug logging and verbose output
- PREFER: Local file operations over API calls

## Production Environment  
Scope: all
Conditions: NODE_ENV=production
- BLOCK: Debug information in outputs
- REQUIRE: Approval for any file modifications
- MONITOR: All operations with detailed logging
```

## Rule Architecture Patterns

### 1. Pipeline Pattern
Rules that work together in sequence:

```markdown
# Step 1: Input Validation
## Input Sanitization
Scope: planning
- VALIDATE: Required parameters present
- TRANSFORM: Sanitize user inputs
- BLOCK: Malformed or suspicious requests

# Step 2: Authorization
## Permission Check
Scope: planning
Requires: Input Sanitization
- VALIDATE: User permissions for requested action
- BLOCK: Unauthorized operations

# Step 3: Execution Control
## Safe Execution
Scope: tool_use
Requires: Permission Check
- PREFER: Read-only operations when possible
- REQUIRE: Confirmation for destructive actions
```

### 2. Guard Pattern
Protective rules that wrap other operations:

```markdown
## Resource Protection Guard
Scope: tool_use
Wraps: All file operations
Before:
- VALIDATE: Sufficient disk space
- VALIDATE: File not locked by other processes
After:
- MONITOR: Log operation results
- VALIDATE: Operation completed successfully
```

### 3. Strategy Pattern
Alternative rule sets for different scenarios:

```markdown
## Code Review Strategy - Strict
Conditions: production_branch=true
- REQUIRE: Two approvals for any changes
- BLOCK: Direct commits to main branch
- REQUIRE: Full test suite execution

## Code Review Strategy - Relaxed  
Conditions: feature_branch=true
- REQUIRE: One approval for changes
- ALLOW: Direct commits with proper commit message
- PREFER: Test execution (not required)
```

## Implementation Best Practices

### 1. Rule Documentation Standards

```markdown
# Template for Rule Documentation
## Rule Name - Brief Description
**Scope**: [planning|tool_use|execution|output]
**Priority**: [high|medium|low]
**Conditions**: [when this rule applies]
**Dependencies**: [other rules this depends on]

**Policies**:
- ACTION_TYPE: Clear description of what happens
- ACTION_TYPE: Another policy with specific conditions

**Examples**:
- ✅ Good: [example of compliant behavior]
- ❌ Bad: [example of non-compliant behavior]

**Rationale**: Why this rule exists and what problems it solves
**Last Updated**: [date]
**Version**: [semantic version]
```

### 2. Rule Versioning and Evolution

```markdown
# Version Control for Rules
## Rule Versioning Strategy
- Use semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking changes to rule behavior
- MINOR: New functionality or enhanced policies
- PATCH: Bug fixes or clarifications

## Backward Compatibility
- Maintain deprecated rules for transition periods
- Provide migration guides for breaking changes
- Use feature flags for gradual rule rollouts
```

### 3. Configuration Management

```yaml
# rules-config.yml
rule_sets:
  universal:
    - security-credentials
    - safety-file-operations
  
  domain_coding:
    - code-quality-standards
    - test-requirements
    
  project_rulebase:
    - contribution-standards
    - documentation-format

environments:
  development:
    strict_mode: false
    debug_logging: true
    
  production:
    strict_mode: true
    audit_logging: true
```

## Testing and Validation

### 1. Rule Testing Framework

```markdown
## Rule Test Template
### Test: [Rule Name] - [Scenario]
**Setup**: Initial conditions and context
**Input**: Agent request or action
**Expected**: Rule should [BLOCK|REQUIRE|PREFER|etc.]
**Actual**: What actually happened
**Status**: [PASS|FAIL|SKIP]

### Example Test Cases
#### Test: Code Safety - Block System Directory Access
**Setup**: Agent in coding mode, file operation requested
**Input**: Request to edit /etc/passwd
**Expected**: Rule should BLOCK with security violation message
**Actual**: Operation blocked, appropriate error message shown
**Status**: PASS
```

### 2. Validation Checklist

Before deploying rules, verify:
- [ ] Rule syntax is valid and parseable
- [ ] All dependencies are available
- [ ] Conditions are testable and deterministic
- [ ] Actions are clearly defined and implementable
- [ ] Documentation is complete and accurate
- [ ] Test cases cover normal and edge cases
- [ ] Performance impact is acceptable
- [ ] Security implications are reviewed

## Maintenance and Evolution

### 1. Rule Lifecycle Management

```markdown
## Rule Lifecycle Stages
1. **Draft**: Initial rule creation and design
2. **Review**: Community or team review process
3. **Testing**: Validation in controlled environment
4. **Active**: Deployed and enforced
5. **Deprecated**: Marked for removal, still functional
6. **Retired**: No longer active, kept for reference
```

### 2. Monitoring and Metrics

Track rule effectiveness:
- **Activation Rate**: How often rules trigger
- **Success Rate**: Percentage of successful rule applications
- **Override Rate**: How often rules are bypassed
- **Error Rate**: Rule failures or misconfigurations
- **Performance Impact**: Execution time and resource usage

### 3. Continuous Improvement

```markdown
## Rule Improvement Process
1. **Collect Feedback**: Monitor rule performance and user feedback
2. **Analyze Patterns**: Identify common issues or enhancement opportunities
3. **Propose Changes**: Document proposed improvements with rationale
4. **Test Changes**: Validate improvements in controlled environment
5. **Deploy Gradually**: Roll out changes with monitoring
6. **Document Lessons**: Update best practices based on learnings
```

## Common Pitfalls and Solutions

### 1. Rule Conflicts and Resolution

**Problem**: Multiple rules with conflicting actions
```markdown
# Conflicting Rules Example
Rule A: REQUIRE approval for file changes
Rule B: ALLOW direct edits in development mode
```

**Solution**: Use priority and specificity
```markdown
# Resolution Strategy
## Rule Priority System
1. BLOCK actions always take precedence
2. More specific conditions override general ones
3. Explicit priorities when conflicts are expected

## Example Resolution
Rule A (Priority: High, Scope: production): REQUIRE approval
Rule B (Priority: Medium, Scope: development): ALLOW direct edits
Result: In production, require approval; in development, allow direct edits
```

### 2. Over-Engineering Rules

**Problem**: Rules that are too complex or granular
**Solution**: Start simple and evolve based on real needs

```markdown
# Good: Simple, clear rule
## Code Quality - Basic Standards
- REQUIRE: Tests for new functions
- PREFER: Existing code patterns

# Bad: Over-engineered rule
## Code Quality - Comprehensive Analysis
- REQUIRE: 90% test coverage with branch analysis
- VALIDATE: Cyclomatic complexity < 10 per function
- ANALYZE: Code duplication with AST parsing
- ENFORCE: Specific naming conventions with regex patterns
```

### 3. Rule Maintenance Debt

**Problem**: Rules become outdated or inconsistent over time
**Solution**: Regular review and maintenance cycles

```markdown
## Rule Maintenance Schedule
- **Weekly**: Monitor rule performance metrics
- **Monthly**: Review rule activation patterns and feedback
- **Quarterly**: Comprehensive rule audit and cleanup
- **Annually**: Major rule architecture review
```

## Conclusion

Effective AI agent rules require careful balance between flexibility and control. By following these best practices, you can create rule systems that:

- Scale from simple projects to complex enterprise environments
- Maintain consistency while allowing necessary customization
- Evolve gracefully as requirements change
- Provide clear value to development teams

Remember: Rules should enhance agent capabilities, not hinder them. Start with essential safety and quality rules, then gradually add sophistication based on real-world usage patterns and feedback.

---

*This guide is a living document. Contribute improvements and share your experiences with the community to help refine these best practices.*