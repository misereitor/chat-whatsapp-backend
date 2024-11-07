import { Response, Request, Router } from 'express';
import { superadminMiddleware } from '../middleware';
import {
  AssociateModuleService,
  createModuleService,
  deleteModuleService,
  getAllModulesService,
  updateModuleService
} from '../services/module-service';

const routerModules = Router();

routerModules.post(
  '/module/create',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { module } = req.body;
      const response = await createModuleService(module);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerModules.get(
  '/module/get-all',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const response = await getAllModulesService();

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerModules.put(
  '/module/associate',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { module } = req.body;
      const response = await AssociateModuleService(module);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerModules.put(
  '/module/update',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { module } = req.body;
      await updateModuleService(module);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerModules.delete(
  '/module/delete/:id',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deleteModuleService(Number(id));
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerModules };
