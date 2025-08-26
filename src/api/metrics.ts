import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

export function middlewareMetricsInc(
  _: Request,
  __: Response,
  next: NextFunction,
) {
  config.fileServerHits++;
  next();
}

export async function handlerMetrics(_: Request, res: Response) {
  res.send(`Hits: ${config.fileServerHits}`);
}
