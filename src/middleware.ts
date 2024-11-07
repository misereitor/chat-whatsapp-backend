import { NextFunction, Request, Response } from 'express';
import { valideTokenUserAdminService } from './services/auth-service';

export async function superadminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token: string | undefined = req.headers.authorization;
    const response: any = await valideTokenUserAdminService(token);
    if (response.user.role.name !== 'superadmin')
      throw new Error(
        JSON.stringify({ success: false, message: 'não autorizado' })
      );
    next();
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
}

export async function clientChatMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roleClient = ['admin', 'supervisor', 'atendente'];
    const token: string | undefined = req.headers.authorization;
    const response: any = await valideTokenUserAdminService(token);
    if (!roleClient.includes(response.user.role.name))
      throw new Error(
        JSON.stringify({ success: false, message: 'não autorizado' })
      );
    next();
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
}

export async function clientSupervisorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roleClient = ['admin', 'supervisor', 'superadmin'];
    const token: string | undefined = req.headers.authorization;
    const response: any = await valideTokenUserAdminService(token);
    if (response.user.role.id === 1) return next();
    if (!roleClient.includes(response.user.role.name))
      throw new Error(
        JSON.stringify({ success: false, message: 'não autorizado' })
      );
    return next();
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
}
