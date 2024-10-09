import {
  createAssociationRole,
  updateAssociationRole
} from '../repository/roles-repository';

export async function createAssociationRoleService(
  user_id: number,
  company_id: number,
  role_id: number
) {
  try {
    await createAssociationRole(user_id, company_id, role_id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateAssociationRoleService(
  user_id: number,
  company_id: number,
  role_id: number
) {
  try {
    await updateAssociationRole(user_id, company_id, role_id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
