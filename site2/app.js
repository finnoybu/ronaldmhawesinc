/* Ronald M. Hawes Inc. — Concept 2 interactive layer */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Sticky header + sticky CTA ---- */
  var header = $("#header");
  var sticky = $("#stickyCta");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 60);
    if (sticky) sticky.classList.toggle("show", y > 700);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Reveal on scroll ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".rv, .tl .step").forEach(function (el) { io.observe(el); });

  /* ---- Count-up stats ---- */
  var counters = $$("[data-count]");
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "", dur = 1400, t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Timeline progress fill ---- */
  var tl = $("#timeline"), tlFill = $("#tlFill");
  if (tl && tlFill) {
    function tlScroll() {
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = r.height;
      var passed = Math.min(Math.max(vh * 0.6 - r.top, 0), total);
      tlFill.style.height = passed + "px";
    }
    tlScroll();
    window.addEventListener("scroll", tlScroll, { passive: true });
    window.addEventListener("resize", tlScroll);
  }

  /* ---- Cost / style estimator ---- */
  var est = $("#estimator");
  if (est) {
    var sqftIn = $("#estSqft"), sqftOut = $("#estSqftVal");
    var styleChips = $$("[data-style]", est), finishChips = $$("[data-finish]", est);
    var outNum = $("#estNum");
    var styleFactor = 1.0, baseRate = 325; // $/sqft, "Signature" finish default

    function fmt(n) {
      return "$" + Math.round(n / 1000) * 1000 / 1000 + "";
    }
    function money(n) {
      // round to nearest $5k for a clean ballpark
      var r = Math.round(n / 5000) * 5000;
      return "$" + r.toLocaleString();
    }
    function recalc() {
      var sqft = parseInt(sqftIn.value, 10);
      if (sqftOut) sqftOut.textContent = sqft.toLocaleString() + " sq ft";
      var mid = sqft * baseRate * styleFactor;
      var lo = mid * 0.9, hi = mid * 1.12;
      if (outNum) outNum.textContent = money(lo) + " – " + money(hi);
    }
    if (sqftIn) sqftIn.addEventListener("input", recalc);
    styleChips.forEach(function (c) {
      c.addEventListener("click", function () {
        styleChips.forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
        styleFactor = parseFloat(c.getAttribute("data-factor")) || 1.0;
        recalc();
      });
    });
    finishChips.forEach(function (c) {
      c.addEventListener("click", function () {
        finishChips.forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
        baseRate = parseFloat(c.getAttribute("data-rate")) || 325;
        recalc();
      });
    });
    recalc();
  }

  /* ---- Lightbox ---- */
  var lb = $("#lightbox");
  if (lb) {
    var lbImg = $("#lbImg"), lbTag = $("#lbTag"), lbTitle = $("#lbTitle");
    var items = [], idx = 0;
    function collect() {
      items = $$("[data-lb]").map(function (el) {
        return { src: el.getAttribute("data-lb"), tag: el.getAttribute("data-tag") || "", title: el.getAttribute("data-title") || "" };
      });
    }
    function show(i) {
      if (!items.length) return;
      idx = (i + items.length) % items.length;
      var it = items[idx];
      lbImg.src = it.src; lbTag.textContent = it.tag; lbTitle.textContent = it.title;
    }
    function open(el) {
      collect();
      var src = el.getAttribute("data-lb");
      var found = items.findIndex(function (x) { return x.src === src; });
      show(found < 0 ? 0 : found);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-lb]");
      if (t) { e.preventDefault(); open(t); }
    });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", function () { show(idx - 1); });
    $("#lbNext").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---- Testimonials carousel ---- */
  var car = $("#tcar");
  if (car) {
    var slides = $$(".tslide", car), dots = $$(".tdots button", car), cur = 0, timer;
    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("on", n === cur); });
      dots.forEach(function (d, n) { d.classList.toggle("on", n === cur); });
    }
    dots.forEach(function (d, n) { d.addEventListener("click", function () { go(n); reset(); }); });
    function reset() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 6000); }
    go(0); reset();
  }

  /* ---- Portfolio filter ---- */
  var fb = $("#filterbar");
  if (fb) {
    var btns = $$("button", fb), cells = $$(".gcell");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        var f = b.getAttribute("data-filter");
        cells.forEach(function (c) {
          c.style.display = (f === "all" || c.getAttribute("data-cat") === f) ? "" : "none";
        });
      });
    });
  }

  /* ---- Form fake submit ---- */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = f.querySelector("button[type=submit]");
      if (btn) { btn.textContent = "Thank you — we'll be in touch ✓"; btn.disabled = true; }
    });
  });
})();
