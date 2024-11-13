import { Response, Request, Router } from 'express';
import { superadminMiddleware } from '../middleware';
import {
  AssociatePlanService,
  createPlanService,
  deletePlanService,
  getAllPlansService,
  updatePlanService
} from '../services/plan-service';
import { securityRouter } from '../services/security/security-service';

const routerPlans = Router();

routerPlans.post(
  '/plan/create',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const response = await createPlanService(data.plan);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerPlans.get(
  '/plan/get-all',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const response = await getAllPlansService();

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerPlans.post(
  '/:company_id/plan/associate',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string;
      const { company_id } = req.params;
      await securityRouter(token, Number(company_id));

      const { plan } = req.body;
      const response = await AssociatePlanService(plan);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerPlans.put(
  '/plan/update',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;
      await updatePlanService(plan);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerPlans.delete(
  '/plan/delete/:id',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deletePlanService(Number(id));
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export { routerPlans };
