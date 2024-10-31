import { Createdepartment, Updatedepartment } from '../model/department-model';
import { InsertUser } from '../model/user-model';
import {
  associatedepartmentForUserRepository,
  createdepartmentRepository,
  deletedepartmentRepository,
  disassociateAllDepartmentForUserRepository,
  disassociatedepartmentForUserRepository,
  getDepartmentByCompanyId,
  getDepartmentByCompanyIdAndName,
  getDepartmentById,
  updatedepartmentRepository
} from '../repository/department-repository';
import { getUserById } from '../repository/user-repository';

export async function createdepartmentService(department: Createdepartment) {
  try {
    const departmentExist = await getDepartmentByCompanyIdAndName(
      department.name,
      department.company_id
    );
    if (departmentExist) throw new Error('Department already exists');
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

export async function disassociatedepartmentService(userUpate: InsertUser) {
  try {
    const user = await getUserById(userUpate.id);
    if (!user) throw new Error('User not found');
    user.departments.forEach(async (department) => {
      const departmentExist = userUpate.departments?.find(
        (departmentUser) => departmentUser.id === department.id
      );
      if (!departmentExist) {
        await disassociatedepartmentForUserRepository(user.id, department.id);
      }
    });
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

export async function updateDepatmentService(department: Updatedepartment) {
  try {
    const getDepartment = await getDepartmentById(department.department_id);
    if (!getDepartment) throw new Error('Departamento não encontrado');
    const depatments = await updatedepartmentRepository(department);
    return depatments;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteDepatmentService(department_id: number) {
  try {
    const depatments = await deletedepartmentRepository(department_id);
    return depatments;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
