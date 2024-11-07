import { Response, Request, Router } from 'express';
import { clientSupervisorMiddleware } from '../middleware';
import {
  createCompanyServices,
  getAllCompanyForSelect,
  getAllCompanyServices,
  getCompanyByCPNJServices,
  getCompanyByIdServices
} from '../services/company-service';
import { CreateCompany } from '../model/company-model';
import { securityRouter } from '../services/security/security-service';

const routerCompany = Router();

routerCompany.post(
  '/:company_id/company/create-company',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const company: CreateCompany = req.body;
      const response = await createCompanyServices(company);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerCompany.get(
  '/:company_id/company/get-all-company',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      const user: any = await securityRouter(token, Number(company_id));

      const response = await getAllCompanyServices(user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerCompany.get(
  '/:company_id/company/get-company-by-id/:id',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { id } = req.params;
      const response = await getCompanyByIdServices(Number(id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerCompany.get(
  '/:company_id/company/get-company-by-cnpj/:cnpj',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { cnpj } = req.params;
      const response = await getCompanyByCPNJServices(cnpj);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerCompany.get(
  '/:company_id/company/get-company-for-select/',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      const user = await securityRouter(token, Number(company_id));

      const response = await getAllCompanyForSelect(user);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerCompany };
