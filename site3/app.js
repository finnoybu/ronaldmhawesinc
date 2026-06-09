/* Ronald M. Hawes Inc. — Concept 3 interactive layer (restrained) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Sticky header shadow */
  var header = $("#header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".rv").forEach(function (el) { io.observe(el); });

  /* Count-up stats */
  var counters = $$("[data-count]");
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "", dur = 1400, t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Testimonials carousel */
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

  /* Portfolio filter */
  var fb = $("#filterbar");
  if (fb) {
    var btns = $$("button", fb), cells = $$(".gcell");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        var f = b.getAttribute("data-filter");
        cells.forEach(function (c) { c.style.display = (f === "all" || c.getAttribute("data-cat") === f) ? "" : "none"; });
      });
    });
  }

  /* Form fake submit */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = f.querySelector("button[type=submit]");
      if (btn) { btn.textContent = "Thank you — we'll be in touch"; btn.disabled = true; }
    });
  });
})();
