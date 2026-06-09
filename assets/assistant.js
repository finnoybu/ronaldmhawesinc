/* ============================================================
   Ronald M. Hawes Inc. — Website chat assistant (front end)
   ------------------------------------------------------------
   Injects a floating chat widget on every page. Talks to the
   Cloudflare Worker in /assistant-backend when API_ENDPOINT is
   set; otherwise falls back to a built-in canned responder so
   the mockup still answers common questions.
   ============================================================ */
(function () {
  "use strict";

  /* ▼▼▼ After deploying the Worker (see assistant-backend/README.md),
     paste its URL here, e.g. "https://hawes-assistant.xxx.workers.dev" ▼▼▼ */
  var API_ENDPOINT = "";
  /* ▲▲▲ Leave blank to use the offline demo responder. ▲▲▲ */

  var PHONE = "(540) 822-5795";
  var messages = []; // {role, content} sent to the API

  /* ---------- Build widget ---------- */
  var root = document.createElement("div");
  root.className = "rmh-chat";
  root.innerHTML =
    '<button class="rmh-chat__launch" id="rmhLaunch" aria-label="Ask about our services">' +
      '<span class="rmh-chat__launch-ic" aria-hidden="true">&#128172;</span> Ask us</button>' +
    '<div class="rmh-chat__panel" id="rmhPanel" role="dialog" aria-label="Hawes assistant" hidden>' +
      '<div class="rmh-chat__head">' +
        '<div><strong>Hawes Assistant</strong><span>Ask about our services</span></div>' +
        '<button class="rmh-chat__close" id="rmhClose" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="rmh-chat__log" id="rmhLog"></div>' +
      '<form class="rmh-chat__form" id="rmhForm">' +
        '<input id="rmhInput" type="text" autocomplete="off" placeholder="e.g. Do you build additions?">' +
        '<button type="submit" aria-label="Send">Send</button>' +
      '</form>' +
      '<div class="rmh-chat__foot">AI assistant — general info only. ' +
        '<a href="contact.html">Contact us</a> for quotes.</div>' +
    '</div>';
  document.body.appendChild(root);

  var panel = root.querySelector("#rmhPanel");
  var log = root.querySelector("#rmhLog");
  var form = root.querySelector("#rmhForm");
  var input = root.querySelector("#rmhInput");
  var launch = root.querySelector("#rmhLaunch");
  var greeted = false;

  /* ---------- UI helpers ---------- */
  function addMsg(role, text, extraClass) {
    var el = document.createElement("div");
    el.className = "rmh-msg " + (role === "user" ? "user" : "bot") + (extraClass ? " " + extraClass : "");
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function botReply(text) {
    addMsg("bot", text);
    messages.push({ role: "assistant", content: text });
  }

  function openPanel() {
    panel.hidden = false;
    launch.setAttribute("aria-expanded", "true");
    input.focus();
    if (!greeted) {
      greeted = true;
      addMsg("bot", "Hi! I can answer questions about Ronald M. Hawes Inc. — our custom homes, additions, renovations, and more. What can I help you with?");
    }
  }
  function closePanel() { panel.hidden = true; launch.setAttribute("aria-expanded", "false"); }

  launch.addEventListener("click", function () { panel.hidden ? openPanel() : closePanel(); });
  root.querySelector("#rmhClose").addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) closePanel(); });

  /* ---------- Send ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg("user", text);
    messages.push({ role: "user", content: text });

    var typing = addMsg("bot", "…", "typing");

    if (API_ENDPOINT) {
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: messages }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          typing.remove();
          botReply(d.reply || ("I hit a snag answering that — please call us at " + PHONE + "."));
        })
        .catch(function () {
          typing.remove();
          botReply("I'm having trouble connecting right now. Please call us at " + PHONE + " or use the contact form.");
        });
    } else {
      setTimeout(function () { typing.remove(); botReply(cannedReply(text)); }, 450);
    }
  });

  /* ---------- Offline demo responder ----------
     Used only until API_ENDPOINT is set. Keyword-matched, intentionally simple. */
  function cannedReply(q) {
    q = q.toLowerCase();
    var has = function () { for (var i = 0; i < arguments.length; i++) if (q.indexOf(arguments[i]) > -1) return true; return false; };

    if (has("price", "cost", "how much", "quote", "estimate", "budget"))
      return "Every project is unique, so we don't quote firm prices up front — it depends on size, finishes, site conditions, and land. The best next step is a quick consultation. Call " + PHONE + " or use the contact form and we'll talk specifics.";
    if (has("addition", "add on", "second story", "sunroom", "in-law", "bonus"))
      return "Yes — we build additions of all kinds: room and second-story additions, in-law and bonus suites, sunrooms, finished basements, and garages. We match the existing home so it looks original.";
    if (has("renovat", "remodel", "kitchen", "bath", "basement"))
      return "Absolutely. We handle kitchen and bath remodels, whole-home renovations, historic and farmhouse updates, and custom millwork and built-ins.";
    if (has("custom home", "build a home", "build a house", "new home", "log", "timber", "turn-key", "turn key"))
      return "Custom homes are our specialty — fully custom and semi-custom, including log and timber-frame. We manage everything from sketch or blueprints through the final walkthrough, and can even help you find the right lot.";
    if (has("repair", "structural", "foundation", "rot", "storm", "roof", "deck", "porch", "siding"))
      return "Yes, we do building repairs — structural and foundation work, rot/water/storm damage, decks, porches, railings, roofing, and siding.";
    if (has("paint", "exterior", "stain", "pressure wash"))
      return "We offer interior and exterior painting, siding/trim/soffit work, pressure washing, and staining and sealing — finishes built to last through Virginia's seasons.";
    if (has("excavat", "grading", "site work", "drainage", "driveway"))
      return "We do excavation and site work: clearing and prep, grading and drainage, foundation excavation, driveways, and utilities.";
    if (has("financ", "loan", "payment", "afford"))
      return "Financing is available through Acorn Finance — there's an application link on the Contact page. Happy to point you there.";
    if (has("where", "area", "location", "serve", "loudoun", "county", "near"))
      return "We're based in Lovettsville and serve Loudoun County and Northern Virginia. We've been local since 1982.";
    if (has("license", "insur", "bond", "certified", "qualif"))
      return "We're a Class A licensed and insured contractor in Virginia, family owned and operated since 1982 — over 40 years of experience.";
    if (has("contact", "phone", "call", "email", "reach", "address", "hours", "appointment", "consult"))
      return "You can reach us at " + PHONE + " or info@ronaldmhawesinc.com. Our office is at 42505 Lovettsville Road, Lovettsville, VA — or just use the contact form and we'll get back within a business day.";
    if (has("hello", "hi", "hey", "good morning", "good afternoon"))
      return "Hi there! Ask me anything about our services — custom homes, additions, renovations, repairs, painting, or excavation.";
    if (has("who", "about", "experience", "how long", "history", "years"))
      return "Ronald M. Hawes Inc. is a family-owned custom home builder in Loudoun County, VA, building with trust, honesty, and clear communication since 1982 — over 40 years.";

    return "Great question — I can help with custom homes, additions, renovations, building repairs, painting & exterior, and excavation. For anything specific (timelines, pricing, your particular project), call us at " + PHONE + " or use the contact form and the team will follow up.";
  }
})();
