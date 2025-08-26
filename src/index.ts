import express from "express";

import { handlerReadiness } from "./api/readiness.js";
import { handlerReset } from "./api/reset.js";
import { middlewareLogResponses } from "./api/middleware.js";
import {
  handlerMetrics,
  middlewareMetricsInc,
} from "./api/metrics.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
