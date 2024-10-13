import { Response, Request, Router } from 'express';
import { clientChatMiddleware } from '../middleware';
import {
  createAllContactsService,
  createContactService,
  deleteContactService,
  getAllContactsService,
  getContactByFilterService,
  updateContactService
} from '../services/contacts-service';

const routerContacts = Router();

routerContacts.post(
  '/create-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contact } = req.body;
      const response = await createContactService(contact);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.post(
  '/create-all-contacts',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contacts } = req.body;
      const response = createAllContactsService(contacts);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.put(
  '/update-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contact } = req.body;
      const response = updateContactService(contact);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.delete(
  '/delete-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { contact } = req.body;
      const response = deleteContactService(contact);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.post(
  '/get-all-contacts',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { filter } = req.body;
      const response = await getAllContactsService(filter);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.post(
  '/get-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { filter } = req.body;
      const response = await getContactByFilterService(filter);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerContacts };
