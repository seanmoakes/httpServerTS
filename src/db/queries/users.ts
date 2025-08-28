import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, User, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const result = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result[0] as User;
}

export async function getUsers() {
  const result = await db.select().from(users);
  return result;
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return result[0];
}

export async function reset() {
  await db.delete(users);
}
