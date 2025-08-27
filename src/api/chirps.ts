import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
  }

  let profane = ["kerfuffle", "sharbert", "fornax"];

  let clean = censorProfanity(params.body, "****", ...profane);
  respondWithJSON(res, 200, {
    cleanedBody: clean,
  });
}

function censorProfanity(text: string, replacer: string, ...profane: string[]) {
  let textWords = text.split(" ");
  let profaneLower = profane.map((word) => word.toLowerCase());

  for (let index = 0; index < textWords.length; index++) {
    if (profaneLower.includes(textWords[index].toLowerCase())) {
      textWords[index] = replacer;
    }
  }

  return textWords.join(" ");
}

