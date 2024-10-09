import { Response, Request, Router } from 'express';
import { Login } from '../model/auth-model';
import {
  loginService,
  valideTokenUserAdminService
} from '../services/auth-service';
import { clientRoute } from '../middleware';

const routerAuth = Router();

routerAuth.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const login: Login = req.body;
    const response = await loginService(login);
    res.status(200).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

routerAuth.post(
  '/auth/valid-token',
  clientRoute,
  async (req: Request, res: Response) => {
    try {
      const token: string | undefined = req.headers.authorization;
      const response = await valideTokenUserAdminService(token);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
export { routerAuth };
