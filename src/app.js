const { App } = require('@slack/bolt');
const { config, validateConfig } = require('./config');
const JiraClient = require('./jiraClient');
const { 
  createTicketModal, 
  createSuccessMessage, 
  createErrorMessage, 
  createHelpMessage 
} = require('./slackViews');

// Validate configuration before starting
try {
  validateConfig();
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

// Initialize Slack app
const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  appToken: config.slack.appToken,
  socketMode: true,
  port: config.server.port
});

// Initialize Jira client
const jiraClient = new JiraClient();

// Slash command to open the ticket creation modal
app.command('/jira-ticket', async ({ command, ack, body, client }) => {
  await ack();

  try {
    // Open the modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: createTicketModal
    });
  } catch (error) {
    console.error('Error opening modal:', error);
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: 'Sorry, there was an error opening the ticket creation form. Please try again.'
    });
  }
});

// Help command
app.command('/jira-help', async ({ command, ack, client }) => {
  await ack();

  try {
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      ...createHelpMessage()
    });
  } catch (error) {
    console.error('Error sending help message:', error);
  }
});

// Handle modal submission
app.view('create_jira_ticket', async ({ ack, body, view, client }) => {
  // Extract form values
  const values = view.state.values;
  const title = values.title_block.title_input.value;
  const description = values.description_block.description_input.value;
  const customers = values.customers_block.customers_input.value || '';
  const mrAmount = values.mr_amount_block.mr_amount_input.value || '';

  // Validate required fields
  const errors = {};
  
  if (!title || title.trim().length === 0) {
    errors.title_block = 'Title is required';
  }
  
  if (!description || description.trim().length === 0) {
    errors.description_block = 'Description is required';
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    await ack({
      response_action: 'errors',
      errors: errors
    });
    return;
  }

  // Acknowledge the modal submission
  await ack();

  const userId = body.user.id;
  const userName = body.user.username || body.user.name;

  try {
    // Create the Jira ticket
    const result = await jiraClient.createTicket({
      title: title.trim(),
      description: description.trim(),
      customers: customers.trim(),
      mrAmount: mrAmount.trim(),
      reporterId: userId // This might need to be mapped to a Jira user ID
    });

    if (result.success) {
      // Send success message to the user
      await client.chat.postMessage({
        channel: userId, // Send as DM
        ...createSuccessMessage(result.issueKey, result.issueUrl, title.trim())
      });

      // Also post in the channel where the command was triggered if available
      if (body.trigger_id) {
        try {
          await client.chat.postMessage({
            channel: body.user.id, // Send as DM for privacy
            text: `Jira ticket ${result.issueKey} created successfully! Check your DMs for details.`
          });
        } catch (error) {
          console.log('Could not post channel message, but ticket was created successfully');
        }
      }
    } else {
      // Send error message
      await client.chat.postMessage({
        channel: userId,
        ...createErrorMessage(result.error)
      });
    }
  } catch (error) {
    console.error('Error in modal submission handler:', error);
    
    try {
      await client.chat.postMessage({
        channel: userId,
        ...createErrorMessage('An unexpected error occurred while creating the ticket. Please try again or contact support.')
      });
    } catch (msgError) {
      console.error('Error sending error message:', msgError);
    }
  }
});

// Handle app home opened event (optional)
app.event('app_home_opened', async ({ event, client }) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Welcome to the Slack-Jira Integration Bot!*'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Use `/jira-ticket` to create a new Jira ticket.\nUse `/jira-help` for more information.'
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Create Ticket'
                },
                value: 'create_ticket',
                action_id: 'home_create_ticket'
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error publishing home view:', error);
  }
});

// Handle button click from app home
app.action('home_create_ticket', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: createTicketModal
    });
  } catch (error) {
    console.error('Error opening modal from home:', error);
  }
});

// Error handling
app.error((error) => {
  console.error('Slack app error:', error);
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack-Jira Bot is running!');
    console.log(`🔌 Server listening on port ${config.server.port}`);
    console.log(`🎯 Jira project: ${config.jira.projectKey}`);
    console.log(`🏠 Jira host: ${config.jira.host}`);
  } catch (error) {
    console.error('Failed to start the app:', error);
    process.exit(1);
  }
})();