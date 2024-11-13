import { AssociateModule, Modules } from '../model/module-model';
import {
  associateModuleRepository,
  createModuleRepository,
  deleteModuleRepository,
  getAllModulesRepository,
  getModuleByAssociationRepository,
  getModuleByIdRepository,
  getModulesByNameRepository,
  removeAllAssociationModuleByCompany,
  updateModuleRepository
} from '../repository/module-repository';

export async function createModuleService(module: Modules) {
  try {
    const moduleExist = await getModulesByNameRepository(module.name);
    if (moduleExist) throw new Error('Nome do modulo já cadastrado');
    return await createModuleRepository(module);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function AssociateModuleService(module: AssociateModule[]) {
  try {
    await removeAllAssociationModuleByCompany(module[0].company_id);
    for (const associate of module) {
      await associateModuleRepository(associate);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllModulesService() {
  try {
    return await getAllModulesRepository();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateModuleService(module: Modules) {
  try {
    const moduleExist = await getModuleByIdRepository(module.id);
    if (!moduleExist) throw new Error('Moduleo não encontrado');
    await updateModuleRepository(module);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteModuleService(id: number) {
  try {
    const moduleExist = await getModuleByIdRepository(id);
    if (!moduleExist) throw new Error('Moduleo não encontrado');
    const associate = await getModuleByAssociationRepository(id);
    if (associate.length > 0)
      throw new Error('Moduleo associado a outras empresas');
    await deleteModuleRepository(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
