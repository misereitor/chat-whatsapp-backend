import { Response, Request, Router } from 'express';
import {
  createChatService,
  findAllMessageInDB,
  sendMessage
} from '../services/chat-services';
import { clientRoute } from '../middleware';

const routerChat = Router();

routerChat.post(
  '/get-all-chats',
  clientRoute,
  async (req: Request, res: Response) => {
    try {
      const { company_id } = req.body;
      const response = await findAllMessageInDB(company_id);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerChat.post(
  '/send-message',
  clientRoute,
  async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      await sendMessage(message);
      res.status(200).json({ success: true, data: 'mensagem enviada' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerChat.post(
  '/create-chat',
  clientRoute,
  async (req: Request, res: Response) => {
    try {
      const { connection } = req.body;
      const response = await createChatService(connection);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerChat };
