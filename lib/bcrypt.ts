const chars = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');

function generateSalt(length: number = 16): string {
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += chars[Math.floor(Math.random() * chars.length)];
  }
  return salt;
}

async function hashInternal(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `$2a$${salt}$${hashHex}`;
}

async function genSalt(rounds: number = 10): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const salt = generateSalt(22);
      resolve(salt);
    }, 10);
  });
}

async function hash(password: string, saltOrRounds: string | number): Promise<string> {
  let salt: string;
  if (typeof saltOrRounds === 'number') {
    salt = await genSalt(saltOrRounds);
  } else {
    salt = saltOrRounds;
  }
  return await hashInternal(password, salt);
}

async function compare(password: string, hashed: string): Promise<boolean> {
  const parts = hashed.split('$');
  if (parts.length !== 4) return false;

  const salt = parts[2];
  const expectedHash = parts[3];

  const calculated = await hashInternal(password, salt);
  return calculated === hashed;
}

const bcrypt = {
  genSalt,
  hash,
  compare
};

export default bcrypt;
