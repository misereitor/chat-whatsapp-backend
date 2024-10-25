import { Response, Request, Router } from 'express';
import { clientSupervisorMiddleware } from '../middleware';
import {
  createCompanyServices,
  getAllCompanyServices,
  getCompanyByCPNJServices,
  getCompanyByIdServices
} from '../services/company-service';
import { Company } from '../model/company-model';
import { valideTokenUserAdminService } from '../services/auth-service';

const routerCompany = Router();

routerCompany.post(
  '/company/create-company',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const company: Company = req.body;
      const response = await createCompanyServices(company);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerCompany.post(
  '/company/get-all-company',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token: string | undefined = req.headers.authorization;
      const responseToken: any = await valideTokenUserAdminService(token);
      const response = await getAllCompanyServices(responseToken);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerCompany.post(
  '/company/get-company-by-id/:id',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await getCompanyByIdServices(Number(id));
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerCompany.post(
  '/company/get-company-by-cnpj/:cnpj',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { cnpj } = req.params;
      const response = await getCompanyByCPNJServices(cnpj);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerCompany };
