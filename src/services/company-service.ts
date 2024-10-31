import { Company, CreateCompany } from '../model/company-model';
import { AssociatePlan } from '../model/plans-model';
import { User } from '../model/user-model';
import {
  activeCompany,
  createCompany,
  desactiveCompany,
  getAllCompanies,
  getCompanyByCPNJ,
  getCompanyById,
  getCompanyByRevendedorId,
  getCompanyForSelectByRevendedor,
  getCompanyForSelectSuperAdmin,
  updateCompany
} from '../repository/company-repository';
import { AssociatePlanService } from './plan-service';
import {
  createUserServices,
  replaceUserByCreateCompanyService
} from './user-services';

export async function createCompanyServices(company: CreateCompany) {
  try {
    const companyExist = await getCompanyByCPNJServices(company.cnpj);
    const createUser = await replaceUserByCreateCompanyService(company);

    if (companyExist && companyExist.type === company.type)
      throw new Error('CNPJ já cadastrado e é ' + companyExist.type);

    const newCompany = await createCompany(company);

    const plan: AssociatePlan = {
      company_id: newCompany.id,
      plan_id: 1
    };

    await AssociatePlanService(plan);

    createUser.company_id = newCompany.id;
    createUser.id = newCompany.id;

    await createUserServices(createUser);

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

export async function getAllCompanyForSelect(user: User) {
  try {
    switch (user.role.id) {
      case 1:
        return await getCompanyBySuperAdminForSelect();
      case 2:
        return await getCompanyByRevendedorForSelect(user);
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

async function getCompanyBySuperAdminForSelect() {
  return await getCompanyForSelectSuperAdmin();
}

async function getCompanyByRevendedorForSelect(user: User) {
  return await getCompanyForSelectByRevendedor(user.company.id);
}
