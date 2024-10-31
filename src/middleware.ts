import { NextFunction, Request, Response } from 'express';
import { valideTokenUserAdminService } from './services/auth-service';
import { ClienteRequest } from './model/request-model';

export async function superadminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token: string | undefined = req.headers.authorization;
  const body: ClienteRequest = req.body;
  const response: any = await valideTokenUserAdminService(token);
  if (response.role.id !== body.company_id)
    throw new Error(
      JSON.stringify({ success: false, message: 'não autorizado' })
    );
  next();
}

export async function clientChatMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roleClient = ['admin', 'supervisor', 'atendente'];
    const token: string | undefined = req.headers.authorization;
    const body: ClienteRequest = req.body;
    const response: any = await valideTokenUserAdminService(token);
    if (response.company.id != body.company_id)
      throw new Error(
        JSON.stringify({ success: false, message: 'não autorizado' })
      );
    if (!roleClient.includes(response.role.name))
      throw new Error(
        JSON.stringify({ success: false, message: 'não autorizado' })
      );
    next();
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export async function clientSupervisorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roleClient = ['admin', 'supervisor'];
    const token: string | undefined = req.headers.authorization;
    const body: ClienteRequest = req.body;
    const response: any = await valideTokenUserAdminService(token);
    if (response.role.id === 1) return next();
    if (response.company.id != body.company_id)
      throw new Error(
        JSON.stringify({ success: false, message: 'não autorizado' })
      );
    if (!roleClient.includes(response.role.name))
      throw new Error(
        JSON.stringify({ success: false, message: 'não autorizado' })
      );
    return next();
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}
