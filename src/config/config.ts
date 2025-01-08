import dotenv from 'dotenv';

dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    assistantId: process.env.ASSISTANT_ID || '',
    vectorStoreId: process.env.VECTORSTORE_ID || ''
  },
  slack: {
    token: process.env.SLACK_BOT_TOKEN || '',
    signingSecret: process.env.SLACK_SIGNING_SECRET || '',
    appToken: process.env.SLACK_APP_TOKEN || '',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
};