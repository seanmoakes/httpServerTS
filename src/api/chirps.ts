import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors.js";
import { createChirp, deleteChirp, getChirpById, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: userId });

  respondWithJSON(res, 201, chirp);
}

export async function handlerChirpsRetrieve(req: Request, res: Response) {
  const chirps = await getChirps();

  let authorId = "";
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }

  let sortDirection = "asc";
  let sortQuery = req.query.sort;
  if (typeof sortQuery === "string") {
    if (sortQuery === "desc") {
      sortDirection = "desc";
    }
  }
  const filteredChirps = chirps.filter((chirp) => chirp.userId === authorId || authorId === "");
  filteredChirps.sort((a, b) =>
    sortDirection === "asc"
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime()
  );

  respondWithJSON(res, 200, filteredChirps);

}

export async function handlerChirpsRetrieveById(req: Request, res: Response) {
  const { chirpId } = req.params;

  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  respondWithJSON(res, 200, chirp);
}

export async function handlerChirpsDelete(req: Request, res: Response) {
  const { chirpId } = req.params;
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  if (userId !== chirp.userId) {
    throw new UserForbiddenError("Chirps can only be deleted by their Author");
  }

  const deleted = await deleteChirp(chirp.id);
  if (!deleted) {
    throw new Error(`Failed to delete chirp with chirpID: ${chirpId}`);
  }
  res.status(204).send();
}

function validateChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
  }

  let profane = ["kerfuffle", "sharbert", "fornax"];
  return getCleanedBody(body, profane);
}

function getCleanedBody(body: string, profane: string[]) {
  let words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    if (profane.includes(word)) {
      words[i] = "****";
    }
  }

  return words.join(" ");
}
