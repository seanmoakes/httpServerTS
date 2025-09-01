import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { eq } from "drizzle-orm"

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps() {
  return db.select().from(chirps);
}

export async function getChirpById(id: string) {
  const result = await db.select().from(chirps).where(eq(chirps.id, id));
  if (result.length === 0) { return; }
  return result[0];
}

export async function getChirpsByAuthor(userId: string) {
  const rows = await db.select()
    .from(chirps)
    .where(eq(chirps.userId, userId));

  return rows;
}

export async function deleteChirp(id: string) {
  const rows = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return rows.length > 0;
}

export async function reset() {
  await db.delete(chirps);
}
