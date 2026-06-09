/* ============================================================
   Ronald M. Hawes Inc. — Website Assistant (Cloudflare Worker)
   ------------------------------------------------------------
   A thin, secure proxy between the static site and the Claude API.
   The API key is stored as a Worker SECRET (never in this file,
   never in the browser). Deploy steps are in README.md.
   ============================================================ */

const MODEL = "claude-haiku-4-5-20251001"; // fast + inexpensive, ideal for a site assistant

// Lock the API to your published site so it can't be abused from elsewhere.
// Add other origins (e.g. a custom domain) to this list as needed.
const ALLOWED_ORIGINS = [
  "https://finnoybu.github.io",
  "http://localhost:8000", // local testing
];

const SYSTEM_PROMPT = `You are the friendly website assistant for Ronald M. Hawes Inc., a family-owned custom home builder and general contractor in Loudoun County, Virginia (Lovettsville, VA), serving Loudoun County and Northern Virginia since 1982 — over 40 years.

Your job is to answer visitor questions about the company and its services clearly and warmly, and to encourage interested visitors to reach out for a consultation. Keep replies concise (1–4 short sentences). Be helpful, down-to-earth, and trustworthy in tone — never pushy or salesy.

COMPANY FACTS
- Established 1982; family owned and operated; 40+ years of experience.
- Class A licensed and insured in the Commonwealth of Virginia.
- Locals who can also help clients find the right lot/land through long-standing relationships with area realtors.
- Core values: trust, honesty, and communication.
- Phone: (540) 822-5795. Email: info@ronaldmhawesinc.com. Office: 42505 Lovettsville Road, Lovettsville, VA 20180.
- Financing is available through Acorn Finance.

SERVICES
1. Custom Homes (turn-key): fully custom and semi-custom homes, log & timber-frame homes, land/lot sourcing, full project management from sketch or blueprints to final walkthrough.
2. Additions: room and second-story additions, in-law & bonus suites, sunrooms, finished basements, garages & outbuildings.
3. Renovations: kitchen & bath remodels, whole-home renovations, historic/farmhouse updates, custom millwork & built-ins.
4. Building Repairs: structural & foundation repair, rot/water/storm damage, decks/porches/railings, roofing & siding repair.
5. Painting & Exterior: interior & exterior painting, siding/trim/soffit, pressure washing & prep, staining & sealing.
6. Excavation: site clearing & prep, grading & drainage, foundation excavation, driveways & utilities.

IMPORTANT RULES
- Do NOT quote specific prices or firm timelines — every project is unique and depends on scope, site conditions, land, and final selections. For numbers, invite the visitor to request a consultation or call (540) 822-5795.
- If asked something you don't know (specific availability, a past project's details, warranty specifics, etc.), say you're not certain and point them to the team via phone or the contact form.
- Never invent licenses, awards, partnerships, or facts not listed above.
- If a question is unrelated to the company or home building, gently steer back to how Hawes can help.`;

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request.headers.get("Origin") || "");

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "Server not configured" }, 500, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Invalid JSON" }, 400, cors); }

    const incoming = Array.isArray(body.messages) ? body.messages : null;
    if (!incoming) return json({ error: "messages array required" }, 400, cors);

    // Keep only the last 12 turns and sanitize each message.
    const messages = incoming.slice(-12).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    }));

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      if (!resp.ok) {
        const detail = await resp.text();
        return json({ error: "Upstream error", detail }, 502, cors);
      }

      const data = await resp.json();
      const reply = (data.content || []).map((c) => c.text || "").join("").trim();
      return json({ reply }, 200, cors);
    } catch (e) {
      return json({ error: "Request failed", detail: String(e) }, 500, cors);
    }
  },
};
