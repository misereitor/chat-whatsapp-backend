import { Login } from '../model/auth-model';
import { User } from '../model/user-model';
import { getUserByLogin } from '../repository/user-repository';
import * as bcrypt from 'bcrypt';
import * as JWT from 'jsonwebtoken';

const { SECRET_USER } = process.env;
export async function loginService(login: Login) {
  try {
    const userExist = await getUserByLogin(login.login);
    if (!userExist) throw new Error('Usuário e/ou senha incorreto');
    await chackPassword(userExist, login.password);
    const token = createToken(userExist);
    return { token, user: userExist };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function valideTokenUserAdminService(token: string | undefined) {
  try {
    const date = new Date();
    if (!token) throw new Error('Token invalid');
    const bearer = token.split(' ')[1];
    const decoded = JWT.verify(bearer, SECRET_USER as string);
    if (decoded === null) throw new Error('Token invalid');
    if (typeof decoded === 'string') throw new Error('Token invalid');
    if (date.getTime() > Number(decoded.exp) * 1000)
      return new Error('Token expired');
    return decoded;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function chackPassword(user: User, password: string) {
  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Login ou senha inválidos');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

function createToken(user: User) {
  try {
    const token = JWT.sign(
      {
        id: user.id,
        login: user.login,
        roles: user.role,
        company: user.company
      },
      SECRET_USER as string,
      {
        expiresIn: '30d'
      }
    );
    return token;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
