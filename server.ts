import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { getBusArrivalHandler } from "./api/busArrival.ts";
import { getHdbResaleTransactionsHandler, getHdbDatasetMetadataHandler } from "./api/hdbResale.ts";
import {
  getOneMapTokenHandler,
  oneMapSearchHandler,
  oneMapRevGeocodeHandler,
  oneMapRouteHandler,
} from "./api/oneMap.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "HDB-Finder Singapore API Backend" });
  });

  // 1. Singapore LTA DataMall v3 Bus Arrival Route
  app.get("/api/bus-arrival", getBusArrivalHandler);

  // 2. Singapore Data.gov.sg HDB Resale API Routes & Aliases
  app.get("/api/hdb-resale/transactions", getHdbResaleTransactionsHandler);
  app.get("/api/hdb-resale", getHdbResaleTransactionsHandler);
  app.get("/api/hdb_resale", getHdbResaleTransactionsHandler);
  app.get("/api/action/datastore_search", getHdbResaleTransactionsHandler);
  app.get("/api/action/datastore_search_sql", getHdbResaleTransactionsHandler);
  app.get("/api/resale", getHdbResaleTransactionsHandler);
  app.get("/api/resale/transactions", getHdbResaleTransactionsHandler);
  app.get("/api/resale-prices", getHdbResaleTransactionsHandler);

  app.get("/api/hdb-resale/metadata", getHdbDatasetMetadataHandler);
  app.get("/api/hdb-resale/metadata/:datasetId", getHdbDatasetMetadataHandler);
  app.get("/api/datasets/metadata", getHdbDatasetMetadataHandler);
  app.get("/api/datasets/:datasetId/metadata", getHdbDatasetMetadataHandler);
  app.get("/api/v2/public/api/datasets/:datasetId/metadata", getHdbDatasetMetadataHandler);
  app.get("/v2/public/api/datasets/:datasetId/metadata", getHdbDatasetMetadataHandler);

  // 3. Singapore OneMap API Routes
  app.get("/api/onemap/token", getOneMapTokenHandler);
  app.get("/api/onemap/search", oneMapSearchHandler);
  app.get("/api/onemap/revgeocode", oneMapRevGeocodeHandler);
  app.get("/api/onemap/route", oneMapRouteHandler);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
