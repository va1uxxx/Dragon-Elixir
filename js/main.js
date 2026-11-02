import { initHeroScene, initCanScene, drawEye } from "./scenes.js";

const doc = document;
const body = doc.body;
const $ = (sel, ctx = doc) => ctx.querySelector(sel);
const $$ = (sel, ctx = doc) => Array.from(ctx.querySelectorAll(sel));
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const Lenis = window.Lenis;

const state = {
  hero: null,
  can: null,
  lenis: null,
  filmUserPaused: false,
  overlayOpen: false,
};

if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   Boot
   ============================================================ */

function boot() {
  try {
    splitAll();
    initScenes();
    initEyeCanvases();
    initNav();
    initCursor();
    initMagnetic();
    initVideos();
    initWaitlist();
    initRail();
    initReveals();
    initScrollAnimations();
    initLoader();
  } catch (err) {
    console.error(err);
    hideLoaderImmediately();
  }
}

if (doc.readyState === "loading") {
  doc.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

/* ============================================================
   Text splitting
   ============================================================ */

function splitAll() {
  $$("[data-split]").forEach((el) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const words = child.textContent.split(/(\s+)/);
          if (!words.some((w) => w.trim())) return;
          const frag = doc.createDocumentFragment();
          words.forEach((word) => {
            if (!word.trim()) {
              frag.appendChild(doc.createTextNode(word));
              return;
            }
            const outer = doc.createElement("span");
            outer.className = "w";
            const inner = doc.createElement("span");
            inner.textContent = word;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName === "BR") return;
          walk(child);
        }
      });
    };
    walk(el);
  });
}

/* ============================================================
   Scenes
   ============================================================ */

async function initScenes() {
  if (doc.fonts && doc.fonts.ready) {
    try {
      await doc.fonts.ready;
    } catch (err) {
      /* noop */
    }
  }

  const heroCanvas = $("#hero-canvas");
  const canCanvas = $("#can-canvas");
  const angleEl = $("#can-angle");

  state.hero = initHeroScene(heroCanvas, { reducedMotion: prefersReduced });
  state.can = initCanScene(canCanvas, {
    reducedMotion: prefersReduced,
    onAngle: (deg) => {
      if (angleEl) angleEl.textContent = `${String(deg).padStart(3, "0")}°`;
    },
  });

  if (!state.hero || !state.can) body.classList.add("no-webgl");
  else body.classList.remove("no-webgl");
  if (canCanvas) canCanvas.dataset.cursor = "Drag";
}

/* ============================================================
   Loader
   ============================================================ */

function initLoader() {
  const loader = $("#loader");
  const bar = $("#loader-bar");
  const pct = $("#loader-pct");
  if (!loader) {
    startSite();
    return;
  }

  let progress = 0;
  let finished = false;

  const paint = (v) => {
    progress = Math.max(progress, Math.min(100, v));
    if (bar) bar.style.transform = `scaleX(${progress / 100})`;
    if (pct) pct.textContent = String(Math.round(progress)).padStart(2, "0");
  };

  paint(8);

  const timer = setInterval(() => {
    if (progress < 88) paint(progress + Math.random() * 7);
  }, 150);

  const loaded =
    doc.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));

  const fonts =
    doc.fonts && doc.fonts.ready ? doc.fonts.ready.catch(() => {}) : Promise.resolve();

  const minWait = new Promise((resolve) => setTimeout(resolve, 1100));

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    paint(100);

    setTimeout(() => {
      if (prefersReduced) {
        loader.style.display = "none";
        loader.setAttribute("aria-hidden", "true");
        loader.remove();
        startSite();
        return;
      }

      // CSS-driven exit: keeps the reveal reliable even on slow GPUs.
      startSite();
      loader.classList.add("is-done");
      setTimeout(() => loader.remove(), 1250);
    }, 350);
  };

  Promise.all([loaded, fonts, minWait]).then(finish);

  // Failsafe: never trap the visitor behind the loader.
  setTimeout(() => {
    if (!finished) finish();
  }, 9000);
}

