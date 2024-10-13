import { Response, Request, Router } from 'express';
import {
  CreateDepartament,
  UpdateDepartament
} from '../model/departament-model';
import {
  associateDepartamentService,
  createDepartamentService,
  disassociateDepartamentService
} from '../services/departament-service';
import { clientSupervisorMiddleware } from '../middleware';
import { valideTokenUserAdminService } from '../services/auth-service';

const routerDepartament = Router();

routerDepartament.post(
  '/departament/create',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const departament: CreateDepartament = req.body;
      const token: string | undefined = req.headers.authorization;
      const tokenValid: any = await valideTokenUserAdminService(token);
      const response = await createDepartamentService(
        departament,
        tokenValid.id
      );
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerDepartament.post(
  '/departament/associate-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const departament: UpdateDepartament = req.body;
      const token: string | undefined = req.headers.authorization;
      const tokenValid: any = await valideTokenUserAdminService(token);
      const response = await associateDepartamentService(
        departament,
        tokenValid.id
      );
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerDepartament.post(
  '/departament/disassociate-user',
  clientSupervisorMiddleware,
  async (req: Request, res: Response) => {
    try {
      const departament: UpdateDepartament = req.body;
      const token: string | undefined = req.headers.authorization;
      const tokenValid: any = await valideTokenUserAdminService(token);
      const response = await disassociateDepartamentService(
        departament,
        tokenValid.id
      );
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
export { routerDepartament };
