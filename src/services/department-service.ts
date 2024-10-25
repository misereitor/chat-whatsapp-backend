import { Createdepartment } from '../model/department-model';
import {
  associatedepartmentForUserRepository,
  createdepartmentRepository,
  disassociateAllDepartmentForUserRepository,
  disassociatedepartmentForUserRepository,
  getDepartmentByCompanyId
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
  department_id: number,
  user_id: number
) {
  try {
    const user = await getUserById(user_id);
    if (!user) throw new Error('User not found');
    const departmentExist = user.departments.find(
      (department) => department.id === department_id
    );
    if (departmentExist) return;
    await associatedepartmentForUserRepository(user_id, department_id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function disassociatedepartmentService(
  department_id: number,
  user_id: number
) {
  try {
    const user = await getUserById(user_id);
    if (!user) throw new Error('User not found');
    const departmentExist = user.departments.find(
      (department) => department.id !== department_id
    );
    if (!departmentExist) return;
    console.log(departmentExist);
    await disassociatedepartmentForUserRepository(user_id, departmentExist.id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function disassociateAllDepartmentService(user_id: number) {
  try {
    await disassociateAllDepartmentForUserRepository(user_id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getDepatmentByCompanyIdService(company_id: number) {
  try {
    const depatments = await getDepartmentByCompanyId(company_id);
    return depatments;
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
