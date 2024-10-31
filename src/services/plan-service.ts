import { AssociatePlan, Plan } from '../model/plans-model';
import {
  associatePlansRepository,
  createPlansRepository,
  getAllPlansRepository,
  removeAllAssociationByCompany
} from '../repository/plans-repository';

export async function createPlanService(plan: Plan) {
  try {
    return await createPlansRepository(plan);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function AssociatePlanService(plan: AssociatePlan) {
  try {
    await removeAllAssociationByCompany(plan.company_id);
    await associatePlansRepository(plan);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllPlansService() {
  try {
    return await getAllPlansRepository();
  } catch (error: any) {
    throw new Error(error.message);
  }
}
