import { Response, Request, Router } from 'express';
import {
  AssociateDepartment,
  Updatedepartment
} from '../model/department-model';
import {
  associatedepartmentService,
  createdepartmentService,
  deleteDepatmentService,
  disassociatedepartmentService,
  getDepatmentByCompanyIdService,
  updateDepatmentService
} from '../services/department-service';
import { clientSupervisorMiddleware } from '../middleware';
import { InsertUser } from '../model/user-model';
import { securityRouter } from '../services/security/security-service';

const routerdepartment = Router();

routerdepartment.post(
  '/:company_id/department/create',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const request = req.body;
      const response = await createdepartmentService(request.department);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.get(
  '/:company_id/department/get-all',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const response = await getDepatmentByCompanyIdService(Number(company_id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.post(
  '/:company_id/department/associate-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const associate: AssociateDepartment = req.body;

      const response = await associatedepartmentService(associate);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.post(
  '/:company_id/department/disassociate-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const user: InsertUser = req.body;
      const response = await disassociatedepartmentService(user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.put(
  '/:company_id/department/update',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const department: Updatedepartment = req.body;
      const response = await updateDepatmentService(department);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerdepartment.delete(
  '/:company_id/department/delete',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const department: Updatedepartment = req.body;
      const response = await deleteDepatmentService(department.department_id);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
export { routerdepartment };
