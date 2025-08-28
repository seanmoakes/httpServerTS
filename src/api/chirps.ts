import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  const params: parameters = req.body;

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: params.userId });

  if (!chirp) {
    throw new Error("Unable to create new chirp");
  }

  respondWithJSON(res, 201, chirp);
}

export async function handlerChirpsRetrieve(_: Request, res: Response) {
  const chirps = await getChirps();
  respondWithJSON(res, 200, chirps);
}

export async function handlerChirpsRetrieveById(req: Request, res: Response) {
  const { chirpId } = req.params;

  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  respondWithJSON(res, 200, chirp);
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
