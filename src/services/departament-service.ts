import {
  CreateDepartament,
  UpdateDepartament
} from '../model/departament-model';
import {
  associateDepartamentForUserRepository,
  createDepartamentRepository,
  disassociateDepartamentForUserRepository
} from '../repository/departament-repository';
import { getUserById } from '../repository/user-repository';

export async function createDepartamentService(
  departament: CreateDepartament,
  user_id: number
) {
  try {
    await checkPermissionUserIsAdmin(user_id, departament.company_id);
    const createdDepartament = await createDepartamentRepository(departament);
    return createdDepartament;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function associateDepartamentService(
  departament: UpdateDepartament,
  user_id: number
) {
  try {
    await checkPermissionUserIsAdmin(user_id, departament.company_id);
    await associateDepartamentForUserRepository(
      departament.user_id,
      departament.departament_id
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function disassociateDepartamentService(
  departament: UpdateDepartament,
  user_id: number
) {
  try {
    await checkPermissionUserIsAdmin(user_id, departament.company_id);
    await disassociateDepartamentForUserRepository(
      departament.user_id,
      departament.departament_id
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function checkPermissionUserIsAdmin(user_id: number, company_id: number) {
  const user = await getUserById(user_id);
  if (!user) throw new Error('User not found');
  if (user.role.id === 1) {
    return true;
  }
  if (user.company.id !== company_id) {
    throw new Error('User not authorized');
  }
  if (user.role.id === 3) {
    return true;
  }
  throw new Error('User not authorized');
}
