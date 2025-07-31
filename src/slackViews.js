// Slack Block Kit views for the Jira ticket creation modal

const createTicketModal = {
  type: 'modal',
  callback_id: 'create_jira_ticket',
  title: {
    type: 'plain_text',
    text: 'Create Jira Ticket'
  },
  submit: {
    type: 'plain_text',
    text: 'Create Ticket'
  },
  close: {
    type: 'plain_text',
    text: 'Cancel'
  },
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Fill out the form below to create a new Jira ticket:'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'input',
      block_id: 'title_block',
      element: {
        type: 'plain_text_input',
        action_id: 'title_input',
        placeholder: {
          type: 'plain_text',
          text: 'Enter a clear, descriptive title for the ticket'
        },
        max_length: 255
      },
      label: {
        type: 'plain_text',
        text: 'Ticket Title *'
      }
    },
    {
      type: 'input',
      block_id: 'description_block',
      element: {
        type: 'plain_text_input',
        action_id: 'description_input',
        multiline: true,
        placeholder: {
          type: 'plain_text',
          text: 'Provide a detailed description of the requirement or issue'
        }
      },
      label: {
        type: 'plain_text',
        text: 'Description *'
      }
    },
    {
      type: 'input',
      block_id: 'customers_block',
      element: {
        type: 'plain_text_input',
        action_id: 'customers_input',
        multiline: true,
        placeholder: {
          type: 'plain_text',
          text: 'List the customers this requirement relates to (one per line or comma-separated)'
        }
      },
      label: {
        type: 'plain_text',
        text: 'Related Customers'
      },
      optional: true
    },
    {
      type: 'input',
      block_id: 'mr_amount_block',
      element: {
        type: 'plain_text_input',
        action_id: 'mr_amount_input',
        placeholder: {
          type: 'plain_text',
          text: 'e.g., $50,000 or 50000 USD'
        }
      },
      label: {
        type: 'plain_text',
        text: 'Projected MR Amount'
      },
      optional: true
    }
  ]
};

const createSuccessMessage = (issueKey, issueUrl, title) => ({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:white_check_mark: *Jira ticket created successfully!*`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Ticket:* <${issueUrl}|${issueKey}>`
        },
        {
          type: 'mrkdwn',
          text: `*Title:* ${title}`
        }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View in Jira'
          },
          url: issueUrl,
          style: 'primary'
        }
      ]
    }
  ]
});

const createErrorMessage = (error) => ({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:x: *Failed to create Jira ticket*`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Error: ${error}`
      }
    }
  ]
});

const createHelpMessage = () => ({
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Slack to Jira Bot Help*'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Use `/jira-ticket` to create a new Jira ticket with the following information:'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '• *Title* (required): A clear, descriptive title\n• *Description* (required): Detailed description of the requirement\n• *Customers*: List of related customers\n• *MR Amount*: Projected monetary value'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'The bot will create the ticket in your configured Jira project and provide you with a link to view it.'
      }
    }
  ]
});

module.exports = {
  createTicketModal,
  createSuccessMessage,
  createErrorMessage,
  createHelpMessage
};