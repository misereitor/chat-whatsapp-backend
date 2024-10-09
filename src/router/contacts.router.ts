import { Response, Request, Router } from 'express';
import { clientRoute } from '../middleware';

const routerContacts = Router();

routerContacts.post(
  '/get-all-chats',
  clientRoute,
  async (req: Request, res: Response) => {
    try {
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerContacts };
