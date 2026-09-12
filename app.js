/* FITNESS TOWN GYM — central site config + interactions
   EDIT BUSINESS INFO HERE (mirrors index.html comment block) */
const SITE = {
  name: "Fitness Town Gym",
  phoneDisplay: "01711-262253",
  phoneLink: "tel:+8801711262253",
  whatsapp: "https://wa.me/8801711262253",
  address: "Level 02, Hazi Nur Nobi Complex, Opp. Lutfun Tower, Pragati Sharani, Middle Badda, Dhaka-1212",
  hours: { open: 7, close: 23, days: [0, 1, 2, 3, 4, 6] }, // Sat–Thu (Sun=0..Sat=6); Friday(5) = call ahead
  maps: "https://www.google.com/maps/search/?api=1&query=Fitness+Town+Gym+Middle+Badda+Dhaka"
};

(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Year */
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* Nav scroll state */
  const nav = $("#nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = $("#burger"), menu = $("#mobileMenu");
  const setMenu = (open) => {
    if (!menu || !burger) return;
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
  };
  if (burger && menu) {
    burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* Theme: toggle + persistence (init runs pre-paint in <head>) */
  const themeToggle = $("#themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (t) => {
    const theme = t === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("ft-theme", theme); } catch (e) { /* private mode */ }
    const light = theme === "light";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(light));
      themeToggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    }
    if (themeMeta) themeMeta.setAttribute("content", light ? "#FAF8F2" : "#050505");
  };
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
  }
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");

  /* Active nav link on scroll */
  const links = $$(".nav-link");
  const secs = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && secs.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach((s) => io.observe(s));
  }

  /* Reveal on scroll */
  const rev = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    rev.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rev.forEach((el) => io.observe(el));
  }

  /* Count-up numbers */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    if (reduced) { el.textContent = target.toFixed(dec); return; }
    const dur = 1400, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { runCounter(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => io.observe(c));
  } else counters.forEach(runCounter);

  /* Open / closed status (Sat–Thu 7AM–11PM Dhaka time; Fri = call ahead) */
  const statusEl = $("#openStatus"), dot = $("#openDot");
  try {
    const nowDhaka = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const day = nowDhaka.getDay(); // 5 = Friday
    const h = nowDhaka.getHours() + nowDhaka.getMinutes() / 60;
    let label = "MIDDLE BADDA · DHAKA";
    let open = false;
    if (day === 5) {
      label = "FRIDAY — PLEASE CALL AHEAD · MIDDLE BADDA";
    } else if (h >= SITE.hours.open && h < SITE.hours.close) {
      label = "OPEN NOW · TILL 11 PM · MIDDLE BADDA";
      open = true;
    } else {
      label = "OPENS 7 AM (SAT–THU) · MIDDLE BADDA";
    }
    if (statusEl) statusEl.textContent = label;
    if (dot) {
      dot.style.background = open ? "#C8F31D" : day === 5 ? "#ffb020" : "#ff5d5d";
      dot.style.boxShadow = "0 0 12px " + dot.style.background;
    }
  } catch (e) { /* keep default label */ }

  /* Reviews slider */
  const slides = $$("#slides .slide");
  const dotsWrap = $("#revDots");
  const idxEl = $("#revIndex"), totalEl = $("#revTotal");
  let idx = 0, timer = null;
  const pad = (n) => String(n).padStart(2, "0");
  if (totalEl) totalEl.textContent = pad(slides.length);
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Show review " + (i + 1));
    b.addEventListener("click", () => { show(i); restart(); });
    if (dotsWrap) dotsWrap.appendChild(b);
    return b;
  });
  function show(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === idx));
    dots.forEach((d, k) => d.classList.toggle("on", k === idx));
    if (idxEl) idxEl.textContent = pad(idx + 1);
  }
  function restart() {
    if (timer) clearInterval(timer);
    if (!reduced && slides.length > 1) timer = setInterval(() => show(idx + 1), 6000);
  }
  const prev = $("#revPrev"), next = $("#revNext");
  if (prev) prev.addEventListener("click", () => { show(idx - 1); restart(); });
  if (next) next.addEventListener("click", () => { show(idx + 1); restart(); });
  show(0); restart();
})();
