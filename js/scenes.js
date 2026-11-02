import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ============================================================
   Canvas-painted textures
   ============================================================ */

export function drawEye(ctx, size, time = 0, lookX = 0, lookY = 0, detail = 1) {
  const c = size / 2;
  const R = size * 0.335;
  ctx.clearRect(0, 0, size, size);

  // outer atmospheric glow
  let g = ctx.createRadialGradient(c, c, R * 0.2, c, c, size * 0.5);
  g.addColorStop(0, "rgba(90,255,175,0.16)");
  g.addColorStop(0.45, "rgba(35,150,100,0.08)");
  g.addColorStop(0.75, "rgba(10,60,40,0.03)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // scaly outer rings
  const rings = 5;
  for (let r = 0; r < rings; r++) {
    const rad = R * (1.12 + r * 0.105);
    const count = 34 + r * 10;
    const alpha = 0.16 - r * 0.022;
    if (alpha <= 0) continue;
    ctx.strokeStyle = `rgba(96,255,170,${alpha})`;
    ctx.lineWidth = Math.max(1, size * 0.0013);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + r * 0.22;
      ctx.beginPath();
      ctx.arc(
        c + Math.cos(a) * rad * 0.94,
        c + Math.sin(a) * rad * 0.94,
        R * 0.12,
        a - Math.PI / 2 - 0.34,
        a - Math.PI / 2 + 0.34
      );
      ctx.stroke();
    }
  }

  // iris base
  g = ctx.createRadialGradient(c, c, 0, c, c, R);
  g.addColorStop(0, "#fff1bd");
  g.addColorStop(0.14, "#e9d78d");
  g.addColorStop(0.32, "#a6e78b");
  g.addColorStop(0.55, "#2f9b66");
  g.addColorStop(0.78, "#0c4e36");
  g.addColorStop(0.94, "#06271b");
  g.addColorStop(1, "#020c08");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.fill();

  // radial iris fibres
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R * 0.985, 0, Math.PI * 2);
  ctx.clip();
  const fibreCount = Math.round(260 * detail);
  for (let i = 0; i < fibreCount; i++) {
    const seed = Math.sin(i * 127.1) * 43758.5453;
    const rand = seed - Math.floor(seed);
    const rand2 = Math.abs(Math.sin(i * 321.7 + 12.9));
    const a = (i / fibreCount) * Math.PI * 2 + time * 0.014 + rand * 0.05;
    const inner = R * (0.16 + rand2 * 0.4);
    const outer = R * (0.68 + rand * 0.31);
    const hue = 58 + rand * 82;
    const alpha = 0.12 + rand2 * 0.34;
    ctx.strokeStyle = `hsla(${hue}, 82%, ${48 + rand * 24}%, ${alpha})`;
    ctx.lineWidth = 0.5 + rand2 * (size * 0.0016);
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * inner, c + Math.sin(a) * inner);
    ctx.lineTo(
      c + Math.cos(a + (rand - 0.5) * 0.05) * outer,
      c + Math.sin(a + (rand - 0.5) * 0.05) * outer
    );
    ctx.stroke();
  }
  // collarette
  ctx.strokeStyle = "rgba(255,238,175,0.32)";
  ctx.lineWidth = size * 0.0022;
  ctx.setLineDash([size * 0.006, size * 0.012]);
  ctx.beginPath();
  ctx.arc(c, c, R * 0.47, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // limbal ring
  ctx.strokeStyle = "rgba(1,10,6,0.9)";
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.arc(c, c, R * 0.985, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(120,255,180,0.18)";
  ctx.lineWidth = size * 0.002;
  ctx.beginPath();
  ctx.arc(c, c, R * 1.01, 0, Math.PI * 2);
  ctx.stroke();

  // slit pupil, follows the cursor a little
  const px = c + THREE.MathUtils.clamp(lookX, -1, 1) * R * 0.1;
  const py = c + THREE.MathUtils.clamp(lookY, -1, 1) * R * 0.1;
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R * 0.9, 0, Math.PI * 2);
  ctx.clip();

  const pupilW = R * (0.105 + Math.sin(time * 0.6) * 0.008);
  const pupilH = R * 0.76;
  const pg = ctx.createRadialGradient(px, py, 0, px, py, pupilH);
  pg.addColorStop(0, "#000000");
  pg.addColorStop(0.58, "#010503");
  pg.addColorStop(0.85, "rgba(0,6,3,0.92)");
  pg.addColorStop(1, "rgba(1,16,10,0)");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.ellipse(px, py, pupilW, pupilH, 0, 0, Math.PI * 2);
  ctx.fill();

  // inner limbal glow around pupil
  ctx.strokeStyle = "rgba(210,255,190,0.14)";
  ctx.lineWidth = size * 0.003;
  ctx.beginPath();
  ctx.ellipse(px, py, pupilW * 1.45, pupilH * 0.92, 0, 0, Math.PI * 2);
  ctx.stroke();

  // glints
  ctx.globalCompositeOperation = "screen";
  const glint = ctx.createRadialGradient(
    c - R * 0.24,
    c - R * 0.3,
    0,
    c - R * 0.24,
    c - R * 0.3,
    R * 0.18
  );
  glint.addColorStop(0, "rgba(255,255,240,0.9)");
  glint.addColorStop(0.4, "rgba(240,255,220,0.3)");
  glint.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glint;
  ctx.beginPath();
  ctx.arc(c - R * 0.24, c - R * 0.3, R * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(220,255,235,0.5)";
  ctx.beginPath();
  ctx.ellipse(c + R * 0.21, c + R * 0.18, R * 0.035, R * 0.015, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // vignette
  g = ctx.createRadialGradient(c, c, R * 1.05, c, c, size * 0.5);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.6, "rgba(2,8,5,0.08)");
  g.addColorStop(1, "rgba(2,6,4,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
}

function createTextureFromCanvas(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function createEyeTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  drawEye(ctx, size, 0, 0, 0, 0.7);
  return createTextureFromCanvas(canvas);
}

function createGlowTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.18, "rgba(210,255,230,0.55)");
  g.addColorStop(0.5, "rgba(120,255,190,0.13)");
  g.addColorStop(1, "rgba(20,80,55,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return createTextureFromCanvas(canvas);
}

function createShadowTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.7)");
  g.addColorStop(0.42, "rgba(0,0,0,0.34)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return createTextureFromCanvas(canvas);
}

