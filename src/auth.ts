import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { randomBytes } from "crypto";

import { Request } from "express";
import { BadRequestError, UserNotAuthenticatedError } from "./api/errors.js";

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 13;
  return bcrypt.hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: TOKEN_ISSUER,
      sub: userID,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );

  return token;
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (error) {
    throw new UserNotAuthenticatedError(`Invalid token`);
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError(`Invalid issuer`);
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError(`No user ID in token`);
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string,) {
  return extractAuthVal(header, "Bearer");
}

export function getApiKey(req: Request): string {
  const authHeader = req.get("authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  return extractApiKey(authHeader);
}

export function extractApiKey(header: string) {
  return extractAuthVal(header, "ApiKey");
}

export function extractAuthVal(header: string, key: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== key) {
    throw new BadRequestError("Malformed authorization header");
  }

  return splitAuth[1];
}

export function makeRefreshToken() {
  return randomBytes(32).toString('hex');
}
