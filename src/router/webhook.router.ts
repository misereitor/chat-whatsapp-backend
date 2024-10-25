import { Response, Request, Router } from 'express';
import { WebhookMessage } from '../model/webhook-model';
import { botInteraction } from '../services/bot-service';
import { updateStatusMessageAdnEmit } from '../services/message-service';

const routerWebhook = Router();

routerWebhook.post(
  '/webhook',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data: WebhookMessage = req.body;
      switch (data.event) {
        case 'message.any':
          await botInteraction(data, 0);
          break;
        case 'message.ack':
          await updateStatusMessageAdnEmit(data);
          break;
        default:
          break;
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
