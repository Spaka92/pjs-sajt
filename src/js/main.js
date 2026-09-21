/* ============================================================
   MAIN.JS
   One function per feature. All started at the bottom in init().
   Delete a function and its line in init() to remove a feature —
   nothing else breaks. That is the whole point of this shape.
   ============================================================ */


/* ---------- 1. MOBILE MENU -----------------------------------
   JavaScript flips a class. CSS decides what that class looks
   like. Keep that division and you always know which file to
   open when something is wrong.
   ----------------------------------------------------------- */

function setUpMobileMenu() {
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", function () {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}


/* ---------- 2. HERO ROTATOR ----------------------------------
   Cycles the line under the headline. To change the wording,
   edit this array — nothing else needs touching.
   ----------------------------------------------------------- */

const ROTATOR_PHRASES = [
  "да региструјете пољопривредно газдинство",
  "да израдите бизнис план и структуру исплативости",
  "да обезбедите средства за покретање производње",
  "да аплицирате за подстицаје и субвенције",
  "да повољно набавите машине и репроматеријал",
  "да осигурате производњу",
  "да обезбедите сигурнији пласман производа"
];

function setUpHeroRotator() {
  const target = document.getElementById("rotator");
  if (!target) return;

  // Someone who asked their system to reduce motion gets the
  // first phrase and no movement at all.
  const stillPreferred = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (stillPreferred) return;

  let index = 0;

  setInterval(function () {
    target.classList.add("is-fading");   // fade out

    setTimeout(function () {
      index = (index + 1) % ROTATOR_PHRASES.length;  // wrap to 0 at the end
      target.textContent = ROTATOR_PHRASES[index];
      target.classList.remove("is-fading");          // fade back in
    }, 300);                                          // must match the CSS transition
  }, 3200);
}


/* ---------- 3. COUNTING STATS --------------------------------
   The numbers stay at 0 until the section scrolls into view,
   then count up once. IntersectionObserver is the browser
   telling us "this element is now visible" — far cheaper than
   checking the scroll position on every frame.
   ----------------------------------------------------------- */

function animateCount(element) {
  const target = Number(element.dataset.countTo);
  const duration = 1400;          // milliseconds
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);

    // Ease-out: fast at first, slowing as it lands.
    const eased = 1 - Math.pow(1 - progress, 3);

    element.textContent = Math.round(target * eased).toLocaleString("sr-RS");

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      element.classList.add("is-done");   // CSS adds the glow
    }
  }

  requestAnimationFrame(frame);
}

function setUpStatCounters() {
  const values = document.querySelectorAll(".stat__value");
  if (values.length === 0) return;

  const stillPreferred = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (stillPreferred) {
    values.forEach(function (el) {
      el.textContent = Number(el.dataset.countTo).toLocaleString("sr-RS");
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      animateCount(entry.target);
      observer.unobserve(entry.target);   // run once, then stop watching
    });
  }, { threshold: 0.4 });

  values.forEach(function (el) {
    observer.observe(el);
  });
}


/* ---------- 4. MEMBERSHIP FORM -------------------------------
   A static site has no server, so nothing is actually sent yet.
   We validate and confirm on screen. Connecting a real inbox is
   a later step and only changes this one function.
   ----------------------------------------------------------- */

function setUpForm() {
  const form = document.getElementById("quote-form");
  const status = document.getElementById("form-status");

  if (!form || !status) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();     // stop the browser reloading the page

    const invalid = [];

    form.querySelectorAll("input, textarea").forEach(function (input) {
      const field = input.closest(".field");
      const isEmpty = input.value.trim() === "";

      field.classList.toggle("has-error", isEmpty);
      if (isEmpty) invalid.push(input);
    });

    if (invalid.length > 0) {
      status.textContent = "Попуните сва поља.";
      invalid[0].focus();
      return;
    }

    status.textContent = "Хвала — јављамо се у року од једног радног дана.";
    form.reset();
  });
}


/* ---------- 5. FOOTER YEAR ------------------------------------ */

function setCurrentYear() {
  const target = document.getElementById("year");
  if (target) target.textContent = new Date().getFullYear();
}


