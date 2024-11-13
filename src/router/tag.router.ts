import { Response, Request, Router } from 'express';
import { clientChatMiddleware } from '../middleware';
import { securityRouter } from '../services/security/security-service';
import {
  createTagService,
  deleteTagService,
  getAllTagsByCompanyService,
  updateTagService
} from '../services/tag-service';

const routerTag = Router();

routerTag.post(
  '/:company_id/tag/create',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const tag = req.body;
      const response = await createTagService(tag);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerTag.get(
  '/:company_id/tag/get-all',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      const user = await securityRouter(token, Number(company_id));

      const response = await getAllTagsByCompanyService(
        Number(company_id),
        user
      );

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerTag.put(
  '/:company_id/tag/update',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const tag = req.body;
      await updateTagService(tag);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerTag.delete(
  '/:company_id/tag/delete/:id',
  clientChatMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { id } = req.params;
      await deleteTagService(Number(id));
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerTag };
