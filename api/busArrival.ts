import type { Request, Response } from "express";

/**
 * Handler for LTA DataMall v3 Bus Arrival API.
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
 * 
 * GUARDRAIL COMPLIANCE:
 * - Credentials are read ONLY inside files in the repo-root api/ directory via process.env.
 * - If credential is not configured, returns HTTP 500 with {"error":"credential not configured"}.
 * - No hardcoded API keys, tokens, or URLs with embedded keys.
 */
export async function getBusArrivalHandler(req: Request, res: Response) {
  const accountKey = 
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY;

  if (!accountKey || accountKey.trim() === "" || accountKey === "MY_LTA_ACCOUNT_KEY") {
    res.status(500).json({ error: "credential not configured" });
    return;
  }

  const busStopCode = req.query.BusStopCode as string;
  const serviceNo = req.query.ServiceNo as string | undefined;

  if (!busStopCode) {
    res.status(400).json({ error: "BusStopCode query parameter is required" });
    return;
  }

  try {
    let targetUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode.trim())}`;
    if (serviceNo && serviceNo.trim()) {
      targetUrl += `&ServiceNo=${encodeURIComponent(serviceNo.trim())}`;
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        AccountKey: accountKey.trim(),
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
        error: `LTA DataMall service returned status ${response.status}`,
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
