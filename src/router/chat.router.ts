import { Response, Request, Router } from 'express';
import {
  createChatService,
  findAllMessageInDB
} from '../services/chat-services';
import { clientChatMiddleware } from '../middleware';
import { sendMessage } from '../services/message-service';
import { securityRouter } from '../services/security/security-service';

const routerChat = Router();

routerChat.get(
  '/:company_id/get-all-chats',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      const user = await securityRouter(token, Number(company_id));

      const response = await findAllMessageInDB(Number(company_id), user.id);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerChat.post(
  '/:company_id/send-message',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { message } = req.body;
      await sendMessage(message);
      res.status(200).json({ success: true, data: 'mensagem enviada' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerChat.post(
  '/:company_id/create-chat',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { connection } = req.body;
      const response = await createChatService(connection);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerChat };
