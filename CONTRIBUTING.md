# Contributing to RuleBase

Thank you for your interest in contributing to RuleBase! 🎉 This guide will help you understand how to contribute AI agent rules, improve existing ones, and help build the best community hub for AI workflows.

## 🌟 Ways to Contribute

### 1. Submit New Rules
Share your proven AI agent rules with the community:
- **Original Rules** - Rules you've created and tested
- **Adapted Rules** - Improvements on existing concepts
- **Industry-Specific Rules** - Domain-specific workflows

### 2. Improve Existing Rules
Help make existing rules better:
- **Bug Fixes** - Fix issues in rule configurations
- **Documentation** - Improve README files and examples
- **Performance** - Optimize rule efficiency
- **Features** - Add new capabilities to existing rules

### 3. Community Support
Help other contributors:
- **Review Pull Requests** - Provide feedback on submissions
- **Answer Questions** - Help in GitHub Discussions
- **Rate Rules** - Use GitHub reactions to rate rule quality
- **Share Feedback** - Report issues and suggest improvements

## 📋 Submission Guidelines

### Rule Quality Standards

Before submitting a rule, ensure it meets these criteria:

✅ **Functionality**
- Rule works as described
- Includes proper error handling
- Has been tested in real scenarios
- Provides clear, actionable outputs

✅ **Documentation**
- Complete README with examples
- Clear installation instructions
- Usage examples and configuration options
- Proper metadata and versioning

✅ **Structure**
- Follows the standard rule format
- Includes both YAML configuration and README
- Proper file organization
- Consistent naming conventions

✅ **Originality**
- Adds unique value to the community
- Not a duplicate of existing rules
- Includes proper attribution if based on other work

### Rule Categories

Choose the appropriate category for your rule:

- **`coding/`** - Development workflows, code review, debugging
- **`content/`** - Writing, documentation, creative content
- **`data-analysis/`** - Data processing, insights, reporting
- **`customer-support/`** - Help desk, user assistance, FAQ
- **`project-management/`** - Planning, coordination, tracking
- **`research/`** - Information gathering, analysis, summarization
- **`automation/`** - Task automation, workflow optimization
- **`security/`** - Security analysis, vulnerability detection
- **`testing/`** - Quality assurance, test automation
- **`design/`** - UI/UX, visual design, prototyping

## 📁 Rule Structure

### Rule Structure

### Required Files

Each rule submission must include:

```
rules/
└── category/
    └── rule-name/
        ├── README.md          # Basic rule information and overview
        ├── rule-name.md       # Complete rule in Markdown format
        └── examples/          # Usage examples (optional)
            ├── basic-usage.md
            └── advanced-config.md
```

**Note**: Rules are now written in Markdown format instead of YAML for better compatibility with AI coding assistants like Cline, Windsurf, Trae AI, Cursor, and GitHub Copilot.

### README.md Template

Use this template for your rule documentation:

```markdown
# Rule Name

> Brief description of what the rule does

## 📋 Overview
Detailed description of the rule's purpose and capabilities.

## ⭐ Community Rating
Rate this rule using GitHub reactions:
- 👍 **0** - Works great, recommended!
- ❤️ **0** - Love this rule, essential for workflow
- 🚀 **0** - Game-changer, significantly improved productivity
- 👀 **0** - Interesting, want to try this
- 😕 **0** - Needs improvement or clarification

## 🎯 Use Cases
- Use case 1
- Use case 2
- Use case 3

## 🔧 Features
- Feature 1
- Feature 2
- Feature 3

## 🚀 Quick Start
### Installation
### Basic Usage
### Configuration

## 📊 Examples
Provide clear, working examples

## 🔄 Version History
Track changes and improvements

## 🤝 Contributing
How others can improve this rule

## 📄 License
License information
```

### Markdown Rule Template

Use this template for your rule file (`rule-name.md`):

```markdown
---
name: "Your Rule Name"
author: "@avalus"
compatible-agents: ["Cline", "Windsurf", "Trae AI", "Cursor", "GitHub Copilot"]
tool-access: ["file-system", "web-search", "code-analysis"]
---

# Your Rule Name

You are a [role description] with expertise in [domain]. Your role is to [primary function].

## Core Responsibilities

### 1. [Primary Function]
- **[Sub-function 1]**: Description
- **[Sub-function 2]**: Description
- **[Sub-function 3]**: Description

### 2. [Secondary Function]
- **[Sub-function 1]**: Description
- **[Sub-function 2]**: Description

## [Additional sections as needed for your rule]

---

*This rule is designed to work with modern AI coding assistants and can be customized based on your specific needs.*
```

### Agent Compatibility Guidelines

When specifying agent compatibility:

- **`name`**: The official name of the AI agent/IDE
- **`versions`**: Supported version ranges (use semantic versioning)
- **`tested`**: Whether you've personally tested with this agent
- **`notes`**: Any specific configuration or compatibility notes

**Supported Agents:**
- **Cline** - VS Code extension for AI-powered coding
- **Windsurf** - AI-first code editor
- **Trae AI** - Advanced AI coding assistant
- **Cursor** - AI-powered code editor
- **GitHub Copilot** - GitHub's AI pair programmer
- **Others** - Feel free to add other agents you've tested

## 🚀 Submission Process

### Step 1: Prepare Your Rule

