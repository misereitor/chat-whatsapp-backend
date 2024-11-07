import { AssociatePlan, Plan } from '../model/plans-model';
import {
  associatePlansRepository,
  createPlansRepository,
  deletePlansRepository,
  getAllPlansRepository,
  getPlanByAssociationRepository,
  getPlanByIdRepository,
  getPlanByNameRepository,
  removeAllAssociationPlanByCompany,
  updatePlansRepository
} from '../repository/plans-repository';

export async function createPlanService(plan: Plan) {
  try {
    const planExist = await getPlanByNameRepository(plan.name);
    if (planExist) throw new Error('Nome do plano já cadastrado');
    return await createPlansRepository(plan);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function AssociatePlanService(plan: AssociatePlan) {
  try {
    await removeAllAssociationPlanByCompany(plan.company_id);
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

export async function updatePlanService(plan: Plan) {
  try {
    const planExist = await getPlanByIdRepository(plan.id);
    if (!planExist) throw new Error('Plano não encontrado');
    await updatePlansRepository(plan);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deletePlanService(id: number) {
  try {
    const planExist = await getPlanByIdRepository(id);
    if (!planExist) throw new Error('Plano não encontrado');
    const associate = await getPlanByAssociationRepository(id);
    if (associate.length > 0)
      throw new Error('Plano associado a outras empresas');
    await deletePlansRepository(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
