import * as bcrypt from 'bcrypt';

const salt = await bcrypt.genSalt(10);

async function hashPassword(password: string) {
  return await bcrypt.hash(password, salt);
}

async function comparePasswords(x: string, y: string) {
  return await bcrypt.compare(x, y);
}

export { hashPassword, comparePasswords };
