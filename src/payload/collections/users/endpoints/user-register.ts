import type { PayloadHandler } from 'payload/config';

import { upperFirst } from 'lodash';
import ValidationError from 'payload/dist/errors/ValidationError';

import { emailRegister } from '../../../mjml';
import { validateRegister } from '../utilities/validate-register';

export const userRegister: PayloadHandler = async (req, res, next): Promise<void> => {
  const { body, payload } = req;

  try {
    // Validate recaptcha
    const recaptchaSecret = process.env.GOOGLE_RECAPTCHA_SECRET;
    if (recaptchaSecret) {
      const response: {
        action?: string;
        challenge_ts?: string;
        'error-codes'?: any[];
        hostname?: string;
        score?: number;
        success: boolean;
      } = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${body.recaptchaResponse}`,
        {
          method: `POST`,
        },
      ).then(async response => response.json());

      if (!response.success) {
        res.status(403).send({ errors: [{ message: `Invalid recaptcha` }] });
        return;
      }
    }

    await validateRegister(body);

    const user = await payload.create({
      collection: `users`, // required
      data: body,
    });

    await payload.sendEmail({
      from: `${process.env.PAYLOAD_PUBLIC_SITE_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: body.email,
      subject: `Register Success - ${process.env.PAYLOAD_PUBLIC_SITE_NAME}`,
      html: emailRegister({
        name: body.name,
        siteName: process.env.PAYLOAD_PUBLIC_SITE_NAME,
        link: `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/account`,
      }),
    });

    res.send(user);
  } catch (error: any) {
    if (error.errors) {
      next(
        new ValidationError(
          error.errors.map(err => {
            return { field: err, message: upperFirst(err) };
          }),
        ),
      );
    }

    next(error);
  }
};