function letterSpaced(ctx, text, x, y, spacing) {
  ctx.textAlign = "left";
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cursor = x - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[i] + spacing;
  });
}

/* ============================================================
   Can label
   ============================================================ */

function drawEyeGlyph(ctx, cx, cy, r) {
  // outer ritual rings
  ctx.save();
  ctx.strokeStyle = "rgba(217,178,96,0.5)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 10]);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(217,178,96,0.9)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r1 = r * 1.2;
    const r2 = r * (i % 4 === 0 ? 1.36 : 1.3);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // almond eye
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.quadraticCurveTo(cx, cy - r * 0.68, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy + r * 0.68, cx - r, cy);
  ctx.closePath();
  ctx.fillStyle = "#020a06";
  ctx.fill();
  ctx.strokeStyle = "#d9b260";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // iris
  const ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.36);
  ig.addColorStop(0, "#f4e3b2");
  ig.addColorStop(0.35, "#8dffc0");
  ig.addColorStop(0.72, "#1c8a58");
  ig.addColorStop(1, "#062a1b");
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.36, 0, Math.PI * 2);
  ctx.fill();

  // slit
  ctx.fillStyle = "#010503";
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.045, r * 0.33, 0, 0, Math.PI * 2);
  ctx.fill();

  // glint
  ctx.fillStyle = "rgba(245,255,235,0.85)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.12, cy - r * 0.14, r * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // lashes / spikes
  ctx.strokeStyle = "rgba(217,178,96,0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const x = cx - r + t * r * 0.45;
    ctx.beginPath();
    ctx.moveTo(x, cy - r * 0.28 - t * r * 0.32);
    ctx.lineTo(x - r * 0.08, cy - r * 0.55 - t * r * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

function createCanLabel() {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // base
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#05120c");
  bg.addColorStop(0.24, "#0b2e20");
  bg.addColorStop(0.5, "#0e3b29");
  bg.addColorStop(0.76, "#082418");
  bg.addColorStop(1, "#030a07");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // central glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, W * 0.36);
  glow.addColorStop(0, "rgba(90,255,175,0.15)");
  glow.addColorStop(0.5, "rgba(32,140,95,0.05)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // scales
  ctx.lineWidth = 2;
  for (let row = -1; row < 22; row++) {
    for (let col = -1; col < 34; col++) {
      const x = col * 64 + (row % 2 ? 32 : 0);
      const y = row * 50;
      ctx.strokeStyle = `rgba(141,255,192,${0.028 + ((row + col) % 3) * 0.012})`;
      ctx.beginPath();
      ctx.arc(x, y, 38, 0, Math.PI);
      ctx.stroke();
    }
  }

  // fine gold frame lines
  ctx.strokeStyle = "rgba(217,178,96,0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 108);
  ctx.lineTo(W, 108);
  ctx.moveTo(0, H - 108);
  ctx.lineTo(W, H - 108);
  ctx.stroke();

  // top microtype band
  ctx.fillStyle = "rgba(233,228,212,0.72)";
  ctx.font = "500 22px 'Space Grotesk', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 6; i++) {
    letterSpaced(ctx, "DRAGON ELIXIR · JADE VENOM", 170 + i * 340, 58, 5);
  }

  // bottom microtype band
  ctx.fillStyle = "rgba(217,178,96,0.78)";
  for (let i = 0; i < 5; i++) {
    letterSpaced(ctx, "UNLEASH THE BEAST · 550MG · 355ML", 200 + i * 410, H - 56, 5);
  }

  // side rules
  ctx.strokeStyle = "rgba(217,178,96,0.35)";
  ctx.lineWidth = 1.5;
  [300, 1748].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 140);
    ctx.lineTo(x, H - 140);
    ctx.stroke();
  });

  // emblem
  drawEyeGlyph(ctx, W / 2, 322, 118);

  // brand type
  const gold = ctx.createLinearGradient(0, 470, 0, 760);
  gold.addColorStop(0, "#f7e9c1");
  gold.addColorStop(0.45, "#d9b260");
  gold.addColorStop(1, "#a77a31");
  ctx.fillStyle = gold;
  ctx.font = "400 196px 'Bebas Neue', 'Arial Narrow', Arial, sans-serif";
  letterSpaced(ctx, "DRAGON", W / 2, 560, 9);
  letterSpaced(ctx, "ELIXIR", W / 2, 704, 9);

  ctx.fillStyle = "#8dffc0";
  ctx.font = "600 42px 'Space Grotesk', Arial, sans-serif";
  letterSpaced(ctx, "JADE VENOM", W / 2, 792, 18);

  ctx.fillStyle = "rgba(233,228,212,0.82)";
  ctx.font = "500 26px 'Space Grotesk', Arial, sans-serif";
  letterSpaced(ctx, "ENHANCED ENERGY DRINK · 355 ML", W / 2, 850, 6);

  ctx.fillStyle = "rgba(217,178,96,0.9)";
  ctx.font = "600 25px 'Space Grotesk', Arial, sans-serif";
  letterSpaced(ctx, "550 MG CAFFEINE · SERVE AT 02°C", W / 2, 892, 5);

  // batch marks
  ctx.save();
  ctx.translate(214, 512);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(141,255,192,0.4)";
  ctx.font = "500 19px 'Space Grotesk', Arial, sans-serif";
  letterSpaced(ctx, "BATCH 001 · FORBIDDEN", 0, 0, 5);
  ctx.restore();
  ctx.save();
  ctx.translate(1834, 512);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = "rgba(141,255,192,0.4)";
  ctx.font = "500 19px 'Space Grotesk', Arial, sans-serif";
  letterSpaced(ctx, "UNLEASH THE BEAST", 0, 0, 5);
  ctx.restore();

  // subtle print speckle
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = i % 3 ? "rgba(141,255,192,0.2)" : "rgba(217,178,96,0.18)";
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4);
  }
  ctx.globalAlpha = 1;

  return createTextureFromCanvas(canvas);
}

/* ============================================================
   Hero scene
   ============================================================ */

export function initHeroScene(canvas, { reducedMotion = false } = {}) {
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020604, 0.055);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 80);
  camera.position.set(0, 0, 7);

  // giant eye
  const eyeTex = createEyeTexture(1024);
  const eyeMat = new THREE.MeshBasicMaterial({
    map: eyeTex,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), eyeMat);
  eye.position.set(-0.85, 0.15, -4.6);
  scene.add(eye);

  const glowTex = createGlowTexture();
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x27c786,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  halo.scale.set(13, 13, 1);
  halo.position.set(-0.85, 0.15, -5.2);
  scene.add(halo);

  // embers
  const COUNT = window.innerWidth < 700 ? 130 : 250;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  const speeds = new Float32Array(COUNT);
  const gold = new THREE.Color(0xffc46b);
  const jade = new THREE.Color(0x8dffc0);

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 17;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 0.5;
    const c = Math.random() > 0.62 ? jade : gold;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    seeds[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.06 + Math.random() * 0.18;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.065,
    map: glowTex,
    transparent: true,
    opacity: 0.9,
    alphaTest: 0.01,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    sizeAttenuation: true,
  });
  const embers = new THREE.Points(pGeo, pMat);
  scene.add(embers);

  // larger, slower dust
  const DUST = 55;
  const dPositions = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dPositions[i * 3] = (Math.random() - 0.5) * 18;
    dPositions[i * 3 + 1] = (Math.random() - 0.5) * 11;
    dPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPositions, 3));
  const dMat = new THREE.PointsMaterial({
    size: 0.2,
    map: glowTex,
    color: 0x6ce0a5,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dGeo, dMat);
  scene.add(dust);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const onPointer = (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let scroll = 0;
  const setScroll = (p) => {
    scroll = p;
  };

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(canvas);

  const clock = new THREE.Clock();
  let t = 0;
  let raf = 0;
  let suspended = false;

  const onVisibility = () => {
    suspended = document.hidden;
    if (!suspended) clock.getDelta();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || suspended) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    if (!reducedMotion) t += dt;
    pointer.x += (target.x - pointer.x) * 0.045;
    pointer.y += (target.y - pointer.y) * 0.045;

    camera.position.x = pointer.x * 0.38;
    camera.position.y = -pointer.y * 0.24 + scroll * 0.24;
    camera.position.z = 7 - scroll * 1.4;
    camera.lookAt(0, 0, -1);

    eye.position.x = -0.85 + pointer.x * 0.22;
    eye.position.y = 0.15 - pointer.y * 0.14 + Math.sin(t * 0.36) * 0.06;
    eye.rotation.z = Math.sin(t * 0.12) * 0.025;
    eye.material.opacity = 0.58 * (1 - scroll * 0.55);
    halo.position.x = eye.position.x;
    halo.position.y = eye.position.y;
    halo.material.opacity = 0.3 * (1 - scroll * 0.4);

    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += speeds[i] * dt;
      arr[i3] += Math.sin(t * 0.4 + seeds[i]) * 0.0016;
      if (arr[i3 + 1] > 5.8) {
        arr[i3 + 1] = -5.8;
        arr[i3] = (Math.random() - 0.5) * 17;
      }
    }
    pGeo.attributes.position.needsUpdate = true;
    dust.rotation.y = t * 0.008;
    dust.position.y = Math.sin(t * 0.18) * 0.25;

    renderer.render(scene, camera);
  };
  loop();

  return {
    setScroll,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      eyeTex.dispose();
      glowTex.dispose();
      pGeo.dispose();
      pMat.dispose();
      dGeo.dispose();
      dMat.dispose();
      eyeMat.dispose();
      halo.material.dispose();
      renderer.dispose();
    },
  };
}

