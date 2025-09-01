import type { Request, Response } from "express";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./users.js";
import { config } from "../config.js";
import { saveRefreshToken, getUserFromRefreshToken, revokeToken } from "../db/queries/tokens.js";

type TokenResponse = {
  token: string;
};

type LoginResponse = UserResponse & TokenResponse & {
  refreshToken: string;
};

export async function handlerUsersLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  const user = await getUserByEmail(params.email);

  if (!user) {
    throw new UserNotAuthenticatedError("Incorrect email or password");
  }

  const validPassword = await checkPasswordHash(params.password, user.hashedPassword);
  if (!validPassword) {
    throw new UserNotAuthenticatedError("Incorrect email or password");
  }

  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret,
  );

  let expiresAt = new Date();
  expiresAt.setDate(new Date().getDate() + 60);

  const refreshToken = makeRefreshToken();
  const dbToken = await saveRefreshToken({ token: refreshToken, userId: user.id, expiresAt: expiresAt });

  if (!dbToken) {
    throw new UserNotAuthenticatedError("Could not save refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
    refreshToken: refreshToken
  } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
  const token = getBearerToken(req);
  //const refreshToken = await getToken(token);

  const result = await getUserFromRefreshToken(token);
  if (!result) {
    throw new UserNotAuthenticatedError("Invalid refresh token");
  }
  const user = result.user;
  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret,
  );

  respondWithJSON(res, 200, {
    token: accessToken,
  } satisfies TokenResponse);
}

export async function handlerRevoke(req: Request, res: Response) {
  const token = getBearerToken(req);
  await revokeToken(token);

  res.status(204).send();
}
