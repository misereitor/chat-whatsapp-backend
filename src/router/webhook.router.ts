import { Response, Request, Router } from 'express';
import { WebhookMessage } from '../model/webhook-model';
import {
  saveMessageInDB,
  updateStatusMessage
} from '../services/webhook-service';

const routerWebhook = Router();

routerWebhook.post(
  '/webhook',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data: WebhookMessage = req.body;
      if (data.event === 'message.any') {
        await saveMessageInDB(data);
      } else if (data.event === 'message.ack') {
        updateStatusMessage(data);
      }

      res
        .status(200)
        .json({ success: true, data: 'Webhook received successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerWebhook };
