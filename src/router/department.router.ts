import { Response, Request, Router } from 'express';
import { Createdepartment, Updatedepartment } from '../model/department-model';
import {
  associatedepartmentService,
  createdepartmentService,
  disassociatedepartmentService,
  getDepatmentByCompanyIdService
} from '../services/department-service';
import { clientSupervisorMiddleware } from '../middleware';
import { valideTokenUserAdminService } from '../services/auth-service';

const routerdepartment = Router();

routerdepartment.post(
  '/department/create',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const department: Createdepartment = req.body;
      const token: string | undefined = req.headers.authorization;
      const tokenValid: any = await valideTokenUserAdminService(token);
      const response = await createdepartmentService(department, tokenValid.id);
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
      const department: Updatedepartment = req.body;
      const token: string | undefined = req.headers.authorization;
      const tokenValid: any = await valideTokenUserAdminService(token);
      const response = await disassociatedepartmentService(
        department.department_id,
        tokenValid.id
      );
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
export { routerdepartment };
