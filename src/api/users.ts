import type { Request, Response } from "express";

import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError(`Missing required fields`);
  }

  const user = await createUser({ email: params.email });

  if (!user) {
    throw new Error(`Could not creae user"`);
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
