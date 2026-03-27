export const runtime = "edge";

async function getAccessToken() {
  const keyJson = process.env.GOOGLE_SERVICE_KEY;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_KEY not configured");

  const key = JSON.parse(keyJson);
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  }));

  // For Edge runtime, use Web Crypto API to sign JWT
  const encoder = new TextEncoder();
  const pemBody = key.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), function(c) { return c.charCodeAt(0); });

  const cryptoKey = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(header + "." + payload));
  const sig = btoa(String.fromCharCode.apply(null, new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = header + "." + payload + "." + sig;
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + jwt
  });
  const tokenData = await tokenResp.json();
  return tokenData.access_token;
}

export async function POST(req) {
  try {
    const { action, data } = await req.json();
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (!sheetId) return Response.json({ error: "GOOGLE_SHEETS_ID not configured" }, { status: 500 });

    const accessToken = await getAccessToken();
    const base = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetId;

    if (action === "append_lead") {
      const row = [
        data.name || "",
        data.company || "",
        data.email || "",
        data.phone || "",
        data.stage || "New",
        data.value || "",
        data.industry || "",
        data.contactName || "",
        data.source || "AI Agent",
        new Date().toISOString()
      ];
      const resp = await fetch(base + "/values/CRM!A:J:append?valueInputOption=USER_ENTERED", {
        method: "POST",
        headers: { "Authorization": "Bearer " + accessToken, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] })
      });
      const result = await resp.json();
      return Response.json({ success: true, action: "append_lead", updates: result.updates });
    }

    if (action === "sync_all") {
      const leads = data.leads || [];
      const rows = leads.map(function(l) {
        return [l.name, l.company, l.email, l.phone, l.stage, l.value, l.industry, l.contactName, l.source || "CRM", new Date().toISOString()];
      });
      // Clear and rewrite
      await fetch(base + "/values/CRM!A2:J1000:clear", {
        method: "POST",
        headers: { "Authorization": "Bearer " + accessToken }
      });
      if (rows.length > 0) {
        const resp = await fetch(base + "/values/CRM!A2:J:append?valueInputOption=USER_ENTERED", {
          method: "POST",
          headers: { "Authorization": "Bearer " + accessToken, "Content-Type": "application/json" },
          body: JSON.stringify({ values: rows })
        });
        const result = await resp.json();
        return Response.json({ success: true, action: "sync_all", count: rows.length, updates: result.updates });
      }
      return Response.json({ success: true, action: "sync_all", count: 0 });
    }

    return Response.json({ error: "Unknown action: " + action }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}