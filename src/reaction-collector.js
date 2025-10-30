/**
 * Reaction collection utilities for rules
 */
class ReactionCollector {
  constructor(githubAPI) {
    this.githubAPI = githubAPI;
  }

  /**
   * Extract rule name from README header (first # heading)
   */
  async extractRuleNameFromReadme(owner, repo, filePath) {
    try {
      const { data: fileContent } = await this.githubAPI.getFileContent(owner, repo, filePath);
      const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
      
      // Find the first # heading
      const headerMatch = content.match(/^#\s+(.+)$/m);
      if (headerMatch) {
        return headerMatch[1].trim();
      }
      
      // Fallback to folder name if no header found
      const ruleKey = filePath.replace('rules/', '').replace('/README.md', '');
      return ruleKey.split('/').pop();
    } catch (error) {
      console.warn(`Could not extract rule name from ${filePath}, using folder name:`, error.message);
      const ruleKey = filePath.replace('rules/', '').replace('/README.md', '');
      return ruleKey.split('/').pop();
    }
  }

  /**
   * Get reactions for a specific rule
   */
  async getRuleReactions(owner, repo, filePath) {
    try {
      const ruleKey = filePath.replace('rules/', '').replace('/README.md', '');
      const folderName = ruleKey.split('/').pop(); // e.g., "smart-code-reviewer"
      const ruleName = await this.extractRuleNameFromReadme(owner, repo, filePath); // e.g., "Smart Code Reviewer"
      const ruleCategory = ruleKey.split('/')[0]; // e.g., "coding"
      console.log(`Fetching reactions for rule: ${ruleKey} (name: "${ruleName}", folder: "${folderName}", category: ${ruleCategory})`);
      
      let totalReactions = {
        thumbsUp: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
        confused: 0,
        total: 0
      };

      // Strategy 1: Search for issues/PRs that mention this rule
      const searchQueries = [
        `repo:${owner}/${repo} "${ruleKey}" in:body`,
        `repo:${owner}/${repo} "${filePath}" in:body`,
        `repo:${owner}/${repo} "${ruleName}" in:title`,
        `repo:${owner}/${repo} "${ruleName}" in:body`
      ];

      for (const query of searchQueries) {
        try {
          const { data: searchResults } = await this.githubAPI.searchIssuesAndPullRequests(query);
          console.log(`Found ${searchResults.items.length} items for query: ${query}`);

          // Process each issue/PR
          for (const item of searchResults.items) {
            // Get reactions on the issue/PR itself
            try {
              const { data: reactions } = await this.githubAPI.getIssueReactions(owner, repo, item.number);

              for (const reaction of reactions) {
                this._addReaction(totalReactions, reaction.content);
              }

              // Get reactions on comments
              const { data: comments } = await this.githubAPI.getIssueComments(owner, repo, item.number);

              for (const comment of comments) {
                // Only count reactions on comments that mention the rule (simplified to only check rule name)
                const commentMentionsRule = comment.body.toLowerCase().includes(ruleName.toLowerCase());
                
                if (commentMentionsRule) {
                  
                  const { data: commentReactions } = await this.githubAPI.getCommentReactions(owner, repo, comment.id);

                  for (const reaction of commentReactions) {
                    this._addReaction(totalReactions, reaction.content);
                  }
                }
              }
            } catch (itemError) {
              console.log(`Error processing item ${item.number}: ${itemError.message}`);
              if (itemError.status === 403) {
                console.log('Rate limit hit, waiting 60 seconds...');
                await new Promise(resolve => setTimeout(resolve, 60000));
              }
            }
          }
        } catch (searchError) {
          console.log(`Search query failed: ${query} - ${searchError.message}`);
          if (searchError.status === 403) {
            console.log('Rate limit hit on search, waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
          }
        }
      }

      // Strategy 2: Look for dedicated feedback in discussions (if available)
      try {
        const discussionQuery = `
          query($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
              discussions(first: 50, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                  title
                  body
                  reactions(first: 100) {
                    nodes {
                      content
                    }
                  }
                  comments(first: 50) {
                    nodes {
                      body
                      reactions(first: 100) {
                        nodes {
                          content
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const discussionData = await this.githubAPI.graphql(discussionQuery, { owner, repo });
        
        if (discussionData.repository?.discussions?.nodes) {
          for (const discussion of discussionData.repository.discussions.nodes) {
            // Check if discussion mentions the rule (only check for complete rule name in title)
            const mentionsRule = discussion.title.toLowerCase().includes(ruleName.toLowerCase());
            
            if (mentionsRule) {
              // Add discussion reactions
              for (const reaction of discussion.reactions.nodes) {
                this._addReaction(totalReactions, reaction.content);
              }
              
              // Add comment reactions
              for (const comment of discussion.comments.nodes) {
                const commentBodyLower = comment.body.toLowerCase();
                const commentMentionsRule = commentBodyLower.includes(ruleKeyLower) ||
                                          commentBodyLower.includes(ruleNameLower) ||
                                          commentBodyLower.includes(folderNameLower) ||
                                          commentBodyLower.includes(filePath) ||
                                          ruleNameLower.split(' ').some(word => word.length > 3 && commentBodyLower.includes(word));
                
                if (commentMentionsRule) {
                  for (const reaction of comment.reactions.nodes) {
                    this._addReaction(totalReactions, reaction.content);
                  }
                }
              }
            }
          }
        }
      } catch (discussionError) {
        console.log(`Discussions not available or error: ${discussionError.message}`);
      }

      // Calculate positive percentage
      const positiveReactions = totalReactions.thumbsUp + totalReactions.heart + totalReactions.rocket + totalReactions.eyes;
      totalReactions.positivePercentage = totalReactions.total > 0 
        ? Math.round((positiveReactions / totalReactions.total) * 100) 
        : 0;

      console.log(`Collected reactions for ${ruleKey}:`, totalReactions);
      return totalReactions;

    } catch (error) {
      console.error(`Error fetching reactions for ${filePath}:`, error);
      // Return default reaction counts if API fails
      return {
        thumbsUp: 0, heart: 0, rocket: 0, eyes: 0, confused: 0,
        total: 0, positivePercentage: 0
      };
    }
  }

  /**
   * Helper method to add a reaction to the total count
   */
  _addReaction(totalReactions, reactionContent) {
    switch (reactionContent) {
      case '+1': 
        totalReactions.thumbsUp++; 
        break;
      case 'heart': 
        totalReactions.heart++; 
        break;
      case 'rocket': 
        totalReactions.rocket++; 
        break;
      case 'eyes': 
        totalReactions.eyes++; 
        break;
      case 'confused': 
        totalReactions.confused++; 
        break;
    }
    totalReactions.total++;
  }
}

module.exports = { ReactionCollector };