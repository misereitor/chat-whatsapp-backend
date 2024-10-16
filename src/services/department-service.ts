import { Createdepartment, Updatedepartment } from '../model/department-model';
import {
  associatedepartmentForUserRepository,
  createdepartmentRepository,
  disassociatedepartmentForUserRepository
} from '../repository/department-repository';
import { getUserById } from '../repository/user-repository';

export async function createdepartmentService(
  department: Createdepartment,
  user_id: number
) {
  try {
    await checkPermissionUserIsAdmin(user_id, department.company_id);
    const createddepartment = await createdepartmentRepository(department);
    return createddepartment;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function associatedepartmentService(
  department: Updatedepartment,
  user_id: number
) {
  try {
    await checkPermissionUserIsAdmin(user_id, department.company_id);
    await associatedepartmentForUserRepository(
      department.user_id,
      department.department_id
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function disassociatedepartmentService(
  department: Updatedepartment,
  user_id: number
) {
  try {
    await checkPermissionUserIsAdmin(user_id, department.company_id);
    await disassociatedepartmentForUserRepository(
      department.user_id,
      department.department_id
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
