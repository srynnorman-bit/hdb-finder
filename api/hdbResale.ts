import type { Request, Response } from "express";

/**
 * Handlers for Singapore Data.gov.sg HDB Resale Prices API & Dataset Metadata.
 * 
 * Dataset: HDB Resale Prices (Jan 2017 onwards)
 * Resource ID: d_8b84c4ee58e3cfc0ece0d773c8ca6abc
 * 
 * GUARDRAIL COMPLIANCE:
 * - Credentials (if provided) are read ONLY inside files in the repo-root api/ directory via process.env.
 * - Never creates a VITE_ variable for secrets.
 * - No hardcoded keys, tokens, or URLs with keys embedded.
 */

const DEFAULT_RESOURCE_ID = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc";
const DATASTORE_SEARCH_BASE = "https://data.gov.sg/api/action/datastore_search";
const DATASET_METADATA_BASE = "https://api-production.data.gov.sg/v2/public/api/datasets";

/**
 * Search HDB Resale Transactions from data.gov.sg datastore
 * Supports limit, filters (town, flat_type), q, and custom resource_id
 */
export async function getHdbResaleTransactionsHandler(req: Request, res: Response) {
  try {
    const resourceId = (req.query.resource_id as string) || DEFAULT_RESOURCE_ID;
    const limit = req.query.limit ? String(req.query.limit) : "5";
    const offset = req.query.offset ? String(req.query.offset) : undefined;
    const q = req.query.q as string | undefined;
    const sort = req.query.sort as string | undefined;

    // Parse filters object
    let filtersObj: Record<string, string> = {};

    if (req.query.filters) {
      try {
        if (typeof req.query.filters === "string") {
          filtersObj = JSON.parse(req.query.filters);
        } else if (typeof req.query.filters === "object") {
          filtersObj = req.query.filters as Record<string, string>;
        }
      } catch {
        // Invalid JSON filters - ignore
      }
    }

    if (req.query.town && typeof req.query.town === "string") {
      filtersObj.town = req.query.town.toUpperCase().trim();
    }

    if (req.query.flat_type && typeof req.query.flat_type === "string") {
      let normalizedType = req.query.flat_type.toUpperCase().trim();
      if (normalizedType.includes("-ROOM")) {
        normalizedType = normalizedType.replace("-ROOM", " ROOM");
      }
      filtersObj.flat_type = normalizedType;
    }

    const queryParams = new URLSearchParams();
    queryParams.set("resource_id", resourceId);
    queryParams.set("limit", limit);

    if (offset) {
      queryParams.set("offset", offset);
    }
    if (q && q.trim()) {
      queryParams.set("q", q.trim());
    }
    if (sort && sort.trim()) {
      queryParams.set("sort", sort.trim());
    }
    if (Object.keys(filtersObj).length > 0) {
      queryParams.set("filters", JSON.stringify(filtersObj));
    }

    const targetUrl = `${DATASTORE_SEARCH_BASE}?${queryParams.toString()}`;

    // Read optional credentials if configured via process.env
    const apiKey =
      process.env.DATA_GOV_SG_API_KEY ||
      process.env.DATA_GOV_API_KEY ||
      process.env.DATAGOV_API_KEY;

    const headers: Record<string, string> = {
      accept: "application/json",
      "User-Agent": "HDB-Finder-App/1.0",
    };

    if (apiKey && apiKey.trim() && apiKey !== "MY_DATA_GOV_SG_API_KEY") {
      headers["x-api-key"] = apiKey.trim();
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
        error: `data.gov.sg service returned status ${response.status}`,
        details: errorText,
      });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Get Dataset Metadata (field names, types, description) from Data.gov.sg v2
 */
export async function getHdbDatasetMetadataHandler(req: Request, res: Response) {
  try {
    const datasetId = (req.params.datasetId as string) || (req.query.datasetId as string) || DEFAULT_RESOURCE_ID;
    const targetUrl = `${DATASET_METADATA_BASE}/${encodeURIComponent(datasetId)}/metadata`;

    const apiKey =
      process.env.DATA_GOV_SG_API_KEY ||
      process.env.DATA_GOV_API_KEY ||
      process.env.DATAGOV_API_KEY;

    const headers: Record<string, string> = {
      accept: "application/json",
      "User-Agent": "HDB-Finder-App/1.0",
    };

    if (apiKey && apiKey.trim() && apiKey !== "MY_DATA_GOV_SG_API_KEY") {
      headers["x-api-key"] = apiKey.trim();
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
        error: `data.gov.sg metadata service returned status ${response.status}`,
        details: errorText,
      });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
