import type { Request, Response } from "express";

/**
 * Handlers for Singapore OneMap APIs:
 * - Token Minting: https://www.onemap.gov.sg/api/auth/post/getToken
 * - Geocoding & Address Search: https://www.onemap.gov.sg/api/common/elastic/search
 * - Reverse Geocoding: https://www.onemap.gov.sg/api/public/revgeocode
 * - Routing Service: https://www.onemap.gov.sg/api/public/routingsvc/route
 * 
 * GUARDRAIL COMPLIANCE:
 * - Credentials are read ONLY inside files in the repo-root api/ directory via process.env.
 * - If credential is not configured, returns HTTP 500 with {"error":"credential not configured"}.
 * - No hardcoded API keys, tokens, or URLs with embedded keys.
 */

const ONEMAP_BASE_URL = "https://www.onemap.gov.sg/api";

// In-memory cache for minted OneMap token
let cachedToken: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * Helper to retrieve a valid OneMap Authorization token.
 * Reads either ONEMAP_TOKEN or (ONEMAP_EMAIL + ONEMAP_PASSWORD).
 * Returns null if credentials are not configured.
 */
async function getOneMapToken(): Promise<{ token: string | null; error?: string }> {
  // Check direct token first
  const directToken = process.env.ONEMAP_TOKEN;
  if (directToken && directToken.trim() !== "" && directToken !== "MY_ONEMAP_TOKEN") {
    return { token: directToken.trim() };
  }

  // Check email + password to mint token
  const email = process.env.ONEMAP_EMAIL;
  const password = process.env.ONEMAP_PASSWORD;

  if (!email || !password || email.trim() === "" || password.trim() === "" || email === "MY_ONEMAP_EMAIL") {
    return { token: null, error: "credential not configured" };
  }

  // Return cached token if still valid (tokens last 3 days = 259200s, cache for 2.5 days)
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return { token: cachedToken.token };
  }

  try {
    const res = await fetch(`${ONEMAP_BASE_URL}/auth/post/getToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { token: null, error: `OneMap auth error ${res.status}: ${errText}` };
    }

    const data = await res.json();
    if (data.access_token) {
      cachedToken = {
        token: data.access_token,
        // Cache for 2.5 days or use expiry timestamp if provided
        expiresAt: now + (data.expiry_timestamp ? Number(data.expiry_timestamp) * 1000 - now : 216000000),
      };
      return { token: data.access_token };
    }

    return { token: null, error: data.error || "Failed to obtain access token from OneMap" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to OneMap auth";
    return { token: null, error: msg };
  }
}

/**
 * Endpoint to check / mint OneMap token
 */
export async function getOneMapTokenHandler(_req: Request, res: Response) {
  const { token, error } = await getOneMapToken();
  if (!token) {
    if (error === "credential not configured") {
      res.status(500).json({ error: "credential not configured" });
    } else {
      res.status(500).json({ error: error || "Failed to authenticate with OneMap" });
    }
    return;
  }

  res.json({
    status: "authenticated",
    message: "OneMap credentials active and token minted successfully",
    expiresInDays: 3,
  });
}

/**
 * Geocode / Search: https://www.onemap.gov.sg/api/common/elastic/search?searchVal=...&returnGeom=Y&getAddrDetails=Y&pageNum=1
 */
export async function oneMapSearchHandler(req: Request, res: Response) {
  const { token, error } = await getOneMapToken();
  if (!token) {
    if (error === "credential not configured") {
      res.status(500).json({ error: "credential not configured" });
    } else {
      res.status(500).json({ error: error || "OneMap token unavailable" });
    }
    return;
  }

  const searchVal = (req.query.searchVal as string) || (req.query.q as string);
  if (!searchVal || !searchVal.trim()) {
    res.status(400).json({ error: "searchVal query parameter is required" });
    return;
  }

  const returnGeom = (req.query.returnGeom as string) || "Y";
  const getAddrDetails = (req.query.getAddrDetails as string) || "Y";
  const pageNum = (req.query.pageNum as string) || "1";

  try {
    const params = new URLSearchParams({
      searchVal: searchVal.trim(),
      returnGeom,
      getAddrDetails,
      pageNum,
    });

    const targetUrl = `${ONEMAP_BASE_URL}/common/elastic/search?${params.toString()}`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: token,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({
        error: `OneMap Search returned status ${response.status}`,
        details: errText,
      });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: msg });
  }
}

/**
 * Reverse Geocode: https://www.onemap.gov.sg/api/public/revgeocode?location=1.3,103.8&buffer=40&addressType=All
 */
export async function oneMapRevGeocodeHandler(req: Request, res: Response) {
  const { token, error } = await getOneMapToken();
  if (!token) {
    if (error === "credential not configured") {
      res.status(500).json({ error: "credential not configured" });
    } else {
      res.status(500).json({ error: error || "OneMap token unavailable" });
    }
    return;
  }

  const location = req.query.location as string; // e.g. "1.3,103.8" or "1.3521,103.8198"
  if (!location || !location.trim()) {
    res.status(400).json({ error: "location query parameter is required (e.g. '1.3,103.8')" });
    return;
  }

  const buffer = (req.query.buffer as string) || "40";
  const addressType = (req.query.addressType as string) || "All";
  const otherFeatures = (req.query.otherFeatures as string) || "N";

  try {
    const params = new URLSearchParams({
      location: location.trim(),
      buffer,
      addressType,
      otherFeatures,
    });

    const targetUrl = `${ONEMAP_BASE_URL}/public/revgeocode?${params.toString()}`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: token,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({
        error: `OneMap RevGeocode returned status ${response.status}`,
        details: errText,
      });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: msg });
  }
}

/**
 * Routing Service: https://www.onemap.gov.sg/api/public/routingsvc/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk
 * routeType: 'walk' | 'drive' | 'cycle' | 'pt'
 */
export async function oneMapRouteHandler(req: Request, res: Response) {
  const { token, error } = await getOneMapToken();
  if (!token) {
    if (error === "credential not configured") {
      res.status(500).json({ error: "credential not configured" });
    } else {
      res.status(500).json({ error: error || "OneMap token unavailable" });
    }
    return;
  }

  const start = req.query.start as string;
  const end = req.query.end as string;
  const routeType = (req.query.routeType as string) || "walk";

  if (!start || !end) {
    res.status(400).json({ error: "start and end query parameters are required (e.g. '1.320981,103.844150')" });
    return;
  }

  try {
    const params = new URLSearchParams({
      start: start.trim(),
      end: end.trim(),
      routeType: routeType.trim(),
    });

    if (req.query.date) params.set("date", String(req.query.date));
    if (req.query.time) params.set("time", String(req.query.time));
    if (req.query.mode) params.set("mode", String(req.query.mode));
    if (req.query.maxWalkDistance) params.set("maxWalkDistance", String(req.query.maxWalkDistance));

    const targetUrl = `${ONEMAP_BASE_URL}/public/routingsvc/route?${params.toString()}`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: token,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({
        error: `OneMap Routing returned status ${response.status}`,
        details: errText,
      });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: msg });
  }
}
