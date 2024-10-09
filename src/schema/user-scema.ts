import { z } from 'zod';
import { validateNameIsNumber } from '../util/valid-user';

export const schemaAddUser = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (validateNameIsNumber(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nome não pode ter símbolos ou números',
        fatal: true
      });
    }
  }),
  email: z.string().email('Insira um e-mail válido'),
  login: z.string().min(6).max(255),
  password: z
    .string()
    .min(8, 'A senha tem que ter ao menos 8 caracteres')
    .superRefine((val, ctx) => {
      const regexNumber = !/\d/.test(val);
      const regexLetter = !/\D/.test(val);
      const regexCaracter = !/\W/.test(val);
      const regexUpperCase = !/[A-Z]/g.test(val);
      const regexLowerCase = !/[a-z]/g.test(val);
      if (regexNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter um número ' + val,
          fatal: true
        });
      }
      if (regexLetter) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter uma letra',
          fatal: true
        });
      }
      if (regexCaracter) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter um caracter como @ !',
          fatal: true
        });
      }
      if (regexLowerCase) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter uma letra minúscula',
          fatal: true
        });
      }
      if (regexUpperCase) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter uma letra maiúscula',
          fatal: true
        });
      }
    })
});

export const schemaUpdateUser = z.object({
  login: z.string().min(6).max(255),
  name: z.string().superRefine((val, ctx) => {
    if (validateNameIsNumber(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nome não pode ter símbolos ou números',
        fatal: true
      });
    }
  }),
  email: z.string().email('Insira um e-mail válido')
});

export const schemaUpdatePassword = z.object({
  password: z
    .string()
    .min(8, 'A senha tem que ter ao menos 8 caracteres')
    .superRefine((val, ctx) => {
      const regexNumber = !/\d/.test(val);
      const regexLetter = !/\D/.test(val);
      const regexCaracter = !/\W/.test(val);
      const regexUpperCase = !/[A-Z]/g.test(val);
      const regexLowerCase = !/[a-z]/g.test(val);
      if (regexNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter um número ' + val,
          fatal: true
        });
      }
      if (regexLetter) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter uma letra',
          fatal: true
        });
      }
      if (regexCaracter) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter um caracter como @ !',
          fatal: true
        });
      }
      if (regexLowerCase) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter uma letra minúscula',
          fatal: true
        });
      }
      if (regexUpperCase) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A senha precisa ter uma letra maiúscula',
          fatal: true
        });
      }
    })
});

export type AddUserSchema = z.infer<typeof schemaAddUser>;
export type UpdatePasswordSchema = z.infer<typeof schemaUpdatePassword>;
export type UpdateUserSchema = z.infer<typeof schemaUpdateUser>;
