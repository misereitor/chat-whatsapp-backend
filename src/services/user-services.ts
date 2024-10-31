import { InsertUser, User } from '../model/user-model';
import {
  activeUser,
  createUser,
  deleteUser,
  desactiveUser,
  getAllUserByCompanyId,
  getUserById,
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
import { base64ToBlob } from '../util/convertBase64InBlob';
import { uploadFileService } from './aws/s3-service';
import {
  associatedepartmentService,
  disassociateAllDepartmentService,
  disassociatedepartmentService
} from './department-service';
import { CreateCompany } from '../model/company-model';

export async function createUserServices(insertUser: InsertUser) {
  try {
    await validateBeforeCreate(insertUser);
    insertUser.password = await encryptPassword(insertUser.password);
    const newUser = await createUser(insertUser);
    await createAssociationRoleService(
      newUser.id,
      insertUser.company_id,
      insertUser.role.id
    );
    const userResponse = await getUserByLogin(newUser.login);
    userResponse.password = '';
    return userResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function replaceUserByCreateCompanyService(
  company: CreateCompany
) {
  const insertUser: InsertUser = {
    name: company.company_name,
    email: company.email,
    login: company.login,
    password: company.password,
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role:
      company.type === 'reseller'
        ? { id: 2, name: 'revendedor' }
        : { id: 3, name: 'admin' },
    phone_number: '',
    id: 0,
    company_id: 0
  };
  await validateBeforeCreateCompany(insertUser);
  return insertUser;
}

export async function getUserByIdService(id: number) {
  try {
    const user = await getUserById(id);
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUserService(user: InsertUser) {
  try {
    await valideBeforeUpdate(user);
    if (user.photo) {
      user.photo_url = await updatePhotoS3(user);
    }
    await disassociatedepartmentService(user);
    if (user.departments && user.departments?.length > 0) {
      for (const department of user.departments) {
        await associatedepartmentService(department.id, user.id);
      }
    } else {
      await disassociateAllDepartmentService(user.id);
    }

    await updateUser(user);
  } catch (error: any) {
    console.warn(error.message);
    throw new Error(error.message);
  }
}

export async function getAllUserByCompanyIdService(id: number) {
  try {
    const user = await getAllUserByCompanyId(id);
    return user;
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

async function valideBeforeUpdate(user: InsertUser) {
  try {
    schemaUpdateUser.parse(user);
    const userExist = await getUserByLogin(user.login);
    if (!userExist) return;
    if (userExist.id !== user.id) throw new Error('Usuário já está em uso');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function validateBeforeCreate(user: InsertUser) {
  try {
    schemaAddUser.parse(user);
    const roleClient = ['admin', 'supervisor', 'atendente'];
    const userExist = await getUserByLogin(user.login);
    const company = await getCompanyById(user.company_id);
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

async function validateBeforeCreateCompany(user: InsertUser) {
  try {
    schemaAddUser.parse(user);
    const userExist = await getUserByLogin(user.login);
    const roleUser = await gerRoleForId(user.role.id);
    Promise.all([userExist, roleUser]);
    if (!roleUser) throw new Error('Cargo não encontrado');
    if (userExist) throw new Error('Usuário já está em uso');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function updatePhotoS3(user: InsertUser) {
  try {
    if (user.photo) {
      const contentType =
        user.photo.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64/)?.[1] ||
        '';
      user.photoBlob = base64ToBlob(user.photo, contentType);
      const url = await uploadFileService(
        `profile/${user.login}.${user.id}.${contentType.split('/')[1]}`,
        user.photoBlob
      );
      return url;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}
