import { object, ref, string } from 'yup';

import type { User } from '../../../payload-types';
export const validateRegister = async (user: User): Promise<void> => {
  await object({
    roles: string().oneOf([`user`]),
    name: string()
      .required()
      .matches(/^[\w ]*$/gm, {
        message: `Name should only contains alphanumeric, underscore and space`,
      }),
    email: string().email().required(),
    country: string()
      .required()
      .matches(/^[a-z\d().,\-\s]+$/i, {
        message: `Invalid country`,
      }),
    password: string().required(),
    confirmPassword: string()
      .required()
      .oneOf([ref(`password`), null], `Confirm passwords doesn\`t match`),
  }).validate(user, { abortEarly: false });
};
