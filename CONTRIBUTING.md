# Contributing

Thank you for your interest in contributing to Rulebase! 🎉 This guide will help you understand how to contribute AI agent rules, improve existing ones, and help build the best community for AI workflows.

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
- **Provide Feedback** - Use GitHub reactions to share your experience with rules
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

### Licensing

**For Original Rules:**
By contributing original rules to Rulebase, you agree that your contributions will be licensed under the same [MIT License](LICENSE) as the main project.

**For Rules from Other Projects:**
Rules copied or adapted from other projects must use compatible open-source licenses. Include the original licensing information in the rule's metadata (see rule template below). Non-MIT licensed rules will be clearly marked in the repository.

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

### Required Files

Each rule submission must include:

```
rules/
└── category/
    └── rule-name/
        ├── README.md          # Basic rule information and overview
        └── rule-name.md       # Complete rule in Markdown format
```

### README.md Template

Use this template for your rule documentation:

```markdown
# [Rule Name]

[Brief description of what the rule does and its purpose]

## Example Prompts
- "[Example prompt 1 showing how to use this rule]"
- "[Example prompt 2 demonstrating another use case]"

## Rule Metadata
- Contributor: [@your-github-username](https://github.com/your-github-username)
- Original Author: [Name] (if applicable)
- Original Project: [Project Name](https://project-url) (if applicable)
- Original License: [License Type] (if applicable)

## Community Feedback

**[Share Your Experience in GitHub Discussions →](https://github.com/avalus/rulebase/discussions)**

*Click the link above to join the discussion for this rule and share your experience!*

### Current Community Reactions
<!-- STATS_START -->
👍 **0** | ❤️ **0** | 🚀 **0** | 👀 **0** | 😕 **0** | **Total: 0 reactions**
<!-- STATS_END -->

*This section is automatically updated by our community feedback system.*
```

## 🚀 Submission Process

### Step 1: Prepare Your Rule

1. **Test Thoroughly** - Ensure your rule works in different scenarios
2. **Write Documentation** - Create comprehensive README with example prompts
3. **Follow Standards** - Use the required file structure and naming
4. **Add Metadata** - Include proper rule metadata in the Markdown file

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
```

### Step 5: Submit Pull Request

```bash
# Commit your changes
git add .
git commit -m "Add [Rule Name] - [Brief Description]"

# Push to your fork
git push origin add-your-rule-name

# Create pull request on GitHub
```

## 🏆 Recognition

### Contributor Benefits

- **Attribution** - Your GitHub profile linked in rule documentation
- **Hall of Fame** - Top contributors featured prominently
- **Community Status** - Recognition as a valued community member
- **Early Access** - Preview new features and provide feedback

### Top Contributor Program

Contributors with multiple high-quality rules may be invited to:
- **Review Team** - Help review new submissions
- **Feature Planning** - Influence Rulebase roadmap
- **Community Events** - Participate in webinars and discussions

### Common Questions

**Q: Can I submit a rule that's similar to an existing one?**
A: Yes, if it provides significant improvements or different approaches. Clearly explain the differences in your PR.

**Q: What if my rule doesn't fit existing categories?**
A: Suggest a new category in your PR. We're open to expanding categories based on community needs.

**Q: Can I update someone else's rule?**
A: Yes! Improvements to existing rules are welcome. Submit a PR with clear explanations of your changes.

**Q: How do I handle rule dependencies?**
A: Document all dependencies clearly in your README and consider including installation scripts.

## 🎉 Welcome to the Community!

We're excited to have you contribute to Rulebase! Your rules and improvements help thousands of developers worldwide build better AI agents and workflows.

**Ready to contribute?** Start by exploring existing rules, then share your own amazing creations! 🚀

---

*Questions? Reach out in [GitHub Discussions](https://github.com/avalus/rulebase/discussions) - we're here to help!*