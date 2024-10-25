import { Company } from '../model/company-model';
import { User } from '../model/user-model';
import {
  activeCompany,
  createCompany,
  desactiveCompany,
  getAllCompanies,
  getCompanyByCPNJ,
  getCompanyById,
  getCompanyByRevendedorId,
  updateCompany
} from '../repository/company-repository';

export async function createCompanyServices(company: Company) {
  try {
    const companyExist = await getCompanyByCPNJServices(company.cnpj);
    if (companyExist && companyExist.type === company.type)
      throw new Error('CNPJ já cadastrado e é ' + companyExist.type);
    const newCompany = await createCompany(company);
    return newCompany;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateCompanyServices(company: Company) {
  try {
    await updateCompany(company);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function desactiveCompanyServices(id: number) {
  try {
    await desactiveCompany(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function activeCompanyServices(id: number) {
  try {
    await activeCompany(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getCompanyByCPNJServices(cnpj: string) {
  try {
    const company = await getCompanyByCPNJ(cnpj);
    return company;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getCompanyByIdServices(id: number) {
  try {
    const company = await getCompanyById(id);
    return company;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllCompanyServices(user: User) {
  try {
    switch (user.role.id) {
      case 1:
        return await getCompanyBySuperAdmin();
      case 2:
        return await getCompanyByRevendedor(user);
      case 3:
        return [await getCompanyByIdServices(user.company.id)];
      case 4:
        return await getCompanyBySupervisor(user);

      default:
        break;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getCompanyBySuperAdmin() {
  return await getAllCompanies();
}

async function getCompanyByRevendedor(user: User) {
  return [await getCompanyByRevendedorId(user.company.id)];
}

async function getCompanyBySupervisor(user: User) {
  const company: Company[] = [];
  for (const department of user.departments) {
    if (company.length == 0) {
      company.push(await getCompanyByIdServices(department.id));
    } else {
      const companyDepatment = await getCompanyByIdServices(department.id);
      company[0].users.push(...companyDepatment.users);
    }
  }
  return company;
}
