const JiraApi = require('jira-client');
const { config } = require('./config');

class JiraClient {
  constructor() {
    this.jira = new JiraApi({
      protocol: 'https',
      host: config.jira.host.replace('https://', ''),
      username: config.jira.username,
      password: config.jira.apiToken,
      apiVersion: '2',
      strictSSL: true
    });
  }

  async createTicket({ title, description, customers, mrAmount, reporterId }) {
    try {
      // Format the description with customer and MR amount information
      const formattedDescription = this.formatDescription(description, customers, mrAmount);
      
      const issueData = {
        fields: {
          project: {
            key: config.jira.projectKey
          },
          summary: title,
          description: formattedDescription,
          issuetype: {
            name: 'Task' // You can change this to 'Story', 'Bug', etc. as needed
          },
          // Add custom fields if your Jira instance has them configured
          // For example, if you have custom fields for customers and MR amount:
          // customfield_xxxxx: customers, // Replace xxxxx with actual field ID
          // customfield_yyyyy: mrAmount,  // Replace yyyyy with actual field ID
        }
      };

      // If reporter ID is provided, set it
      if (reporterId) {
        issueData.fields.reporter = { id: reporterId };
      }

      const newIssue = await this.jira.addNewIssue(issueData);
      
      return {
        success: true,
        issueKey: newIssue.key,
        issueUrl: `${config.jira.host}/browse/${newIssue.key}`,
        issue: newIssue
      };
    } catch (error) {
      console.error('Error creating Jira ticket:', error);
      return {
        success: false,
        error: error.message || 'Failed to create Jira ticket'
      };
    }
  }

  formatDescription(description, customers, mrAmount) {
    let formattedDesc = description || '';
    
    if (customers && customers.trim()) {
      formattedDesc += `\n\n*Customers:*\n${customers}`;
    }
    
    if (mrAmount && mrAmount.trim()) {
      formattedDesc += `\n\n*Projected MR Amount:* ${mrAmount}`;
    }
    
    return formattedDesc;
  }

  async getProjectInfo() {
    try {
      const project = await this.jira.getProject(config.jira.projectKey);
      return project;
    } catch (error) {
      console.error('Error fetching project info:', error);
      throw error;
    }
  }

  async getIssueTypes() {
    try {
      const project = await this.getProjectInfo();
      return project.issueTypes;
    } catch (error) {
      console.error('Error fetching issue types:', error);
      return [{ name: 'Task', id: '10001' }]; // Default fallback
    }
  }
}

module.exports = JiraClient;