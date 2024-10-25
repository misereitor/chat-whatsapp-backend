import { Response, Request, Router } from 'express';
import {
  createUserServices,
  getAllUserByCompanyIdService,
  getUserByIdService,
  updateUserService
} from '../services/user-services';
import { InsertUser } from '../model/user-model';
import { clientSupervisorMiddleware } from '../middleware';

const routerUser = Router();

routerUser.post(
  '/user/create-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user: InsertUser = req.body;
      const response = await createUserServices(user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerUser.put(
  '/user/update-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = req.body;
      const response = await updateUserService(user.user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerUser.post(
  '/user/get-all-users',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { company_id } = req.body;
      const response = await getAllUserByCompanyIdService(Number(company_id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerUser.post(
  '/user/get-user/:id',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await getUserByIdService(Number(id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerUser };
