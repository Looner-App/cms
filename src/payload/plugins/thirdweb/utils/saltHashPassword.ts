import crypto from 'crypto';

type Args = {
  password: string;
};

function randomBytes(): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    crypto.randomBytes(32, (err, saltBuffer) => (err ? reject(err) : resolve(saltBuffer))),
  );
}

function pbkdf2Promisified(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    crypto.pbkdf2(password, salt, 25000, 512, `sha256`, (err, hashRaw) =>
      err ? reject(err) : resolve(hashRaw),
    ),
  );
}

export const saltHashGenerator = async ({
  password,
}: Args): Promise<{ hash: string; salt: string }> => {
  const saltBuffer = await randomBytes();
  const salt = saltBuffer.toString(`hex`);

  const hashRaw = await pbkdf2Promisified(password, salt);
  const hash = hashRaw.toString(`hex`);

  return { hash, salt };
};
