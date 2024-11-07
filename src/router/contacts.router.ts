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
import { securityRouter } from '../services/security/security-service';

const routerContacts = Router();

routerContacts.post(
  '/:company_id/create-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { contact } = req.body;
      const response = await createContactService(contact);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.post(
  '/:company_id/create-all-contacts',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { contacts } = req.body;
      const response = createAllContactsService(contacts);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.put(
  '/:company_id/update-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { contact } = req.body;
      const response = updateContactService(contact);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.delete(
  '/:company_id/delete-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { contact } = req.body;
      const response = deleteContactService(contact);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.get(
  '/:company_id/get-all-contacts',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { filter } = req.body;
      const response = await getAllContactsService(filter);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerContacts.get(
  '/:company_id/get-contact',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { filter } = req.body;
      const response = await getContactByFilterService(filter);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerContacts };
