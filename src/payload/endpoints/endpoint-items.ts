import type { PayloadHandler } from 'payload/config';

import payload from 'payload';
import { APIError } from 'payload/errors';
import { v4 as uuidv4 } from 'uuid';

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
      return res.json({ message: `Claim success` });
    } else {
      throw new APIError(`Item not found`, 404);
    }
  } catch (error) {
    next(error);
  }

  next(new APIError(`Item not found`, 404));
};

export const generateItem: PayloadHandler = async (req, res, next) => {
  if (!checkRole([`admin`, `user`], req.user)) {
    return res.status(404).json({ errors: [{ message: `You are not logged in` }] });
  }

  try {
    const { lat, lng } = req.body;

    // Check if there's an item within 100 meters
    const nearbyItems = await payload.find({
      collection: `items`,
      where: {
        location: {
          near: {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            maxDistanceInMeters: 100,
          },
        },
      },
    });

    if (nearbyItems.docs.length > 0) {
      return res.status(400).json({ message: `An item already exists within 100 meters` });
    }

    // Generate a new item
    const newItem = await req.payload.create({
      collection: `items`,
      data: {
        title: `Item at ${lat}, ${lng}`,
        publicUniqueLink: true,
        category: `6709358e49ec899574a30cfd`, // TODO: replace with your own category ID
        location: [parseFloat(lng), parseFloat(lat)],
        image: null,
        desc: `Auto-generated item at coordinates ${lat}, ${lng}`,
        barcode: uuidv4(),
      },
    });

    return res.json({
      data: newItem,
      message: `New item generated successfully`,
    });
  } catch (error) {
    next(error);
  }
};
