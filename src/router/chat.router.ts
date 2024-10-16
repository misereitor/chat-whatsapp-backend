import { Response, Request, Router } from 'express';
import {
  createChatService,
  findAllMessageInDB
} from '../services/chat-services';
import { clientChatMiddleware } from '../middleware';
import { valideTokenUserAdminService } from '../services/auth-service';
import { sendMessage } from '../services/message-service';

const routerChat = Router();

routerChat.post(
  '/get-all-chats',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token: string | undefined = req.headers.authorization;
      const tokenOpen: any = await valideTokenUserAdminService(token);
      const { company_id } = req.body;
      const response = await findAllMessageInDB(company_id, tokenOpen.id);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerChat.post(
  '/send-message',
  clientChatMiddleware,
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
  clientChatMiddleware,
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