function startSite() {
  body.classList.remove("is-loading");
  body.classList.add("is-ready");
  if (finePointer) body.classList.add("cursor-ready");

  initSmoothScroll();
  heroIntro();

  if (ScrollTrigger) {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}

function hideLoaderImmediately() {
  const loader = $("#loader");
  if (loader) loader.remove();
  body.classList.remove("is-loading");
  body.classList.add("is-ready");
  initSmoothScroll();
}

function heroIntro() {
  if (!gsap) return;

  const lines = $$("[data-hero-line] > span");
  const bits = $$("[data-hero]").filter((el) => !el.hasAttribute("data-hero-line"));
  const media = $('[data-hero="media"]');
  const nav = $(".nav");

  if (prefersReduced) {
    gsap.set([...lines, ...bits, media, nav].filter(Boolean), { clearProps: "all" });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.fromTo(nav, { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0)
    .fromTo(
      lines,
      { yPercent: 118 },
      { yPercent: 0, duration: 1.35, stagger: 0.11, ease: "expo.out" },
      0.12
    )
    .fromTo(
      $('[data-hero="eyebrow"]'),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.4
    )
    .fromTo(
      $('[data-hero="sub"]'),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.54
    )
    .fromTo(
      $('[data-hero="actions"]'),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.66
    )
    .fromTo(
      $('[data-hero="stats"]'),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.76
    )
    .fromTo(
      media,
      { opacity: 0, y: 46, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "expo.out" },
      0.46
    )
    .fromTo(
      ".hero__footer > *",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
      0.95
    );
}

/* ============================================================
   Smooth scroll
   ============================================================ */

function initSmoothScroll() {
  if (prefersReduced || !Lenis || !gsap) {
    initNavScrollFallback();
    return;
  }

  state.lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.35,
  });

  if (ScrollTrigger) state.lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => state.lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  state.lenis.on("scroll", ({ scroll }) => {
    const nav = $("#nav");
    if (nav) nav.classList.toggle("is-scrolled", scroll > 40);
  });

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = href === "#top" ? doc.body : $(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      state.lenis.scrollTo(target, {
        offset: href === "#top" ? 0 : -10,
        duration: 1.35,
      });
    });
  });

  initNavScrollFallback();
}

function initNavScrollFallback() {
  if (state.lenis) return;
  const onScroll = () => {
    const nav = $("#nav");
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   Navigation + overlay
   ============================================================ */

function initNav() {
  const nav = $("#nav");
  const toggle = $(".nav__toggle");
  const overlay = $("#nav-overlay");
  if (!nav || !toggle || !overlay) return;

  toggle.addEventListener("click", () => {
    state.overlayOpen = !state.overlayOpen;
    nav.classList.toggle("is-open", state.overlayOpen);
    overlay.classList.toggle("is-open", state.overlayOpen);
    toggle.setAttribute("aria-expanded", String(state.overlayOpen));
    overlay.setAttribute("aria-hidden", String(!state.overlayOpen));
    if (state.overlayOpen) {
      state.lenis?.stop();
      body.style.overflow = "hidden";
    } else {
      state.lenis?.start();
      body.style.overflow = "";
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  doc.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

function closeMenu() {
  const nav = $("#nav");
  const toggle = $(".nav__toggle");
  const overlay = $("#nav-overlay");
  if (!state.overlayOpen || !nav || !toggle || !overlay) return;
  state.overlayOpen = false;
  nav.classList.remove("is-open");
  overlay.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  overlay.setAttribute("aria-hidden", "true");
  state.lenis?.start();
  body.style.overflow = "";
}

/* ============================================================
   Cursor + magnetic buttons
   ============================================================ */

function initCursor() {
  if (!finePointer || !gsap) return;
  const cursor = $("#cursor");
  if (!cursor) return;
  const label = $(".cursor__label", cursor);

  const xTo = gsap.quickTo(cursor, "x", { duration: 0.32, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.32, ease: "power3" });

  window.addEventListener(
    "pointermove",
    (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    },
    { passive: true }
  );

  const hoverables = $$("a, button, input, [data-cursor]");
  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("is-hover");
      if (label) label.textContent = el.dataset.cursor || (el.matches("input") ? "Type" : "View");
    });
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    el.addEventListener("blur", () => cursor.classList.remove("is-hover"));
  });

  doc.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
  doc.addEventListener("mouseenter", () => (cursor.style.opacity = "1"));
}

function initMagnetic() {
  if (!finePointer || !gsap || prefersReduced) return;
  $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      gsap.to(el, {
        x: x * 7,
        y: y * 5,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
    });
  });
}

/* ============================================================
   Video controls
   ============================================================ */

