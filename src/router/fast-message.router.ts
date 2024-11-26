import { Router } from 'express';
import { clientChatMiddleware } from '../middleware';
import {
  createFastMessageService,
  deleteFastMessageService,
  getAllFastMessagesService,
  updateFastMessageService
} from '../services/fast-message-service';
import { securityRouter } from '../services/security/security-service';

const routerFastMessage = Router();

routerFastMessage.post(
  '/:company_id/fast-message/create',
  clientChatMiddleware,
  async (req, res) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const message = req.body;
      const response = await createFastMessageService(message);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerFastMessage.get(
  '/:company_id/fast-message/get-all',
  clientChatMiddleware,
  async (req, res) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      const user = await securityRouter(token, Number(company_id));

      const response = await getAllFastMessagesService(user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerFastMessage.put(
  '/:company_id/fast-message/update',
  clientChatMiddleware,
  async (req, res) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const fastMessage = req.body;
      const response = await updateFastMessageService(fastMessage);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerFastMessage.put(
  '/:company_id/fast-message/delete/:id',
  clientChatMiddleware,
  async (req, res) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { id } = req.params;
      const response = await deleteFastMessageService(Number(id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerFastMessage };
