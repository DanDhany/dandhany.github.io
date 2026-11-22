import { createWorld, START_Z, stopZ } from "./world.js";

const hero = document.querySelector(".hero");
const canvas = document.getElementById("scene");
const startBtn = document.getElementById("start");
const help = document.getElementById("help");
const promptEl = document.getElementById("prompt");
const promptSign = document.getElementById("prompt-sign");
const enterBtn = document.getElementById("enter");
const objIndex = document.getElementById("obj-index");
const objSign = document.getElementById("obj-sign");
const objLine = document.getElementById("obj-line");
const speedEl = document.getElementById("speed");
const odoEl = document.getElementById("odo");
const radar = document.getElementById("radar");
const radioMood = document.getElementById("radio-mood");
const panel = document.getElementById("panel");
const panelClose = document.getElementById("panel-close");
const copyBtn = document.getElementById("copy-mail");

const MOOD_LABELS = ["Matahari terbenam", "Biru malam", "Neon penuh"];
const MAX_SPEED = 30;
const STOP_AHEAD = 32;

const articles = Array.from(document.querySelectorAll("[data-project]"));
const stops = articles.map((el, i) => {
  const h3 = el.querySelector("h3");
  const img = el.querySelector(".row-thumb img");
  return {
    index: i,
    el,
    sign: el.dataset.sign,
    accent: el.dataset.accent,
    image: el.dataset.image,
    name: h3.childNodes[0].textContent.trim(),
    sub: h3.querySelector("span") ? h3.querySelector("span").textContent.trim() : "",
    tagline: el.querySelector(".row-tagline").textContent.trim(),
    desc: el.querySelector(".row-desc").textContent.trim(),
    stack: Array.from(el.querySelectorAll(".tags li")).map((li) => li.textContent.trim()),
    src: img.getAttribute("src"),
    alt: img.alt,
    repo: el.dataset.repo || "",
    side: el.dataset.side || "",
    distance: START_Z - stopZ(i),
  };
});


const state = {
  started: false,
  distance: 0,
  speed: 0,
  lateral: 0,
  steer: 0,
  autopilot: null,
  parked: false,
  lookYaw: 0,
  lookTarget: 0,
  heroActive: true,
  promptIndex: null,
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  blips: [],
};

let world = null;
let lastFocus = null;
let helpTimer = 0;
let last = performance.now();
let hudClock = 0;
let raf = 0;

/* --------------------------------------------------------------- helpers */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const pad2 = (n) => String(n).padStart(2, "0");

const objTotal = document.getElementById("obj-total");
if (objTotal) objTotal.textContent = pad2(stops.length);

/* ----------------------------------------------------------------- panel */

function setPanelFields(stop) {
  document.getElementById("panel-img").src = stop.src;
  document.getElementById("panel-img").alt = stop.alt;
  document.getElementById("panel-kicker").textContent = `Resto ${pad2(stop.index + 1)} / ${pad2(stops.length)}`;
  document.getElementById("panel-title").textContent = stop.name;
  document.getElementById("panel-sub").textContent = stop.sub;
  document.getElementById("panel-tagline").textContent = stop.tagline;
  document.getElementById("panel-desc").textContent = stop.desc;
  document.getElementById("panel-side").textContent = stop.side;
  const repoLink = document.getElementById("panel-link");
  const note = document.getElementById("panel-note");
  const figureTag = document.getElementById("panel-figure-tag");
  figureTag.textContent = stop.repo ? "Repo GitHub" : "Tangkapan layar";
  if (stop.repo) {
    repoLink.href = `https://github.com/DanDhany/${stop.repo}`;
    repoLink.textContent = `github.com/DanDhany/${stop.repo}`;
    repoLink.hidden = false;
    note.textContent = "Kartu repo dari GitHub. Kode, riwayat, dan README lengkapnya ada di repo publik.";
  } else {
    repoLink.hidden = true;
    repoLink.removeAttribute("href");
    note.textContent = "Tangkapan layar asli dari portofolio Ramadhany. Sistemnya dipakai internal, jadi tidak ada demo publik.";
  }
  const tagList = document.getElementById("panel-tags");
  tagList.replaceChildren(
    ...stop.stack.map((label) => {
      const li = document.createElement("li");
      li.textContent = label;
      return li;
    })
  );
}

function openPanel(index) {
  const stop = stops[index];
  if (!stop) return;
  /* Reading a resto should not send the car rolling down the road. */
  state.parked = true;
  state.speed = 0;
  setPanelFields(stop);
  lastFocus = document.activeElement;
  panel.hidden = false;
  document.body.dataset.panel = "open";
  panel.scrollTop = 0;
  panelClose.focus({ preventScroll: true });
}

function closePanel() {
  if (panel.hidden) return;
  panel.hidden = true;
  document.body.dataset.panel = "closed";
  if (lastFocus && typeof lastFocus.focus === "function") {
    lastFocus.focus({ preventScroll: true });
  }
}

panelClose.addEventListener("click", closePanel);

/* ------------------------------------------------------------- start car */

function startEngine() {
  if (state.started) {
    return;
  }
  state.started = true;
  state.speed = 7;
  hero.dataset.started = "true";
  clearTimeout(helpTimer);
  helpTimer = window.setTimeout(() => help.classList.add("is-gone"), 11000);
}

startBtn.addEventListener("click", (event) => {
  /* Without a scene the link keeps its default jump to the project list. */
  if (!world) {
    return;
  }
  event.preventDefault();
  startEngine();
});

/* --------------------------------------------------------------- driving */

const keys = Object.create(null);
const touch = { gas: false, brake: false, left: false, right: false };

function driveTo(index, openOnArrival = true) {
  const stop = stops[index];
  if (!stop) return;
  if (!world) {
    document.getElementById("proyek").scrollIntoView({ behavior: state.reduced ? "auto" : "smooth" });
    return;
  }

  closePanel();
  /* The hero is the first element, so pin to the document top instead of
     scrollIntoView, which can stop short when the panel steals focus. */
  window.scrollTo({ top: 0, behavior: state.reduced ? "auto" : "smooth" });
  startEngine();
  state.parked = false;
  state.lookTarget = 0;

  if (stop.distance - STOP_AHEAD < state.distance - 2) {
    state.distance = Math.max(0, stop.distance - 48);
    state.lateral = 0;
  }

  state.autopilot = {
    target: Math.max(0, stop.distance - STOP_AHEAD),
    /* Stop on the far side of the lane so the entrance stays in frame. */
    lane: index % 2 === 0 ? 2.2 : -2.2,
    open: openOnArrival ? index : null,
  };
}

function simulate(dt) {
  let steerIn = 0;

  if (!state.started) {
    state.speed += (0 - state.speed) * 2 * dt;
    return;
  }

  const gas = keys.w || keys.arrowup || touch.gas;
  const brake = keys.s || keys.arrowdown || touch.brake;
  steerIn =
    (keys.d || keys.arrowright || touch.right ? 1 : 0) -
    (keys.a || keys.arrowleft || touch.left ? 1 : 0);

  if (state.parked) {
    state.speed = 0;
    if (gas || brake || steerIn !== 0) {
      state.parked = false;
      state.lookTarget = 0;
    } else {
      return;
    }
  }

  if (state.autopilot) {
    const trip = state.autopilot;
    const remain = trip.target - state.distance;

    if (remain <= 0.4) {
      state.distance = trip.target;
      state.speed = 0;
      state.lateral = trip.lane;
      state.steer = 0;
      const openIndex = trip.open;
      state.parked = true;
      state.lookTarget = (openIndex !== null && openIndex % 2 === 0 ? 1 : -1) * 0.34;
      state.autopilot = null;
      if (openIndex !== null) {
        openPanel(openIndex);
      }
      return;
    }

    const desired = remain < 6 ? 1.6 : clamp(remain * 0.55, 0, MAX_SPEED);
    state.speed += (desired - state.speed) * 2.4 * dt;
    state.distance += state.speed * dt;
    state.lateral += (trip.lane - state.lateral) * Math.min(1, dt * 1.5);
    state.steer += (0 - state.steer) * Math.min(1, dt * 5);
    return;
  }

  if (brake) {
    state.speed = Math.max(0, state.speed - 34 * dt);
  } else {
    const throttle = gas ? 1 : 0.42;
    const responsiveness = gas ? 1.35 : 0.75;
    state.speed += (MAX_SPEED * throttle - state.speed) * responsiveness * dt;
  }
  state.distance += state.speed * dt;

  if (steerIn !== 0) {
    state.lateral += steerIn * (1.8 + state.speed * 0.15) * dt;
  } else {
    state.lateral += (0 - state.lateral) * 0.45 * dt;
  }
  state.lateral = clamp(state.lateral, -4.4, 4.4);
  state.steer += (steerIn - state.steer) * Math.min(1, dt * 6);
}

/* ------------------------------------------------------------- HUD/radar */

function nextStopIndex() {
  for (let i = 0; i < stops.length; i += 1) {
    if (stops[i].distance - state.distance > -12) {
      return i;
    }
  }
  return stops.length - 1;
}

function drawRadar() {
  const ctx = radar.getContext("2d");
  const w = radar.width;
  const h = radar.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0b0814";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(18,194,176,0.13)";
  ctx.fillRect(0, 0, w * 0.28, h);
  ctx.fillStyle = "rgba(246,231,206,0.05)";
  ctx.fillRect(w * 0.3, 0, w * 0.7, h);
  ctx.fillStyle = "rgba(246,231,206,0.1)";
  ctx.fillRect(w * 0.42, 0, w * 0.16, h);

  ctx.strokeStyle = "rgba(255,176,58,0.45)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 8]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, 0);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(246,231,206,0.5)";
  ctx.font = '600 10px "Barlow Condensed", sans-serif';
  ctx.fillText("N", 8, 14);

  state.blips = [];

  stops.forEach((stop) => {
    const dy = stop.distance - state.distance;
    if (dy < -30 || dy > 300) {
      return;
    }
    const t = (dy + 30) / 330;
    const y = h - 16 - t * (h - 34);
    const x = w * 0.5 + (stop.index % 2 === 0 ? -22 : 22);
    const isNext = stop.index === state.promptIndex || (state.promptIndex === null && stop.index === nextStopIndex());

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = isNext ? stop.accent : "rgba(246,231,206,0.4)";
    const size = isNext ? 7 : 5;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();

    if (isNext) {
      ctx.strokeStyle = stop.accent;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    state.blips.push({ index: stop.index, x, y });
  });

  const px = w * 0.5 + (state.lateral / 4.4) * 14;
  const py = h - 16;
  ctx.fillStyle = "#f6e7ce";
  ctx.beginPath();
  ctx.moveTo(px, py - 8);
  ctx.lineTo(px - 5, py + 4);
  ctx.lineTo(px + 5, py + 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,47,126,0.7)";
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

function updateHud() {
  const index = nextStopIndex();
  const stop = stops[index];
  const dy = stop.distance - state.distance;

  objIndex.textContent = pad2(index + 1);
  objSign.textContent = stop.sign;

  if (dy < -12) {
    objLine.textContent = "Ujung jalan. Papan HUBUNGI SAYA ada di sisi kanan.";
  } else if (state.promptIndex !== null) {
    objLine.textContent = stop.tagline;
  } else {
    const side = index % 2 === 0 ? "kiri" : "kanan";
    objLine.textContent = `${Math.max(0, Math.round(dy))} m lagi, papan nama di sisi ${side} jalan.`;
  }

  const promptIndex = dy > 1 && dy < 46 ? index : null;
  if (promptIndex !== state.promptIndex) {
    state.promptIndex = promptIndex;
    promptEl.classList.toggle("is-on", promptIndex !== null);
    if (promptIndex !== null) {
      promptSign.textContent = stop.sign;
    }
  }

  speedEl.textContent = String(Math.round(state.speed * 3.6));
  odoEl.textContent = `${(state.distance / 1000).toFixed(2)} km`;

  drawRadar();
}

/* -------------------------------------------------------------- geometry */

function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;

  if (!world || !state.heroActive || document.hidden) {
    return;
  }

  simulate(dt);
  state.lookYaw += (state.lookTarget - state.lookYaw) * Math.min(1, dt * 2.4);
  world.update(dt, {
    distance: state.distance,
    lateral: state.lateral,
    speed: state.speed,
    steer: state.steer,
    reduced: state.reduced,
    lookYaw: state.lookYaw,
  });
  world.renderer.render(world.scene, world.camera);

  hudClock += dt;
  if (hudClock > 0.07) {
    hudClock = 0;
    updateHud();
  }
}

/* ----------------------------------------------------------------- input */

const CAPTURED = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
]);

function typingInField(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (typingInField(event.target)) {
    return;
  }

  if (key === "escape") {
    closePanel();
    return;
  }

  if ((key === "e" || key === "enter") && state.promptIndex !== null) {
    event.preventDefault();
    openPanel(state.promptIndex);
    return;
  }

  if (!CAPTURED.has(key)) {
    return;
  }
  if (!state.heroActive) {
    return;
  }
  if (!state.started) {
    return;
  }
  if (key.startsWith("arrow")) {
    event.preventDefault();
  }
  keys[key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
  Object.keys(keys).forEach((k) => {
    keys[k] = false;
  });
});

document.querySelectorAll("[data-pedal]").forEach((btn) => {
  const name = btn.dataset.pedal;
  const press = (event) => {
    event.preventDefault();
    startEngine();
    state.parked = false;
    state.lookTarget = 0;
    touch[name] = true;
  };
  const release = () => {
    touch[name] = false;
  };
  btn.addEventListener("pointerdown", press);
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("pointerleave", release);
});

/* Steering by dragging the scene, plus click on a neon sign to enter. */
let dragId = null;
let dragX = 0;
let downX = 0;
let downY = 0;

canvas.addEventListener("pointerdown", (event) => {
  if (!state.started) {
    return;
  }
  dragId = event.pointerId;
  dragX = event.clientX;
  downX = event.clientX;
  downY = event.clientY;
  if (canvas.setPointerCapture) {
    canvas.setPointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointermove", (event) => {
  if (dragId !== event.pointerId) {
    return;
  }
  const dx = event.clientX - dragX;
  dragX = event.clientX;
  state.parked = false;
  state.lookTarget = 0;
  state.lateral = clamp(state.lateral + dx * 0.012, -4.4, 4.4);
});

function endDrag(event) {
  if (dragId !== event.pointerId) {
    return;
  }
  const moved = Math.hypot(event.clientX - downX, event.clientY - downY);
  dragId = null;
  if (moved < 8 && world) {
    const hit = world.pick(event.clientX, event.clientY);
    if (hit && typeof hit.project === "number") {
      openPanel(hit.project);
    } else if (hit && hit.contact) {
      document.getElementById("kontak").scrollIntoView({ behavior: state.reduced ? "auto" : "smooth" });
    }
  }
}

canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", () => {
  dragId = null;
});

canvas.addEventListener("click", () => {
  startEngine();
});

/* Radar blips: tap a square to drive there. */
radar.addEventListener("click", (event) => {
  const rect = radar.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * radar.width;
  const y = ((event.clientY - rect.top) / rect.height) * radar.height;
  let best = null;
  let bestDist = 20;
  state.blips.forEach((blip) => {
    const d = Math.hypot(blip.x - x, blip.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = blip;
    }
  });
  if (best) {
    driveTo(best.index);
  }
});

enterBtn.addEventListener("click", () => {
  if (state.promptIndex !== null) {
    openPanel(state.promptIndex);
  }
});

document.querySelectorAll("[data-drive]").forEach((btn) => {
  btn.addEventListener("click", () => {
    driveTo(Number(btn.dataset.drive));
  });
});

document.querySelectorAll(".radio").forEach((btn) => {
  btn.addEventListener("click", () => {
    const index = Number(btn.dataset.mood);
    if (world) {
      world.setMood(index);
    }
    document.querySelectorAll(".radio").forEach((other) => {
      other.setAttribute("aria-pressed", String(other === btn));
    });
    radioMood.textContent = MOOD_LABELS[index] || MOOD_LABELS[0];
  });
});

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const mail = copyBtn.dataset.mail;
    try {
      await navigator.clipboard.writeText(mail);
      copyBtn.textContent = "Surel tersalin";
    } catch (error) {
      copyBtn.textContent = mail;
    }
    window.setTimeout(() => {
      copyBtn.textContent = "Salin alamat surel";
    }, 2400);
  });
}

/* ------------------------------------------------------------ visibility */

if ("IntersectionObserver" in window) {
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        state.heroActive = entry.isIntersecting;
      });
    },
    { threshold: 0.12 }
  ).observe(hero);
}

window.addEventListener("resize", () => {
  if (world) {
    world.resize();
  }
});

document.addEventListener("visibilitychange", () => {
  last = performance.now();
});

/* ------------------------------------------------------------------ boot */

async function boot() {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    world = createWorld(canvas, stops);
    world.resize();
    world.setMood(0);
    updateHud();
  } catch (error) {
    document.body.classList.add("no-webgl");
    startBtn.textContent = "Lihat daftar proyek";
    console.warn("Scene 3D tidak bisa dimulai:", error);
  }
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

boot();
