import OpenAI from "openai";
import fs from 'fs'
import { config } from "../config/config";
import logger from "../utils/logger";

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async createThread() {
    try {
      const thread = await this.openai.beta.threads.create();
      return thread.id;
    } catch (error) {
      logger.error("Error creating thread:", error);
      throw new Error("Failed to create thread");
    }
  }

  async deleteThread(threadId: string): Promise<boolean> {
    try {
      // const res = await this.openai.beta.threads.retrieve(threadId)
      // console.log('RES', res)
      const response = await this.openai.beta.threads.del(threadId);
      return response.deleted; // Returns true if deletion was successful
    } catch (error) {
      logger.error("Error deleting thread:", error);
      // throw new Error('Failed to delete thread');
      return false;
    }
  }

  async generateResponse(prompt: string, threadId: string): Promise<string> {
    try {
      console.log("prompt", prompt);
      const message = await this.openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: prompt,
      });
      console.log("Message sent:", message);
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: "asst_32BtOVDROgOBCfS4LR5vZ0SJ",
      });

      while (true) {
        const run_status = await this.openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        );
        if (run_status.status === "completed") {
          break;
        }
        // if (run_status.status === "failed") {
        //   throw new Error("Failed to generate response");
        // }
        console.log("Check run Status:", run_status.status)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const messages = await this.openai.beta.threads.messages.list(threadId);
      console.log("Messages list:", messages.data);

      const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
      );
      if (assistantMessage?.content[0].type === "text") {
        console.log(
          "OpenAI Response:",
          assistantMessage?.content[0].text.value
        );
        return assistantMessage?.content[0].text.value;
      }
      return "No valid response received.";
    } catch (error) {
      logger.error("Error generating OpenAI response:", error);
      throw new Error("Failed to generate response");
    }
  }

  async getAssistant() {
    try {
      const assistantId = config.openai.assistantId;
      const assistant = await this.openai.beta.assistants.retrieve(assistantId);
      console.log("Assistant", assistant.id);
      return assistant || null; // Return instructions or null if not found
    } catch (error) {
      // logger.error('Error retrieving assistant instructions:', error);
      throw new Error("Failed to retrieve assistant instructions");
    }
  }

  async updateInstructions(newInstructions:string) {
    try {
      const assistantId = config.openai.assistantId;
      const updatedAssistant = await this.openai.beta.assistants.update(assistantId, {
        instructions: newInstructions,
      });
      console.log("Updated Assistant:", updatedAssistant);
      return true;
    } catch (error) {
      logger.error('Error updating assistant instructions:', error);
      throw new Error('Failed to update assistant instructions');
    }
  }

  async uploadFile(filePath: string) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const response = await this.openai.files.create({
            file: fileStream,
            purpose: 'assistants',
        });
        console.log(`File uploaded successfully: ${response.id}`);
        fs.unlinkSync(filePath); // Optional: remove the file after upload
        return response.id;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
  }

  async delFile(fileId: string) {
    const file = await this.openai.files.del(fileId);
  
    console.log("file", file);
    return file
  }

  async addVectorStoreFile(fileId: string) {
    const vectorStoreId = config.openai.vectorStoreId
    const myVectorStoreFile = await this.openai.beta.vectorStores.files.create(
      vectorStoreId,
      {
        file_id: fileId,
      }
    );
    console.log(myVectorStoreFile);
  };

  async delVectorStoreFile(fileId: string) {
    const vectorStoreId = config.openai.vectorStoreId;
    const deletedVectorStoreFile = await this.openai.beta.vectorStores.files.del(
      vectorStoreId,
      fileId
    );
    console.log(deletedVectorStoreFile);
    return deletedVectorStoreFile
  }

  async updateAssistant() {
    try {
      // const vectorStoreId = "vs_GZEwvVS5DfJm16C1yWoUgxvP"
      const assistantId = config.openai.assistantId;
      const vectorStoreId = config.openai.vectorStoreId;
      const myUpdatedAssistant = await this.openai.beta.assistants.update(
        assistantId,
        {
          tools: [{ type: "file_search" }],
          model: "gpt-4-turbo-preview",
          tool_resources: { file_search: { vector_store_ids: [vectorStoreId] }}
        }
      );
      console.log(myUpdatedAssistant);
    } catch (error) {
        console.error('Error updating assistant:', error);
        throw new Error('Failed to update assistant');
    }
  }
}
