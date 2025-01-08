import express, { Request, Response } from 'express';
import cors from 'cors'
import { ChatbotService } from '../services/chatbot';
import logger from '../utils/logger';
import { config } from '../config/config';
import multer from 'multer'
import { createVectorStore, createVectorStoreFile, fileDel, fileList, fileRetrieve, updateAssistant, vectorStoreFiles } from '../services/createAssistant';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`); 
  },
});
const upload = multer({ storage });

export class SaaSIntegration {
  private app: express.Application;
  private chatbotService: ChatbotService;

  constructor(chatbotService: ChatbotService) {
    this.chatbotService = chatbotService;
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    this.initializeRoutes();
  }
  
  private initializeRoutes(): void {
    this.app.post('/api/chat', async (req: Request, res: Response) => {
      try {
        const { message, threadId } = req.body;
        console.log("----->", req.body, message, threadId)
        // chatHistory.push({ role: 'user', content: message });
        if (!message) {
          res.status(400).json({ error: 'Message is required' });
        }

        let thread_Id = threadId
        if (!threadId) {
          thread_Id = await this.chatbotService.createThread()
        }

        const response = await this.chatbotService.processMessage(message, thread_Id);
        // const response = "Welcome rio!"
        console.log("reponse-->", response)
        res.json({ response });
      } catch (error) {
        logger.error('Error processing SaaS message:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // this.app.get('/api/list', async (req: Request, res: Response) => {
    //   const response= await generateAnswer()
    //   res.send(response)
    // })

    this.app.post('/api/thread', async (req: Request, res: Response) => {
      const { threadId } = req.body
      const response = await this.chatbotService.createThread(threadId)
      console.log('Thread ID: ', response)
      res.send(response)
    })

    this.app.get('/api/instructions', async (req: Request, res: Response) => {
      const response = await this.chatbotService.getInstructions()
      console.log("Instructions:", response)
      res.json(response)
    })

    this.app.post('/api/instructions', async (req: Request, res: Response) => {
      const newInstructions = req.body.data;
      console.log("Instructions:", newInstructions)
      const response = await this.chatbotService.updateInstructions(newInstructions)
      res.json(response)
    })

    this.app.post('/api/upload', upload.single('file'), async (req, res) => {
      try {
        const filePath = req.file?.path;
        console.log('filePath', filePath)
        // console.log('req.file.filename', req.file?.filename)
          //  The path of the uploaded file
          if (filePath) {
            const fileId = await this.chatbotService.trainModel(filePath); // Call your uploadFile function
            res.json({ id: fileId }); // Respond with the file ID
          }
      } catch (error) {
          console.error('Upload error:', error);
          res.status(500).json({ error: 'Failed to upload file' });
      }
    });

    this.app.post('/api/remove', async (req, res) => {
      try {
        const fileId = "file-PCa7P3xyhodz3CqZvFKScL"
        const response = await this.chatbotService.delFile(fileId)
        res.send(response)
      } catch (error) {
          console.error('Upload error:', error);
          res.status(500).json({ error: 'Failed to upload file' });
      }
    });

    this.app.get('/api/createvs', async (req, res) => {
      try {
        const response = await updateAssistant()
        res.send(response)
      } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ error: 'Failed to create vector store' });
      }
    })

    this.app.get('/api/file', async (req, res) => {
      try {
        const response = await vectorStoreFiles()
        res.send(response)
      } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ error: 'Failed to create vector store' });
      }
    })
  }

  start(): void {
      console.log("Run 2--->")
    this.app.listen(config.server.port, () => {
      logger.info(`🚀 SaaS API is running on port ${config.server.port}`);
    });
  }
}
