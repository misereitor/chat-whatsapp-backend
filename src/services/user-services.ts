import { User } from '../model/user-model';
import {
  activeUser,
  createUser,
  deleteUser,
  desactiveUser,
  getUserByLogin,
  updatePasswordUser,
  updateUser
} from '../repository/user-repository';
import {
  schemaAddUser,
  schemaUpdatePassword,
  schemaUpdateUser
} from '../schema/user-scema';
import * as bcrypt from 'bcrypt';
import { createAssociationRoleService } from './role-services';
import { getCompanyById } from '../repository/company-repository';
import { gerRoleForId } from '../repository/roles-repository';

export async function createUserServices(user: User) {
  try {
    await validateBeforeCreate(user);
    user.password = await encryptPassword(user.password);
    const newUser = await createUser(user);
    await createAssociationRoleService(
      newUser.id,
      user.company.id,
      user.role.id
    );
    const userResponse = await getUserByLogin(user.login);
    return userResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUserServices(user: User) {
  try {
    schemaUpdateUser.parse(user);
    await updateUser(user);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updatePasswordServices(user: User) {
  try {
    schemaUpdatePassword.parse(user);
    user.password = await encryptPassword(user.password);
    await updatePasswordUser(user);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function desactiveUserServer(id: number) {
  try {
    await desactiveUser(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function activeUserService(id: number) {
  try {
    await activeUser(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteUserServices(id: number) {
  try {
    await deleteUser(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function encryptPassword(password: string) {
  const hashPassword = await bcrypt.hash(password, 10);
  return hashPassword;
}

async function validateBeforeCreate(user: User) {
  try {
    schemaAddUser.parse(user);
    const roleClient = ['admin', 'supervisor', 'atendente'];
    const userExist = await getUserByLogin(user.login);
    const company = await getCompanyById(user.company.id);
    const roleUser = await gerRoleForId(user.role.id);
    Promise.all([userExist, company, roleUser]);

    if (!roleUser) throw new Error('Cargo não encontrado');
    if (!company) throw new Error('Empresa não encontrada');

    if (userExist) throw new Error('Usuário já está em uso');

    if (company.type === 'reseller' && company.users.length >= 1)
      throw new Error('Revendedor só pode ter um usuário');

    if (company.type === 'client' && !roleClient.includes(roleUser.name))
      throw new Error('Revendedor não é cliente atendente');
    const totalAdmin = company.users.filter(
      (user) => user.role.name === 'admin'
    ).length;
    const totalSupervisor = company.users.filter(
      (user) => user.role.name === 'supervisor'
    ).length;
    const totalAtentente = company.users.filter(
      (user) => user.role.name === 'atendente'
    ).length;

    if (roleUser.name === 'admin' && totalAdmin >= company.plan.max_admins)
      throw new Error('Máximo de usuário Administrador atingindo');
    if (
      roleUser.name === 'supervisor' &&
      totalSupervisor >= company.plan.max_supervisors
    )
      throw new Error('Máximo de usuário Supervisores atingindo');
    if (
      roleUser.name === 'atendente' &&
      totalAtentente >= company.plan.max_users
    )
      throw new Error('Máximo de usuário Atendente atingindo');
  } catch (error: any) {
    throw new Error(error.message);
  }
}
