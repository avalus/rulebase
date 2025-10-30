const { Octokit } = require('@octokit/rest');

/**
 * GitHub API wrapper with rate limiting and error handling
 */
class GitHubAPI {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token,
      request: {
        retries: 3,
        retryAfter: 5
      }
    });
    this.apiCallCount = 0;
    this.maxCallsPerMinute = 50; // Conservative limit
  }

  /**
   * Rate limiting helper
   */
  async rateLimitDelay() {
    this.apiCallCount++;
    if (this.apiCallCount % this.maxCallsPerMinute === 0) {
      console.log(`Rate limit pause after ${this.apiCallCount} API calls...`);
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
    } else if (this.apiCallCount % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay every 10 calls
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner, repo) {
    await this.rateLimitDelay();
    return await this.octokit.rest.repos.get({ owner, repo });
  }

  /**
   * Get repository contributors
   */
  async getContributors(owner, repo) {
    await this.rateLimitDelay();
    return await this.octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 100
    });
  }

  /**
   * Search for issues and pull requests
   */
  async searchIssuesAndPullRequests(query, perPage = 50) {
    await this.rateLimitDelay();
    return await this.octokit.rest.search.issuesAndPullRequests({
      q: query,
      per_page: perPage
    });
  }

  /**
   * Get reactions for an issue
   */
  async getIssueReactions(owner, repo, issueNumber) {
    await this.rateLimitDelay();
    return await this.octokit.rest.reactions.listForIssue({
      owner,
      repo,
      issue_number: issueNumber
    });
  }

  /**
   * Get comments for an issue
   */
  async getIssueComments(owner, repo, issueNumber) {
    await this.rateLimitDelay();
    return await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
      per_page: 100
    });
  }

  /**
   * Get comment reactions
   */
  async getCommentReactions(owner, repo, commentId) {
    await this.rateLimitDelay();
    return await this.octokit.rest.reactions.listForIssueComment({
      owner,
      repo,
      comment_id: commentId
    });
  }

  /**
   * Get file content from repository
   */
  async getFileContent(owner, repo, path) {
    await this.rateLimitDelay();
    return await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });
  }

  /**
   * Execute GraphQL query (for discussions if available)
   */
  async graphql(query, variables = {}) {
    await this.rateLimitDelay();
    return await this.octokit.graphql(query, variables);
  }
}

module.exports = { GitHubAPI };