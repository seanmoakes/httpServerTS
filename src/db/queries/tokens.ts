import { eq, gt, and, isNull, sql } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens, users } from "../schema.js";

export async function saveRefreshToken(token: NewRefreshToken) {
  const result = await db.insert(refreshTokens)
    .values(token)
    .onConflictDoNothing()
    .returning();
  return result[0] as NewRefreshToken;
}

export async function getToken(token: string) {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(
      eq(refreshTokens.token, token)
    );
  return result[0];
}

export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
}

export async function revokeToken(token: string) {
  const rows = await db.update(refreshTokens)
    .set({ expiresAt: new Date() })
    .where(eq(refreshTokens.token, token)).returning();

  if (rows.length === 0) {
    throw new Error("Couldn't revoke token");
  }
}