/* ---------- 6. SCROLL REVEAL ---------------------------------
   Elements marked .reveal fade up as they enter the viewport.
   Same IntersectionObserver idea as the counters. Keep the
   distance small - 18px, not 100px. Big entrance animations
   make a page feel slow, not lively.
   ----------------------------------------------------------- */

function setUpScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (items.length === 0) return;

  const stillPreferred = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (stillPreferred) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);       // animate once only
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  items.forEach(function (el) { observer.observe(el); });
}


/* ---------- 7. STICKY HEADER STATE ---------------------------
   The header only grows a border once it is actually floating
   over content. A sentinel element is cheaper and smoother than
   listening to the scroll event.
   ----------------------------------------------------------- */

function setUpStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  document.body.prepend(sentinel);

  new IntersectionObserver(function (entries) {
    header.classList.toggle("is-stuck", !entries[0].isIntersecting);
  }).observe(sentinel);
}


/* ---------- 8. SCROLL PROGRESS BAR ---------------------------
   scaleX is cheap for the browser to draw - it happens on the
   graphics card. Changing width instead would force the whole
   page to be re-laid-out on every single scroll event.
   ----------------------------------------------------------- */

function setUpScrollProgress() {
  const bar = document.getElementById("progress");
  if (!bar) return;

  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    bar.style.transform = "scaleX(" + ratio + ")";
  }

  // passive:true promises we will not block the scroll, which
  // lets the browser keep scrolling smoothly while we work.
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}


/* ---------- 9. CURSOR SPOTLIGHT -------------------------------
   We write the pointer position into two CSS custom properties
   and let the stylesheet draw the glow. JavaScript decides
   WHERE, CSS decides WHAT IT LOOKS LIKE.
   ----------------------------------------------------------- */

function setUpSpotlight() {
  const cards = document.querySelectorAll(".spotlight");
  if (cards.length === 0) return;

  // Pointless on a touch screen - there is no hovering cursor.
  if (!window.matchMedia("(hover: hover)").matches) return;

  cards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      const box = card.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * 100;
      const y = ((event.clientY - box.top) / box.height) * 100;

      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    });
  });
}


/* ---------- 10. IMAGE FALLBACK --------------------------------
   The photographs load from Pexels. If one ever fails, swap in
   the local drawing rather than leaving a broken-image icon.
   Delete this once your images live in your own images/ folder.
   ----------------------------------------------------------- */

function setUpImageFallbacks() {
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () {
      img.src = img.dataset.fallback;
    });
  });
}


/* ---------- 11. 3D TILT ---------------------------------------
   The card leans toward the pointer. We hand CSS two angles and
   it builds the transform. Angles stay small - beyond about 8
   degrees a card stops looking solid and starts looking silly.
   ----------------------------------------------------------- */

const TILT_MAX = 6;   // degrees

function setUpTilt() {
  const cards = document.querySelectorAll(".tilt");
  if (cards.length === 0) return;

  // No pointer to follow on a touch screen, and reduced-motion
  // users have asked us not to do this.
  if (!window.matchMedia("(hover: hover)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      const box = card.getBoundingClientRect();

      // Convert the pointer into a -0.5 .. +0.5 range from centre.
      const px = (event.clientX - box.left) / box.width  - 0.5;
      const py = (event.clientY - box.top)  / box.height - 0.5;

      // Y position tilts around the X axis, and vice versa.
      // The minus sign makes the card lean TOWARD the cursor.
      card.style.setProperty("--rx", (-py * TILT_MAX * 2).toFixed(2) + "deg");
      card.style.setProperty("--ry", ( px * TILT_MAX * 2).toFixed(2) + "deg");
      card.classList.add("is-tilting");
    });

    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.classList.remove("is-tilting");   // eases back to flat
    });
  });
}


/* ---------- 12. MAGNETIC BUTTONS ------------------------------
   Buttons drift a few pixels toward the pointer while it is near.
   The whole effect is 8 pixels. Any more and it feels broken.
   ----------------------------------------------------------- */

const MAGNET_STRENGTH = 0.28;   // fraction of the distance
const MAGNET_MAX = 8;           // pixels, hard cap

