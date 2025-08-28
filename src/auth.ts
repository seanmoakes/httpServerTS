import { compare, hash } from "bcrypt";

const saltRounds = 13;

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
  return await compare(password, hash);
}
