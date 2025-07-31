require('dotenv').config();

const config = {
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
  },
  jira: {
    host: process.env.JIRA_HOST,
    username: process.env.JIRA_USERNAME,
    apiToken: process.env.JIRA_API_TOKEN,
    projectKey: process.env.JIRA_PROJECT_KEY,
  },
  server: {
    port: process.env.PORT || 3000,
  }
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET', 
    'SLACK_APP_TOKEN',
    'JIRA_HOST',
    'JIRA_USERNAME',
    'JIRA_API_TOKEN',
    'JIRA_PROJECT_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = { config, validateConfig };