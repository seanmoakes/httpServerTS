import type { Request, Response } from "express";

import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";
import { NewUser } from "../db/schema.js";

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
  } satisfies UserResponse);
}


