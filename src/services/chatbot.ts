import { OpenAIService } from './openai';
import logger from '../utils/logger';

export class ChatbotService {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  async createThread(threadId?: string) {
    try {
      logger.info('Creating new Thread')
      if (threadId) {
        const isDelete = await this.openAIService.deleteThread(threadId)
        console.log('Delete thread: ',threadId,':', isDelete)
      }
      return await this.openAIService.createThread()
    } catch (error) {
      logger.error('Failed to creating new Thread:', error);
      throw error;
    }
  }

  async getInstructions() {
    try {
      logger.info('getting the instructions')
      const assistant = await this.openAIService.getAssistant()
      return assistant.instructions || null
    } catch (error) {
      logger.error('Failed to get the instructions:', error);
      throw error;
    }
  }

  async updateInstructions(instructions: string) {
    try {
      logger.info('Updating the instructions')
      return await this.openAIService.updateInstructions(instructions)
    } catch (error) {
      logger.error('Failed to update the instructions:', error);
      throw error;
    }
  }

  async processMessage(message: string, threadId: string): Promise<string> {
    try {
      logger.info(`Processing message: ${message}`);
      return await this.openAIService.generateResponse(message, threadId);
    } catch (error) {
      logger.error('Error in chatbot service:', error);
      throw error;
    }
  }

  async trainModel(filePath:string) {
    try {
      const fileId = await this.openAIService.uploadFile(filePath)
      await this.openAIService.addVectorStoreFile(fileId)
      await this.openAIService.updateAssistant()
    } catch (error) {
      logger.error('Error in chatbot :', error);
      throw error;
    }
  }

  async delFile(fileId: string) {
    try {
      const removeVectorStoreFile = await this.openAIService.delVectorStoreFile(fileId);
      if (removeVectorStoreFile.deleted) {
        const removeFile = await this.openAIService.delFile(fileId);
        if (removeFile.deleted) {
          await this.openAIService.updateAssistant();
          return { success: true, message: 'File deleted successfully.' };
        } else {
          logger.warn(`File deletion failed: ${fileId}`);
        }
      } else {
        logger.warn(`Vector store file deletion failed: ${fileId}`);
      }
      
      return { success: false, message: 'File or vector store file could not be deleted.' };
    } catch (error) {
      logger.error('Error deleting file from OpenAI:', { fileId, error });
      throw error;
    }
  }

}