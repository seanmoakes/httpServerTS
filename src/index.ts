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

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
