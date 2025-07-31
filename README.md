# Slack-Jira Integration Bot

A Slack bot that automatically creates Jira tickets with custom fields including title, description, customer information, and projected MR (Monthly Recurring) amounts.

## Features

- 🎫 Create Jira tickets directly from Slack using slash commands
- 📝 Interactive modal form with required and optional fields
- 👥 Customer tracking for requirements
- 💰 Projected MR amount tracking
- ✅ Real-time ticket creation confirmation
- 🔗 Direct links to created Jira tickets
- 🏠 App Home with quick access buttons

## Prerequisites

- Node.js 16.0.0 or higher
- A Slack workspace with admin permissions
- A Jira Cloud instance with API access
- Basic understanding of Slack app configuration

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd slack-jira-bot
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Slack Bot Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-slack-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here

# Jira Configuration
JIRA_HOST=https://your-domain.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=YOUR_PROJECT_KEY

# Server Configuration
PORT=3000
```

### 3. Run the Bot

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Configuration Guide

### Slack App Setup

1. **Create a new Slack app** at [api.slack.com](https://api.slack.com/apps)

2. **Configure Bot Token Scopes** in "OAuth & Permissions":
   ```
   app_mentions:read
   channels:read
   chat:write
   commands
   groups:read
   im:read
   mpim:read
   users:read
   ```

3. **Enable Socket Mode** in "Socket Mode" settings

4. **Create Slash Commands** in "Slash Commands":
   - Command: `/jira-ticket`
   - Request URL: Not needed (using Socket Mode)
   - Description: "Create a new Jira ticket"
   
   - Command: `/jira-help`
   - Request URL: Not needed (using Socket Mode)
   - Description: "Get help with the Jira bot"

5. **Configure App Home** in "App Home":
   - Enable "Home Tab"
   - Enable "Messages Tab"

6. **Install the app** to your workspace and copy the tokens to your `.env` file

### Jira Setup

1. **Generate API Token**:
   - Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Create a new API token
   - Copy the token to your `.env` file

2. **Find your Project Key**:
   - Go to your Jira project
   - The project key is visible in the project settings or in ticket URLs (e.g., "PROJ-123" → key is "PROJ")

3. **Optional: Custom Fields**:
   - If you want to store customers and MR amounts in separate Jira fields, configure custom fields in your Jira project
   - Update `src/jiraClient.js` to use the custom field IDs

## Usage

### Creating Tickets

1. **Using Slash Command**: Type `/jira-ticket` in any Slack channel or DM
2. **Using App Home**: Go to the bot's home tab and click "Create Ticket"
3. **Fill out the form**:
   - **Title** (required): Clear, descriptive title
   - **Description** (required): Detailed requirement description
   - **Customers** (optional): List of related customers
   - **MR Amount** (optional): Projected monetary value

### Form Fields

- **Title**: Brief, descriptive title for the Jira ticket (max 255 characters)
- **Description**: Detailed description of the requirement or issue
- **Related Customers**: List customers this requirement relates to (one per line or comma-separated)
- **Projected MR Amount**: Expected monetary value (e.g., "$50,000" or "50000 USD")

### Getting Help

Type `/jira-help` in any channel to see usage instructions.

## Project Structure

```
slack-jira-bot/
├── src/
│   ├── app.js              # Main Slack bot application
│   ├── config.js           # Configuration and validation
│   ├── jiraClient.js       # Jira API integration
│   └── slackViews.js       # Slack Block Kit UI components
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Customization

### Custom Jira Fields

To use dedicated Jira custom fields for customers and MR amounts:

1. Create custom fields in your Jira project
2. Find the custom field IDs (they look like `customfield_12345`)
3. Update `src/jiraClient.js` in the `createTicket` method:

```javascript
const issueData = {
  fields: {
    project: { key: config.jira.projectKey },
    summary: title,
    description: formattedDescription,
    issuetype: { name: 'Task' },
    customfield_12345: customers,  // Replace with actual field ID
    customfield_67890: mrAmount,   // Replace with actual field ID
  }
};
```

### Issue Types

By default, tickets are created as "Task" type. To change this:

1. Edit `src/jiraClient.js`
2. Change the `issuetype` field in the `createTicket` method
3. Available types: "Task", "Story", "Bug", "Epic", etc.

## Deployment

### Local Development

```bash
npm run dev
```

### Production Deployment

The bot can be deployed to any Node.js hosting platform:

**Heroku:**
```bash
# Set environment variables
heroku config:set SLACK_BOT_TOKEN=xoxb-your-token
heroku config:set JIRA_HOST=https://your-domain.atlassian.net
# ... set other variables

# Deploy
git push heroku main
```

**Docker:**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Ensure all variables in `.env.example` are set in your `.env` file

2. **"Failed to create Jira ticket"**
   - Verify Jira credentials and project key
   - Check that your Jira user has permission to create tickets in the project

3. **Slack commands not responding**
   - Verify Slack app tokens and permissions
   - Ensure Socket Mode is enabled
   - Check that slash commands are properly configured

4. **Modal not opening**
   - Verify the bot has `commands` scope
   - Check that the app is installed in the workspace

### Logs

The bot outputs detailed logs for debugging:
- Successful ticket creation with ticket URLs
- Configuration validation errors
- Jira API errors
- Slack API errors

## Security Notes

- Store all sensitive tokens in environment variables, never in code
- Use API tokens instead of passwords for Jira authentication
- Regularly rotate API tokens
- Monitor bot usage and permissions

## License

MIT License - see LICENSE file for details.