1. **Test Thoroughly** - Ensure your rule works in different scenarios
2. **Write Documentation** - Create comprehensive README with examples
3. **Follow Standards** - Use the required file structure and naming
4. **Add Metadata** - Include proper versioning and attribution

### Step 2: Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/avalus/rulebase.git
cd rulebase

# Create a new branch for your rule
git checkout -b add-your-rule-name
```

### Step 3: Add Your Rule

```bash
# Create the rule directory
mkdir -p rules/category/your-rule-name

# Add your files
cp your-rule.md rules/category/your-rule-name/
cp README.md rules/category/your-rule-name/

# Update the main README if needed
# Add your rule to the appropriate table
```

### Step 4: Update Documentation

1. **Add to Table of Contents** - Update the main README.md
2. **Update RULES_INDEX.md** - Add your rule to the comprehensive index
3. **Check Links** - Ensure all internal links work correctly

### Step 5: Submit Pull Request

```bash
# Commit your changes
git add .
git commit -m "Add [Rule Name] - [Brief Description]"

# Push to your fork
git push origin add-your-rule-name

# Create pull request on GitHub
```

### Pull Request Template

Use this template for your PR description:

```markdown
## Rule Submission: [Rule Name]

### Description
Brief description of what this rule does and why it's valuable.

### Category
- [ ] coding
- [ ] content  
- [ ] data-analysis
- [ ] customer-support
- [ ] project-management
- [ ] research
- [ ] automation
- [ ] security
- [ ] testing
- [ ] design

### Checklist
- [ ] Rule has been tested and works as described
- [ ] README includes comprehensive documentation
- [ ] Markdown rule file follows the standard format
- [ ] Agent compatibility and tool access information is included
- [ ] Examples are provided and functional
- [ ] No duplicate functionality with existing rules
- [ ] Proper attribution for any adapted content
- [ ] Updated main README table of contents
- [ ] Added to RULES_INDEX.md

### Testing
Describe how you tested the rule and in what scenarios.

### Additional Notes
Any additional context or considerations for reviewers.
```

## 🔍 Review Process

### What Reviewers Look For

1. **Functionality** - Does the rule work as described?
2. **Documentation** - Is it clear and comprehensive?
3. **Agent Compatibility** - Are supported agents clearly specified?
4. **Uniqueness** - Does it add value not covered by existing rules?
5. **Quality** - Is the Markdown structure well-organized?
6. **Examples** - Are the examples helpful and accurate?

### Review Timeline

- **Initial Review** - Within 3-5 business days
- **Feedback Incorporation** - Depends on complexity of changes
- **Final Approval** - 1-2 business days after all feedback addressed
- **Merge** - Immediately after approval

### After Merge

1. **Community Rating** - Your rule will start receiving community ratings
2. **Feedback** - Monitor issues and discussions for improvement opportunities
3. **Maintenance** - Keep your rule updated and respond to community feedback

## 🏆 Recognition

### Contributor Benefits

- **Attribution** - Your GitHub profile linked in rule documentation
- **Hall of Fame** - Top contributors featured prominently
- **Community Status** - Recognition as a valued community member
- **Early Access** - Preview new features and provide feedback

### Top Contributor Program

Contributors with multiple high-quality rules may be invited to:
- **Review Team** - Help review new submissions
- **Feature Planning** - Influence RuleBase roadmap
- **Beta Testing** - Test new platform features
- **Community Events** - Participate in webinars and discussions

## 📞 Getting Help

### Before Submitting

- **Check Existing Rules** - Avoid duplicates by browsing current rules
- **Read Documentation** - Review this guide and existing examples
- **Ask Questions** - Use GitHub Discussions for clarification

### Support Channels

- **GitHub Discussions** - General questions and community chat
- **GitHub Issues** - Bug reports and feature requests
- **Email** - Direct contact for sensitive matters: contributors@rulebase.dev

### Common Questions

**Q: Can I submit a rule that's similar to an existing one?**
A: Yes, if it provides significant improvements or different approaches. Clearly explain the differences in your PR.

**Q: What if my rule doesn't fit existing categories?**
A: Suggest a new category in your PR. We're open to expanding categories based on community needs.

**Q: Can I update someone else's rule?**
A: Yes! Improvements to existing rules are welcome. Submit a PR with clear explanations of your changes.

**Q: How do I handle rule dependencies?**
A: Document all dependencies clearly in your README and consider including installation scripts.

## 📄 Code of Conduct

### Our Standards

- **Be Respectful** - Treat all community members with respect
- **Be Constructive** - Provide helpful, actionable feedback
- **Be Inclusive** - Welcome contributors from all backgrounds
- **Be Patient** - Remember that everyone is learning

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Spam or self-promotion without value
- Sharing malicious or harmful code
- Violating intellectual property rights

### Enforcement

Violations of the code of conduct will result in:
1. **Warning** - First offense, private discussion
2. **Temporary Ban** - Repeated violations, 30-day suspension
3. **Permanent Ban** - Severe or continued violations

## 🎉 Welcome to the Community!

We're excited to have you contribute to RuleBase! Your rules and improvements help thousands of developers worldwide build better AI agents and workflows.

**Ready to contribute?** Start by exploring existing rules, then share your own amazing creations! 🚀

---

*Questions? Reach out in [GitHub Discussions](https://github.com/avalus/rulebase/discussions) - we're here to help!*