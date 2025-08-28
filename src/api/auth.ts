import type { Request, Response } from "express";
import { checkPasswordHash } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { UserResponse } from "./users.js";


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

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}

