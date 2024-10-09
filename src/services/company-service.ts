import { Company } from '../model/company-model';
import {
  activeCompany,
  createCompany,
  desactiveCompany,
  getAllCompanies,
  getCompanyByCPNJ,
  getCompanyById,
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

export async function getAllCompanyServices() {
  try {
    const company = await getAllCompanies();
    return company;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
