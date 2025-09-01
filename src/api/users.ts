import type { Request, Response } from "express";

import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser, updateUser, upgradeUser } from "../db/queries/users.js";
import { getApiKey, getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError(`Missing required fields`);
  }

  const hashedPassword = await hashPassword(params.password);
  const user = await createUser({
    hashedPassword,
    email: params.email
  } satisfies NewUser);


  if (!user) {
    throw new Error(`Could not creae user"`);
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

export async function handlerUpdateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError(`Missing required fields`);
  }

  const hashedPassword = await hashPassword(params.password);
  const user = await updateUser(userId, params.email, hashedPassword);

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

export async function handlerUpgradeUser(req: Request, res: Response) {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const params: parameters = req.body;

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const apiKey = getApiKey(req);
  if (apiKey !== config.api.polkaKey) {
    throw new UserNotAuthenticatedError("Incorrect api key");
  }
  await upgradeUser(params.data.userId);

  res.status(204).send();
}

