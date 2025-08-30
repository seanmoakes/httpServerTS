import { compare, hash } from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UserNotAuthenticatedError } from "./api/errors.js";
import { Request } from "express";

const saltRounds = 13;

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
  return await compare(password, hash);
}
type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
  let timeNow = Math.floor(Date.now() / 1000);
  const pl: payload = {
    iss: "chirpy",
    sub: userID,
    iat: timeNow,
    exp: timeNow + expiresIn,
  };
  return jwt.sign(pl, secret);
}
export function validateJWT(tokenString: string, secret: string): string {
  try {
    const verifiedToken = jwt.verify(tokenString, secret);
    return verifiedToken.sub as string;
  } catch (error) {
    throw new UserNotAuthenticatedError(
      `Token invalid: ${(error as Error).message}`
    );
  }
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("authorization");
  if (!authHeader) {
    throw new BadRequestError("Malformedd authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new BadRequestError("Malformedd authorization header");
  }

  return splitAuth[1];
}