function setUpMagneticButtons() {
  const buttons = document.querySelectorAll(".magnetic");
  if (buttons.length === 0) return;

  if (!window.matchMedia("(hover: hover)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function clamp(value, limit) {
    return Math.max(-limit, Math.min(limit, value));
  }

  buttons.forEach(function (button) {
    button.addEventListener("pointermove", function (event) {
      const box = button.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);

      button.style.setProperty("--pull-x", clamp(dx * MAGNET_STRENGTH, MAGNET_MAX).toFixed(1) + "px");
      button.style.setProperty("--pull-y", clamp(dy * MAGNET_STRENGTH, MAGNET_MAX).toFixed(1) + "px");
      button.classList.add("is-pulled");
    });

    button.addEventListener("pointerleave", function () {
      button.style.setProperty("--pull-x", "0px");
      button.style.setProperty("--pull-y", "0px");
      button.classList.remove("is-pulled");   // springs back
    });
  });
}


/* ---------- 13. HERO DEPTH + MOVING SUN -----------------------
   Two things at once as the cursor sweeps the hero:
     - the near half of the photo slides further than the far
       half, which the eye reads as depth
     - the warm glow in the tint drifts toward the pointer

   The important part is the easing. We keep a TARGET (where the
   cursor is) and a CURRENT (where the image actually is), and
   move current 8% of the way to target each frame. Snapping
   straight to the pointer feels cheap; the lag is what sells it.
   ----------------------------------------------------------- */

const HERO_EASE     = 0.08;   // fraction of the gap closed per frame
const HERO_FAR_PUSH = 10;     // pixels, distant half
const HERO_NEAR_PUSH = 26;    // pixels, close half - the ratio is the effect
const HERO_VERTICAL = 0.6;    // less vertical travel; feels calmer

function setUpHeroDepth() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const far  = hero.querySelector(".hero__plane--far");
  const near = hero.querySelector(".hero__plane--near");
  if (!far || !near) return;

  // No cursor on a touch screen, and reduced-motion users have
  // asked us not to do this.
  if (!window.matchMedia("(hover: hover)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let tx = 0, ty = 0;      // target,  -1 .. 1
  let cx = 0, cy = 0;      // current
  let running = false;

  function push(plane, amount) {
    plane.style.setProperty("--px", (-cx * amount).toFixed(2) + "px");
    plane.style.setProperty("--py", (-cy * amount * HERO_VERTICAL).toFixed(2) + "px");
  }

  function frame() {
    cx += (tx - cx) * HERO_EASE;
    cy += (ty - cy) * HERO_EASE;

    push(far,  HERO_FAR_PUSH);
    push(near, HERO_NEAR_PUSH);

    // The sun drifts toward the cursor. 78%/42% is where it sits
    // in the photograph, so we move outward from there.
    hero.style.setProperty("--gx", (68 + cx * 22).toFixed(1) + "%");
    hero.style.setProperty("--gy", (44 + cy * 18).toFixed(1) + "%");

    // Stop the loop once it has settled and the pointer has left.
    // No reason to burn a frame every 16ms on a still image.
    if (Math.abs(tx - cx) < 0.001 && Math.abs(ty - cy) < 0.001) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  hero.addEventListener("pointermove", function (event) {
    const box = hero.getBoundingClientRect();
    tx = (event.clientX - box.left) / box.width  * 2 - 1;   // -1 left, +1 right
    ty = (event.clientY - box.top)  / box.height * 2 - 1;
    start();
  });

  hero.addEventListener("pointerleave", function () {
    tx = 0;
    ty = 0;
    start();      // eases back to centre rather than snapping
  });
}


/* ---------- START ----------------------------------------------
   Everything on the page already exists when this runs. Eleventy
   builds complete HTML, so there is nothing to wait for and
   nothing to re-wire. This is the simplification the rebuild
   bought us: no fetch, no injected markup, no re-init.
   ----------------------------------------------------------- */

function init() {
  setUpMobileMenu();
  setUpHeroRotator();
  setUpStatCounters();
  setUpForm();
  setCurrentYear();
  setUpScrollReveal();
  setUpStickyHeader();
  setUpScrollProgress();
  setUpSpotlight();
  setUpImageFallbacks();
  setUpTilt();
  setUpMagneticButtons();
  setUpHeroDepth();
}

init();