/* ============================================================
   Can scene
   ============================================================ */

export function initCanScene(canvas, { onAngle, reducedMotion = false } = {}) {
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020604, 0.045);

  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 50);
  camera.position.set(0, 0.12, 5.7);
  camera.lookAt(0, 0.02, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.62;

  scene.add(new THREE.AmbientLight(0x9effcb, 0.35));
  const key = new THREE.DirectionalLight(0xffe4b8, 3.4);
  key.position.set(3.5, 4.5, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8dffc0, 2.6);
  fill.position.set(-4, 1, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd9b260, 3);
  rim.position.set(0.5, -1.5, -4);
  scene.add(rim);

  // can
  const can = new THREE.Group();
  scene.add(can);

  const labelTex = createCanLabel();
  const labelMat = new THREE.MeshPhysicalMaterial({
    map: labelTex,
    metalness: 0.38,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.15,
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.8, 128, 1, true), labelMat);
  can.add(body);

  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xd3d5ce,
    metalness: 1,
    roughness: 0.24,
    clearcoat: 0.4,
    envMapIntensity: 1.5,
  });
  const darkMetal = new THREE.MeshPhysicalMaterial({
    color: 0x20241f,
    metalness: 0.8,
    roughness: 0.4,
  });

  const topShoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.62, 0.13, 96, 1, true), metal);
  topShoulder.position.y = 0.965;
  can.add(topShoulder);

  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.045, 96), metal);
  topCap.position.y = 1.052;
  can.add(topCap);

  const topInset = new THREE.Mesh(new THREE.CircleGeometry(0.44, 64), darkMetal);
  topInset.rotation.x = -Math.PI / 2;
  topInset.position.y = 1.076;
  can.add(topInset);

  const rimTop = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.022, 10, 96), metal);
  rimTop.rotation.x = Math.PI / 2;
  rimTop.position.y = 1.075;
  can.add(rimTop);

  // pull tab
  const tab = new THREE.Group();
  const tabRing = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 40), metal);
  tabRing.rotation.x = Math.PI / 2;
  tab.add(tabRing);
  const tabBar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.008, 0.13), metal);
  tabBar.position.z = 0.13;
  tab.add(tabBar);
  tab.position.set(0, 1.09, 0.1);
  can.add(tab);

  const bottomShoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.54, 0.13, 96, 1, true), metal);
  bottomShoulder.position.y = -0.965;
  can.add(bottomShoulder);
  const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.05, 96), metal);
  bottomCap.position.y = -1.06;
  can.add(bottomCap);
  const rimBottom = new THREE.Mesh(new THREE.TorusGeometry(0.545, 0.018, 8, 96), metal);
  rimBottom.rotation.x = Math.PI / 2;
  rimBottom.position.y = -1.075;
  can.add(rimBottom);

  // shadow
  const shadowTex = createShadowTexture();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.62,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.1;
  scene.add(shadow);

  // ritual rings + ticks
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8dffc0,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const goldRingMat = new THREE.MeshBasicMaterial({
    color: 0xd9b260,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.0045, 8, 220), ringMat);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = -1.02;
  scene.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.0035, 8, 220), goldRingMat);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = -1.02;
  scene.add(ring2);

  const tickGeo = new THREE.BoxGeometry(0.006, 0.001, 0.06);
  const tickMat = new THREE.MeshBasicMaterial({
    color: 0x8dffc0,
    transparent: true,
    opacity: 0.4,
  });
  const ticks = new THREE.InstancedMesh(tickGeo, tickMat, 60);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 1.38, -1.017, Math.sin(a) * 1.38);
    dummy.rotation.y = -a;
    dummy.updateMatrix();
    ticks.setMatrixAt(i, dummy.matrix);
  }
  scene.add(ticks);

  // drifting motes
  const MOTES = window.innerWidth < 700 ? 45 : 90;
  const mPos = new Float32Array(MOTES * 3);
  const mSeed = new Float32Array(MOTES);
  for (let i = 0; i < MOTES; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.8 + Math.random() * 1.8;
    mPos[i * 3] = Math.cos(a) * r;
    mPos[i * 3 + 1] = -1 + Math.random() * 2.4;
    mPos[i * 3 + 2] = Math.sin(a) * r;
    mSeed[i] = Math.random() * Math.PI * 2;
  }
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute("position", new THREE.BufferAttribute(mPos, 3));
  const moteTex = createGlowTexture(64);
  const mMat = new THREE.PointsMaterial({
    size: 0.035,
    map: moteTex,
    color: 0xd9b260,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const motes = new THREE.Points(mGeo, mMat);
  scene.add(motes);

  // interaction
  const drag = { active: false, lastX: 0, velocity: 0, rotation: 0.18 };
  let scrollProgress = 0;
  let userInteracted = false;

  const onDown = (e) => {
    drag.active = true;
    drag.lastX = e.clientX;
    drag.velocity = 0;
    userInteracted = true;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.lastX;
    drag.lastX = e.clientX;
    drag.rotation += dx * 0.008;
    drag.velocity = dx * 0.008;
  };
  const onUp = (e) => {
    drag.active = false;
    if (canvas.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerleave", onUp);

  let pointerX = 0;
  let pointerY = 0;
  const stage = canvas.parentElement;
  const onStageMove = (e) => {
    const r = stage.getBoundingClientRect();
    pointerX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointerY = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  stage.addEventListener("pointermove", onStageMove, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(canvas);

  const clock = new THREE.Clock();
  let t = 0;
  let raf = 0;
  let suspended = false;
  let angleFrame = 0;

  const onVisibility = () => {
    suspended = document.hidden;
    if (!suspended) clock.getDelta();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || suspended) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    if (!reducedMotion) t += dt;

    if (!drag.active) {
      drag.rotation += drag.velocity;
      drag.velocity *= 0.92;
      if (!userInteracted) drag.rotation += dt * 0.09;
    }

    can.rotation.y = Math.PI + drag.rotation + scrollProgress * Math.PI * 1.3;
    can.rotation.z = Math.sin(t * 0.35) * 0.012;
    can.position.y = Math.sin(t * 0.55) * 0.022;
    can.rotation.x = pointerY * 0.035;

    camera.position.x = pointerX * 0.18;
    camera.position.y = 0.12 - pointerY * 0.1;
    camera.lookAt(0, 0.02, 0);

    ring1.rotation.z = t * 0.08;
    ring2.rotation.z = -t * 0.05;
    ticks.rotation.y = t * 0.06;

    const arr = mGeo.attributes.position.array;
    for (let i = 0; i < MOTES; i++) {
      arr[i * 3 + 1] += 0.0009;
      if (arr[i * 3 + 1] > 1.6) arr[i * 3 + 1] = -1.1;
      arr[i * 3] += Math.sin(t * 0.5 + mSeed[i]) * 0.0005;
    }
    mGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    angleFrame++;
    if (onAngle && angleFrame % 4 === 0) {
      const deg = ((THREE.MathUtils.radToDeg(can.rotation.y) % 360) + 360) % 360;
      onAngle(Math.round(deg));
    }
  };
  loop();

  return {
    setScroll(p) {
      scrollProgress = p;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onUp);
      stage.removeEventListener("pointermove", onStageMove);
      document.removeEventListener("visibilitychange", onVisibility);
      labelTex.dispose();
      labelMat.dispose();
      metal.dispose();
      darkMetal.dispose();
      ringMat.dispose();
      goldRingMat.dispose();
      tickMat.dispose();
      mGeo.dispose();
      mMat.dispose();
      moteTex.dispose();
      shadowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
