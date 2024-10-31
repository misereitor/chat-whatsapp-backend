import { Response, Request, Router } from 'express';
import { superadminMiddleware } from '../middleware';
import { Plan } from '../model/plans-model';
import {
  createPlanService,
  getAllPlansService
} from '../services/plan-service';

const routerPlans = Router();

routerPlans.post(
  '/plan/create',
  superadminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const plan: Plan = req.body;
      const response = await createPlanService(plan);

      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

routerPlans.post(
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

routerPlans.put(
  '/plan/associate',
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

export { routerPlans };
