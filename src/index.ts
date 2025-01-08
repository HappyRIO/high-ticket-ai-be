// import express, { Request, Response } from 'express';
// import logger from './logger';

// const app = express();
// const port = 3000;

// app.use(express.json());

// app.get('/', (req: Request, res: Response) => {
//   logger.info('Hello World endpoint was hit');
//   res.send('Hello World!');
// });

// app.listen(port, () => {
//   logger.info(`Server is running on http://localhost:${port}`);
// });

import { ChatbotService } from './services/chatbot';
// import { SlackIntegration } from './integrations/slack.integration';
import { SaaSIntegration } from './integrations/saas';
import logger from './utils/logger';

async function bootstrap() {
  try {
    const chatbotService = new ChatbotService();
    
    // Initialize Slack integration
    // const slackIntegration = new SlackIntegration(chatbotService);
    // await slackIntegration.start();
    
    // // Initialize SaaS integration
    const saasIntegration = new SaaSIntegration(chatbotService);
    saasIntegration.start();
    
    logger.info('🤖 Chatbot system initialized successfully');
  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
}

bootstrap();