function initVideos() {
  const heroVideo = $("#hero-video");
  const filmVideo = $("#film-video");
  const filmBtn = $("#film [data-video-play]");
  const heroBtn = $(".hero [data-video-play]");

  const setFilmUI = (playing) => {
    if (!filmBtn) return;
    filmBtn.classList.toggle("is-paused", !playing);
    filmBtn.setAttribute("aria-label", playing ? "Pause film" : "Play film");
    const span = filmBtn.querySelector("span");
    if (span) span.textContent = playing ? "Pause the film" : "Play the film";
  };

  if (prefersReduced) {
    heroVideo?.pause();
    filmVideo?.pause();
    heroBtn?.classList.add("is-paused");
    setFilmUI(false);
  } else if (heroVideo) {
    heroVideo
      .play()
      .then(() => heroBtn?.classList.remove("is-paused"))
      .catch(() => {
        heroBtn?.classList.add("is-paused");
      });
  }

  $$("[data-video-play]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest("section");
      const video = section?.querySelector("video");
      if (!video) return;
      const isFilm = section.id === "film";
      if (video.paused) {
        video.play().catch(() => {});
        btn.classList.remove("is-paused");
        btn.setAttribute("aria-label", "Pause film");
        if (isFilm) {
          state.filmUserPaused = false;
          setFilmUI(true);
        }
        syncMute(video);
      } else {
        video.pause();
        btn.classList.add("is-paused");
        btn.setAttribute("aria-label", "Play film");
        if (isFilm) {
          state.filmUserPaused = true;
          setFilmUI(false);
        }
      }
    });
  });

  // Keep the buttons honest no matter what starts or stops a video:
  // autoplay, the scroll observer, or a click.
  const bindVideoUI = (video, btn, isFilm) => {
    if (!video || !btn) return;
    const paint = (playing) => {
      if (isFilm) {
        setFilmUI(playing);
      } else {
        btn.classList.toggle("is-paused", !playing);
        btn.setAttribute("aria-label", playing ? "Pause film" : "Play film");
      }
    };
    video.addEventListener("play", () => paint(true));
    video.addEventListener("pause", () => paint(false));
    paint(!video.paused);
  };
  bindVideoUI(heroVideo, heroBtn, false);
  bindVideoUI(filmVideo, filmBtn, true);

  // film autoplay while in view, until the visitor takes control
  if (filmVideo && !prefersReduced) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!state.filmUserPaused) {
            filmVideo
              .play()
              .then(() => setFilmUI(true))
              .catch(() => setFilmUI(false));
          }
        } else {
          filmVideo.pause();
          if (!state.filmUserPaused) setFilmUI(false);
        }
      },
      { threshold: 0.2 }
    );
    io.observe($("#film"));
  }

  // sound toggle
  const toggles = $$("[data-audio-toggle]");
  const setMuted = (muted) => {
    [heroVideo, filmVideo].forEach((v) => {
      if (!v) return;
      v.muted = muted;
      v.volume = muted ? 1 : 0.72;
    });
    toggles.forEach((t) => {
      t.setAttribute("aria-pressed", String(!muted));
      t.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
      const text = $(".sound-toggle__text", t);
      if (text) text.textContent = muted ? "Sound off" : "Sound on";
    });
  };

  toggles.forEach((t) => {
    t.addEventListener("click", () => {
      const isMuted = heroVideo ? heroVideo.muted : true;
      setMuted(!isMuted);
      if (isMuted) {
        heroVideo?.play().catch(() => {});
        if (filmVideo && !state.filmUserPaused) filmVideo.play().catch(() => {});
      }
    });
  });

  function syncMute(video) {
    const toggle = $("[data-audio-toggle]");
    if (toggle) toggle.setAttribute("aria-pressed", String(!video.muted));
  }
}

/* ============================================================
   Waitlist
   ============================================================ */

function initWaitlist() {
  const form = $("#waitlist");
  const status = $("#signup-status");
  const input = $("#email");
  if (!form || !status || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    if (!valid) {
      status.textContent = "That doesn't look like a real address. Try again.";
      status.classList.add("is-error");
      input.focus();
      return;
    }

    status.classList.remove("is-error");
    status.textContent = "Signal received. Watch the dark.";
    const btn = $(".signup__btn", form);
    if (btn) {
      btn.classList.add("is-done");
      btn.disabled = true;
      const span = btn.querySelector("span");
      if (span) span.textContent = "You're on the list";
      if (gsap) {
        gsap.fromTo(btn, { scale: 1 }, { scale: 1.06, duration: 0.25, yoyo: true, repeat: 1 });
      }
    }
    input.value = "";
    input.disabled = true;
  });
}

/* ============================================================
   Section rail
   ============================================================ */

function initRail() {
  const rail = $("#rail");
  if (!rail) return;
  const items = $$("li", rail);
  const progress = $("#rail-progress");

  const ids = ["top", "manifesto", "elixir", "specimen", "ritual", "film", "stockists"];
  const setActive = (id) => {
    items.forEach((li) => li.classList.toggle("is-active", li.dataset.rail === id));
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
  );

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  if (progress) {
    if (ScrollTrigger) {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          progress.style.transform = `scaleY(${self.progress})`;
        },
      });
    } else {
      const onScroll = () => {
        const max = doc.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }
}

/* ============================================================
   Eye canvases
   ============================================================ */

