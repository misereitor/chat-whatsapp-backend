import { Response, Request, Router } from 'express';
import { Updatedepartment } from '../model/department-model';
import {
  associatedepartmentService,
  createdepartmentService,
  deleteDepatmentService,
  disassociatedepartmentService,
  getDepatmentByCompanyIdService,
  updateDepatmentService
} from '../services/department-service';
import { clientSupervisorMiddleware } from '../middleware';
import { valideTokenUserAdminService } from '../services/auth-service';
import { InsertUser } from '../model/user-model';

const routerdepartment = Router();

routerdepartment.post(
  '/department/create',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const request = req.body;
      const response = await createdepartmentService(request.department);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.post(
  '/department/get-all-by-company/:id',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const companyId: number = parseInt(req.params.id);
      const response = await getDepatmentByCompanyIdService(companyId);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.post(
  '/department/associate-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const department: Updatedepartment = req.body;
      const token: string | undefined = req.headers.authorization;
      const tokenValid: any = await valideTokenUserAdminService(token);
      const response = await associatedepartmentService(
        department.department_id,
        tokenValid.id
      );
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.post(
  '/department/disassociate-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user: InsertUser = req.body;
      const response = await disassociatedepartmentService(user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.put(
  '/department/update',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const department: Updatedepartment = req.body;
      const response = await updateDepatmentService(department);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.delete(
  '/department/delete',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const department: Updatedepartment = req.body;
      const response = await deleteDepatmentService(department.department_id);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
export { routerdepartment };
