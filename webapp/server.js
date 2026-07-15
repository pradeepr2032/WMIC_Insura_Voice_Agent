// Wisconsin Mutual Insurance Company — "Insura" voice agent demo server
// -----------------------------------------------------------------------------
// This tiny server exists for ONE reason: to keep your Retell API SECRET key off
// the webpage. The browser asks this server for a short-lived "access token";
// this server (and only this server) knows the API key. Nalashaa POC.
//
// Flow:  browser  --->  POST /api/create-web-call  --->  this server
//        this server  --->  Retell REST API (with secret key)  --->  access_token
//        access_token  --->  browser  --->  starts the in-browser voice call
// -----------------------------------------------------------------------------

import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const AGENT_ID = process.env.AGENT_ID;

// Serve the branded webpage (everything in /public) as the front end.
app.use(express.static("public"));
app.use(express.json());

// The one endpoint the page calls when the user clicks "Talk to Insura".
app.post("/api/create-web-call", async (req, res) => {
  if (!RETELL_API_KEY || !AGENT_ID) {
    return res.status(500).json({
      error:
        "Missing credentials. Copy .env.example to .env and fill in RETELL_API_KEY and AGENT_ID.",
    });
  }

  try {
    const retellResponse = await fetch(
      "https://api.retellai.com/v2/create-web-call",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agent_id: AGENT_ID }),
      }
    );

    if (!retellResponse.ok) {
      const detail = await retellResponse.text();
      console.error("Retell API error:", retellResponse.status, detail);
      return res
        .status(retellResponse.status)
        .json({ error: "Retell API rejected the request.", detail });
    }

    const data = await retellResponse.json();
    // Only hand the browser what it needs — the access token, not the API key.
    res.json({ access_token: data.access_token, call_id: data.call_id });
  } catch (err) {
    console.error("Failed to create web call:", err);
    res.status(500).json({ error: "Could not reach Retell. Check your network." });
  }
});

app.listen(PORT, () => {
  console.log("\n  Wisconsin Mutual x Insura demo running");
  console.log(`  ->  http://localhost:${PORT}\n`);
  if (!RETELL_API_KEY || !AGENT_ID) {
    console.log("  ⚠  No credentials yet. Create a .env file (see .env.example).\n");
  }
});