function initEyeCanvases() {
  $$(".manifesto__eye, .stockists__eye").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const eye = { x: 0, y: 0, targetX: 0, targetY: 0, visible: false, raf: 0, last: 0 };
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      eye.visible = entry.isIntersecting;
    });
    io.observe(canvas);

    window.addEventListener(
      "pointermove",
      (e) => {
        eye.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        eye.targetY = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );

    const loop = (now) => {
      eye.raf = requestAnimationFrame(loop);
      if (!eye.visible) return;
      if (now - eye.last < 32) return;
      eye.last = now;
      eye.x += (eye.targetX - eye.x) * 0.045;
      eye.y += (eye.targetY - eye.y) * 0.045;
      const size = Math.min(w, h);
      drawEye(ctx, size, now * 0.001, eye.x, eye.y, 0.6);
    };
    loop(0);

    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(eye.raf);
      ro.disconnect();
      io.disconnect();
    });
  });
}

/* ============================================================
   Scroll choreography
   ============================================================ */

function initReveals() {
  if (!gsap || !ScrollTrigger) return;

  $$(".reveal").forEach((el) => {
    if (prefersReduced) return;
    gsap.fromTo(
      el,
      { y: 34, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 89%", once: true },
      }
    );
  });

  $$("[data-split]").forEach((el) => {
    const words = $$(".w > span", el);
    if (!words.length) return;
    if (prefersReduced) return;
    gsap.fromTo(
      words,
      { yPercent: 118 },
      {
        yPercent: 0,
        duration: 1.05,
        ease: "power4.out",
        stagger: 0.045,
        scrollTrigger: { trigger: el, start: "top 87%", once: true },
      }
    );
  });

  // manifesto reading: gently brighten the words as they pass
  const statement = $(".manifesto__statement");
  if (statement && !prefersReduced) {
    const words = $$(".w > span", statement);
    gsap.fromTo(
      words,
      { opacity: 0.22 },
      {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: statement,
          start: "top 72%",
          end: "bottom 55%",
          scrub: true,
        },
      }
    );
  }

  // counters
  $$("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el.closest("section") || el,
      start: "top 78%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      },
    });
  });

  // nutrition bars
  const label = $("#label");
  if (label) {
    const bars = $$(".label__bar", label);
    bars.forEach((bar) => {
      const pct = parseFloat(getComputedStyle(bar.parentElement).getPropertyValue("--pct")) || 0;
      gsap.set(bar, { scaleX: 0 });
      gsap.to(bar, {
        scaleX: Math.min(1, pct / 100),
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: { trigger: label, start: "top 78%", once: true },
        delay: 0.25,
      });
    });
  }
}

function initScrollAnimations() {
  if (!gsap || !ScrollTrigger) return;

  // hero scene follows the page
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => state.hero?.setScroll(self.progress),
  });

  if (!prefersReduced) {
    gsap.to(".hero__copy", {
      yPercent: -9,
      opacity: 0.35,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero__media", {
      yPercent: -5,
      scale: 1.02,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".film-card__inner", {
      rotate: 0.2,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".manifesto__ghost", {
      yPercent: -16,
      ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.to(".manifesto__eye", {
      yPercent: 9,
      ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.to(".elixir__aura", {
      yPercent: -14,
      ease: "none",
      scrollTrigger: { trigger: ".elixir", start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.to(".stockists__eye", {
      yPercent: -10,
      ease: "none",
      scrollTrigger: { trigger: ".stockists", start: "top bottom", end: "bottom top", scrub: true },
    });
  }

  // can rotation driven by the section scroll
  ScrollTrigger.create({
    trigger: ".elixir",
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => state.can?.setScroll(self.progress),
  });

  // film section
  const film = $(".film");
  if (film && !prefersReduced) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: film,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.fromTo(".film__media video", { scale: 1.18 }, { scale: 1, ease: "none" }, 0)
      .fromTo(".film__quote", { y: 70, opacity: 0.25 }, { y: -50, opacity: 1, ease: "none" }, 0)
      .fromTo(".film__top", { y: 26, opacity: 0.55 }, { y: 0, opacity: 1, ease: "none" }, 0)
      .fromTo(".film__bottom", { y: 24, opacity: 0.6 }, { y: 0, opacity: 1, ease: "none" }, 0);
  }

  // section heads drift in
  if (!prefersReduced) {
    $$(".section-head, .specimen__head, .ritual__head, .stockists__head").forEach((head) => {
      gsap.fromTo(
        head,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: head, start: "top 90%", once: true },
        }
      );
    });
  }

  ScrollTrigger.refresh();
}

/* ============================================================
   Reduced motion / misc
   ============================================================ */

window.addEventListener("pagehide", () => {
  state.hero?.dispose?.();
  state.can?.dispose?.();
});

// Avoid a stuck loader if a hard error happens after boot.
window.addEventListener("error", () => {
  if (body.classList.contains("is-loading")) hideLoaderImmediately();
});
