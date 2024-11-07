import { getCompanyById } from '../../repository/company-repository';
import { valideTokenUserAdminService } from '../auth-service';

export async function securityRouter(
  token: string,
  company_id: number | undefined
) {
  try {
    const response: any = await valideTokenUserAdminService(token);
    if (response.user.role.name === 'superadmin') return response.user;
    if (!company_id) throw new Error('não autorizado');
    const company = await getCompanyById(company_id);
    if (!company) throw new Error('não autorizado');

    if (response.user.role.name === 'revendedor') {
      if (response.user.company.id !== company.dealer_id)
        throw new Error('não autorizado');
    }

    if (response.user.company.id !== company_id)
      throw new Error('não autorizado');

    return response.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
