import { Response, Request, Router } from 'express';
import {
  createUserServices,
  getAllUserByCompanyIdService,
  getUserByIdService,
  updateUserService
} from '../services/user-services';
import { InsertUser } from '../model/user-model';
import { clientSupervisorMiddleware } from '../middleware';
import { securityRouter } from '../services/security/security-service';

const routerUser = Router();

routerUser.post(
  '/:company_id/user/create-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const user: InsertUser = req.body;
      const response = await createUserServices(user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerUser.put(
  '/:company_id/user/update-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const user = req.body;
      const response = await updateUserService(user.user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerUser.get(
  '/:company_id/user/get-all-users',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const response = await getAllUserByCompanyIdService(Number(company_id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerUser.get(
  '/:company_id/user/get-user/:id',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { id } = req.params;
      const response = await getUserByIdService(Number(id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerUser };
