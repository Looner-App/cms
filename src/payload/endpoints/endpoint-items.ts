import type { PayloadHandler } from 'payload/config';

import payload from 'payload';
import { APIError } from 'payload/errors';

import { emailClaimItem } from '../mjml';
import { checkRole } from '../utilities';

export const getItem: PayloadHandler = async (req, res, next) => {
  if (!checkRole([`admin`, `user`], req.user)) {
    return res.status(404).json({ errors: [{ message: `You are not logged in` }] });
  }

  try {
    const barcode = req.params.barcode;

    const result = await payload.find({
      collection: `items`,
      where: {
        barcode: { equals: barcode },
        claimedBy: { equals: null },
      },
    });
    if (result && result.docs.length > 0) {
      const data = result.docs[0];
      return res.json({
        data,
        message: `You found item <b>${data.title}</b>`,
      });
    } else {
      throw new APIError(`Item not found`, 404);
    }
  } catch (error) {
    next(error);
  }

  next(new APIError(`Item not found`, 404));
};

export const claimItem: PayloadHandler = async (req, res, next) => {
  if (!checkRole([`admin`, `user`], req.user)) {
    return res.status(404).json({ errors: [{ message: `You are not logged in` }] });
  }

  try {
    const barcode = req.params.barcode;
    const user = req.user;

    const result = await payload.update({
      collection: `items`,
      where: {
        barcode: { equals: barcode },
        claimedBy: { equals: null },
      },
      data: {
        claimedBy: user.id,
        claimedAt: new Date(),
      },
    });

    if (result && result.docs.length > 0) {
      const itemName = result.docs[0].title as string;

      await payload.sendEmail({
        from: `${process.env.PAYLOAD_PUBLIC_SITE_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: user.email,
        subject: `You got item ${itemName} - ${process.env.PAYLOAD_PUBLIC_SITE_NAME}`,
        html: emailClaimItem({
          itemName,
          name: user.name as string,
          link: `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/account`,
        }),
      });

      return res.json({ message: `Claim success` });
    } else {
      throw new APIError(`Item not found`, 404);
    }
  } catch (error) {
    next(error);
  }

  next(new APIError(`Item not found`, 404));
};
