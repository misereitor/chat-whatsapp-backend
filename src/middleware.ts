import { NextFunction, Request, Response } from 'express';
import { valideTokenUserAdminService } from './services/auth-service';
import { ClienteRequest } from './model/request-model';

export async function superadminRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token: string | undefined = req.headers.authorization;
  const body: ClienteRequest = req.body;
  const response: any = await valideTokenUserAdminService(token);
  if (response.roles[0].company.id !== body.company_id)
    throw new Error('não autorizado');
  next();
}

export async function clientRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roleClient = ['admin', 'supervisor', 'atendente'];
    const token: string | undefined = req.headers.authorization;
    const body: ClienteRequest = req.body;
    const response: any = await valideTokenUserAdminService(token);
    if (response.company.id !== body.company_id)
      throw new Error('não autorizado');
    if (!roleClient.includes(response.roles.name))
      throw new Error('não autorizado');
    next();
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}
