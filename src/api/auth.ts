import type { Request, Response } from "express";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./users.js";
import { config } from "../config.js";

type LoginResponse = UserResponse & {
  token: string;
};

export async function handlerUsersLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
    expiresIn?: number;
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

  let duration = config.jwt.defaultDuration;

  if (params.expiresIn && !(params.expiresIn > duration)) {
    duration = params.expiresIn;
  }

  const accessToken = makeJWT(user.id, duration, config.jwt.secret);

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
  } satisfies LoginResponse);
}

