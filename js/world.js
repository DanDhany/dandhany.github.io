import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const START_Z = 12;
export const STOP_FIRST = -80;
export const STOP_GAP = 108;

export function stopZ(index) {
  return STOP_FIRST - index * STOP_GAP;
}

/* Three times of day, tuned to the GTA VI sunset palette. */
const MOODS = [
  {
    label: "Matahari terbenam",
    top: 0x3a1352,
    mid: 0xb0356e,
    low: 0xff9a4a,
    sun: 0xffb066,
    fog: 0x57204a,
    ambient: 0.6,
    dir: 1.2,
    stars: 0,
    neon: 1,
  },
  {
    label: "Biru malam",
    top: 0x080f2e,
    mid: 0x1b2a63,
    low: 0xd8604a,
    sun: 0xff8a5a,
    fog: 0x201a3a,
    ambient: 0.42,
    dir: 0.72,
    stars: 0.55,
    neon: 1.3,
  },
  {
    label: "Neon penuh",
    top: 0x04030c,
    mid: 0x180a30,
    low: 0x5a1244,
    sun: 0xff4d7a,
    fog: 0x150a22,
    ambient: 0.32,
    dir: 0.4,
    stars: 1,
    neon: 1.75,
  },
];

const SUN_DIR = new THREE.Vector3(-0.24, 0.11, -1).normalize();

export function createWorld(canvas, stops) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(MOODS[0].fog, 0.0032);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 2200);
  camera.rotation.order = "YXZ";
  scene.add(camera);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  function paint(width, height, draw) {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");
    draw(ctx, width, height);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = maxAniso;
    return map;
  }

  /* ---------------------------------------------------------------- sky */

  const skyUniforms = {
    uTop: { value: new THREE.Color(MOODS[0].top) },
    uMid: { value: new THREE.Color(MOODS[0].mid) },
    uLow: { value: new THREE.Color(MOODS[0].low) },
    uSunColor: { value: new THREE.Color(MOODS[0].sun) },
    uSunDir: { value: SUN_DIR.clone() },
  };

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1600, 32, 20),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uLow;
        uniform vec3 uSunColor;
        uniform vec3 uSunDir;
        varying vec3 vDir;

        void main() {
          vec3 dir = normalize(vDir);
          vec3 sunDir = normalize(uSunDir);
          float h = dir.y;
          vec3 col = mix(uLow, uMid, smoothstep(-0.015, 0.24, h));
          col = mix(col, uTop, smoothstep(0.2, 0.8, h));

          float d = distance(dir, sunDir);
          float glow = pow(clamp(1.0 - d / 0.95, 0.0, 1.0), 2.1);
          col += uSunColor * glow * 0.85;

          float disc = smoothstep(0.9984, 0.9993, dot(dir, sunDir));
          col = mix(col, vec3(1.0, 0.94, 0.8), disc * 0.92);

          col += uSunColor * 0.05 * smoothstep(0.3, 0.0, abs(h));

          /* Raw shader output skips the renderer color pipeline, so encode here
             or the authored sRGB sunset renders several stops too dark. */
          col = clamp(col, 0.0, 1.0);

          /* 8-bit sky gradients band badly across a full screen, so dither. */
          float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
          col += (dither - 0.5) / 255.0;

          gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
        }
      `,
    })
  );
  sky.renderOrder = -10;
  scene.add(sky);

  const starCount = 700;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(0.18 + Math.random() * 0.82);
    const r = 1400;
    starPos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    starPos[i * 3 + 1] = Math.cos(phi) * r;
    starPos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xfff2dc,
    size: 2,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.renderOrder = -9;
  scene.add(stars);

  /* --------------------------------------------------------------- ground */

  /* The strip grows with the number of restos listed in the page. */
  const lastStopZ = stopZ(stops.length - 1);
  const roadNear = 60;
  const roadFar = lastStopZ - 190;
  const roadLength = roadNear - roadFar;
  const roadMid = (roadNear + roadFar) / 2;

  const groundMat = new THREE.MeshStandardMaterial({ color: 0x120d1d, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, roadLength + 500), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.08, roadMid);
  scene.add(ground);

  const beachMat = new THREE.MeshStandardMaterial({ color: 0x3a2c44, roughness: 0.95 });
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(19.4, roadLength + 200), beachMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(-16.3, 0, roadMid);
  scene.add(beach);

  const roadMap = paint(256, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#2a2036";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3200; i += 1) {
      const a = Math.random() * 0.06;
      ctx.fillStyle = `rgba(210,200,230,${a})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.fillStyle = "rgba(246,231,206,0.45)";
    ctx.fillRect(9, 0, 5, h);
    ctx.fillRect(w - 14, 0, 5, h);
    ctx.fillStyle = "rgba(255,198,112,0.95)";
    ctx.fillRect(w / 2 - 5, 30, 10, 380);
  });
  roadMap.wrapS = THREE.RepeatWrapping;
  roadMap.wrapT = THREE.RepeatWrapping;
  roadMap.repeat.set(1, Math.round(roadLength / 38.5));

  const roadMat = new THREE.MeshStandardMaterial({
    map: roadMap,
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.24,
  });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(13, roadLength), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, roadMid);
  scene.add(road);

  /* ---------------------------------------------------------------- ocean */

  const oceanGeo = new THREE.PlaneGeometry(520, roadLength + 400, 44, 32);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x153c54,
    roughness: 0.2,
    metalness: 0.45,
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(-286, -0.16, roadMid);
  scene.add(ocean);

  const oceanBase = oceanGeo.attributes.position.array.slice();

  const glitterMap = paint(128, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, "rgba(255,150,90,0)");
    grad.addColorStop(0.45, "rgba(255,150,90,0.22)");
    grad.addColorStop(0.78, "rgba(255,196,130,0.5)");
    grad.addColorStop(1, "rgba(255,224,180,0.15)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 90; i += 1) {
      ctx.fillStyle = `rgba(255,220,180,${Math.random() * 0.25})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 26 + 4, 1);
    }
  });
  const glitterMat = new THREE.MeshBasicMaterial({
    map: glitterMap,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });
  const glitter = new THREE.Mesh(new THREE.PlaneGeometry(80, roadLength * 0.55), glitterMat);
  glitter.rotation.x = -Math.PI / 2;
  glitter.position.set(-148, 0.04, roadMid - 20);
  scene.add(glitter);

  /* ------------------------------------------------------------- lighting */

  const hemi = new THREE.HemisphereLight(0x9a5b96, 0x1c1024, MOODS[0].ambient + 0.14);
  scene.add(hemi);

  const sunLight = new THREE.DirectionalLight(0xffa365, MOODS[0].dir);
  sunLight.position.set(-90, 62, -140);
  scene.add(sunLight);

  const fill = new THREE.DirectionalLight(0x9fb0ff, 0.8);
  fill.position.set(120, 55, 30);
  scene.add(fill);

  /* ---------------------------------------------------------------- palms */

  function palmTrunkGeo() {
    const parts = [];
    let x = 0;
    let y = 0;
    let lean = 0.02;
    for (let i = 0; i < 4; i += 1) {
      const h = 1.2;
      const r1 = 0.24 - i * 0.038;
      const r2 = 0.24 - (i + 1) * 0.038;
      const seg = new THREE.CylinderGeometry(r2, r1, h, 6, 1);
      seg.translate(0, h / 2, 0);
      seg.rotateZ(lean);
      seg.translate(x, y, 0);
      parts.push(seg);
      x += Math.sin(lean) * h;
      y += Math.cos(lean) * h;
      lean += 0.055;
    }
    return mergeGeometries(parts, false);
  }

  function palmFrondGeo() {
    const parts = [];
    const top = { x: 0.42, y: 4.66 };
    const rings = [
      { count: 11, len: 3.0, w: 0.42, droop: 0.55, lift: 0.16 },
      { count: 8, len: 2.2, w: 0.34, droop: 0.3, lift: -0.06 },
    ];
    rings.forEach((ring, ri) => {
      for (let i = 0; i < ring.count; i += 1) {
        const blade = new THREE.PlaneGeometry(ring.len, ring.w, 3, 1);
        blade.rotateX(-Math.PI / 2);
        blade.translate(ring.len / 2, 0, 0);
        const pos = blade.attributes.position;
        for (let v = 0; v < pos.count; v += 1) {
          const px = pos.getX(v);
          pos.setY(v, -ring.droop * (px / ring.len) ** 2 * ring.len);
        }
        blade.rotateZ(ring.lift);
        blade.rotateY((i / ring.count) * Math.PI * 2 + ri * 0.3 + Math.random() * 0.2);
        blade.translate(top.x, top.y, 0);
        parts.push(blade);
      }
    });
    return mergeGeometries(parts, false);
  }

  const palmPositions = [];
  for (let z = roadNear; z > roadFar; z -= 24) {
    const jitter = (Math.random() - 0.5) * 12;
    palmPositions.push([-8.6 - Math.random() * 4.5, z + jitter, 0.9 + Math.random() * 0.5]);
    if (Math.random() > 0.35) {
      palmPositions.push([9.6 + Math.random() * 9, z + jitter + 8, 0.85 + Math.random() * 0.55]);
    }
  }

  const trunkMesh = new THREE.InstancedMesh(
    palmTrunkGeo(),
    new THREE.MeshStandardMaterial({ color: 0x3b2b34, roughness: 1 }),
    palmPositions.length
  );
  const frondMesh = new THREE.InstancedMesh(
    palmFrondGeo(),
    new THREE.MeshStandardMaterial({
      color: 0x1d4a3b,
      roughness: 0.95,
      side: THREE.DoubleSide,
    }),
    palmPositions.length
  );

  const dummy = new THREE.Object3D();
  palmPositions.forEach(([x, z, s], i) => {
    dummy.position.set(x, 0, z);
    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(i, dummy.matrix);
    frondMesh.setMatrixAt(i, dummy.matrix);
  });
  trunkMesh.instanceMatrix.needsUpdate = true;
  frondMesh.instanceMatrix.needsUpdate = true;
  scene.add(trunkMesh, frondMesh);

  /* ------------------------------------------------------------ buildings */

  const glowSprites = [];
  const pickables = [];

  const stripeMap = paint(160, 80, (ctx, w, h) => {
    ctx.fillStyle = "#f6e7ce";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ff2f7e";
    for (let x = -h; x < w + h; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 20, 0);
      ctx.lineTo(x + 20 + h, h);
      ctx.lineTo(x + h, h);
      ctx.closePath();
      ctx.fill();
    }
  });
  stripeMap.wrapS = THREE.RepeatWrapping;
  stripeMap.wrapT = THREE.RepeatWrapping;
  stripeMap.repeat.set(3, 1);

  const stripeMat = new THREE.MeshStandardMaterial({ map: stripeMap, roughness: 0.7 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x38274a, roughness: 0.85 });
  const wallDarkMat = new THREE.MeshStandardMaterial({ color: 0x201530, roughness: 0.9 });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xffc38a, toneMapped: false });
  const doorMat = new THREE.MeshBasicMaterial({ color: 0x2a1a2e });

  function glowTexture(hex) {
    return paint(256, 256, (ctx, w, h) => {
      const grad = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
      grad.addColorStop(0, `${hex}dd`);
      grad.addColorStop(0.45, `${hex}55`);
      grad.addColorStop(1, `${hex}00`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
  }

  function signTexture(name, accent, index) {
    return paint(1024, 256, (ctx, w, h) => {
      ctx.fillStyle = "#0b0812";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, w - 20, h - 20);

      ctx.save();
      ctx.translate(w / 2, h * 0.46);
      ctx.transform(1, 0, -0.13, 1, 0, 0);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f6e7ce";
      let size = 122;
      ctx.font = `400 ${size}px Anton, "Arial Narrow", Impact, sans-serif`;
      while (ctx.measureText(name).width > w - 110 && size > 48) {
        size -= 6;
        ctx.font = `400 ${size}px Anton, "Arial Narrow", Impact, sans-serif`;
      }
      ctx.fillText(name, 0, 0);
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = accent;
      ctx.font = '600 34px "Barlow Condensed", "Arial Narrow", sans-serif';
      ctx.letterSpacing = "8px";
      ctx.fillText(`RESTO ${String(index + 1).padStart(2, "0")}`, w / 2, h - 44);
    });
  }

  const loader = new THREE.TextureLoader();

  stops.forEach((stop, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const accent = stop.accent;
    const z = stopZ(i);
    const group = new THREE.Group();
    group.position.set(side * 13.6, 0, z);
    group.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(group);

    const pad = new THREE.Mesh(new THREE.BoxGeometry(12, 0.12, 10.5), wallDarkMat);
    pad.position.set(0, 0.06, 0);
    group.add(pad);

    const base = new THREE.Mesh(new THREE.BoxGeometry(9, 4.4, 7), wallMat);
    base.position.set(0, 2.2, 0);
    group.add(base);

    const fascia = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.4, 7.5), wallDarkMat);
    fascia.position.set(0, 5.2, 0);
    group.add(fascia);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.28, 7.9), wallDarkMat);
    roof.position.set(0, 6, 0);
    group.add(roof);

    const awning = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.16, 1.6), stripeMat);
    awning.position.set(0, 3.5, 4.1);
    group.add(awning);

    [-3.1, 3.1].forEach((x) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), glassMat);
      win.position.set(x, 2.1, 3.52);
      win.material = glassMat.clone();
      win.material.opacity = 0.85;
      win.material.transparent = true;
      group.add(win);
    });

    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.7), doorMat);
    door.position.set(0, 1.35, 3.52);
    group.add(door);

    const signMap = signTexture(stop.sign, accent, i);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(7.4, 1.5),
      new THREE.MeshBasicMaterial({ map: signMap, toneMapped: false, fog: true })
    );
    sign.position.set(0, 5.2, 3.82);
    sign.userData = { project: i };
    group.add(sign);
    pickables.push(sign);

    const glowTex = glowTexture(accent);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(11, 4.5), glowMat);
    glow.position.set(0, 5.2, 3.6);
    group.add(glow);
    glowSprites.push({ mat: glowMat, base: 0.95 });

    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.07, 0.07),
      new THREE.MeshBasicMaterial({ color: accent, toneMapped: false })
    );
    neon.position.set(0, 4.5, 3.78);
    group.add(neon);

    /* Standing poster with the project image, lit like a roadside board. */
    const posterTex = loader.load(stop.image);
    posterTex.colorSpace = THREE.SRGBColorSpace;
    posterTex.anisotropy = maxAniso;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 3.7, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x0c0914, roughness: 0.7 })
    );
    frame.position.set(-5.9, 2.4, 4.9);
    group.add(frame);

    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 3.3),
      new THREE.MeshBasicMaterial({ map: posterTex, toneMapped: false })
    );
    poster.position.set(-5.9, 2.5, 5.0);
    poster.userData = { project: i };
    group.add(poster);
    pickables.push(poster);

    const posterGlowMat = new THREE.MeshBasicMaterial({
      map: glowTexture(accent),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const posterGlow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), posterGlowMat);
    posterGlow.position.set(-5.9, 2.4, 4.85);
    group.add(posterGlow);
    glowSprites.push({ mat: posterGlowMat, base: 0.45 });
  });

  /* --------------------------------------------------------- street lamps */

  const lampGlowMap = paint(128, 128, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(255,226,180,0.95)");
    grad.addColorStop(0.4, "rgba(255,190,120,0.35)");
    grad.addColorStop(1, "rgba(255,170,90,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x241a2e, roughness: 0.8 });
  for (let i = 0; i < 9; i += 1) {
    const z = -34 - i * 100;
    const side = i % 2 === 0 ? 1 : -1;
    const lamp = new THREE.Group();
    lamp.position.set(side * 8.2, 0, z);
    lamp.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 6.4, 6), poleMat);
    pole.position.y = 3.2;
    lamp.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.09, 0.09), poleMat);
    arm.position.set(-0.85, 6.3, 0);
    lamp.add(arm);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.14, 0.24),
      new THREE.MeshBasicMaterial({ color: 0xffe3b0, toneMapped: false })
    );
    head.position.set(-1.6, 6.24, 0);
    lamp.add(head);

    const lampGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({
        map: lampGlowMap,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    );
    lampGlow.position.set(-1.6, 6.1, 0.05);
    lamp.add(lampGlow);
    scene.add(lamp);
  }

  /* --------------------------------------------------------------- traffic */

  const cars = [];
  const carBodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1424, roughness: 0.35, metalness: 0.55 });
  const headlightMap = paint(64, 64, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(255,248,230,1)");
    grad.addColorStop(0.35, "rgba(255,220,160,0.5)");
    grad.addColorStop(1, "rgba(255,200,140,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });

  for (let i = 0; i < 4; i += 1) {
    const car = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.62, 3.8), carBodyMat);
    body.position.y = 0.55;
    car.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 1.9), wallDarkMat);
    cabin.position.set(0, 1.1, -0.2);
    car.add(cabin);

    [-0.58, 0.58].forEach((x) => {
      const light = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.9),
        new THREE.MeshBasicMaterial({
          map: headlightMap,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        })
      );
      light.position.set(x, 0.62, 1.98);
      car.add(light);
    });

    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.13, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xff2f4e, toneMapped: false })
    );
    tail.position.set(0, 0.72, -1.94);
    car.add(tail);

    car.position.set(-3.4, 0, -70 - i * 150);
    scene.add(car);
    cars.push({ mesh: car, speed: 11 + Math.random() * 7 });
  }

  /* --------------------------------------------------- entrance and end */

  function bigSign(text, accent, sub) {
    return paint(1024, 320, (ctx, w, h) => {
      ctx.fillStyle = "#0b0812";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 8;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.save();
      ctx.translate(w / 2, h * 0.45);
      ctx.transform(1, 0, -0.12, 1, 0, 0);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f6e7ce";
      let size = 132;
      ctx.font = `400 ${size}px Anton, "Arial Narrow", Impact, sans-serif`;
      while (ctx.measureText(text).width > w - 100 && size > 44) {
        size -= 6;
        ctx.font = `400 ${size}px Anton, "Arial Narrow", Impact, sans-serif`;
      }
      ctx.fillText(text, 0, 0);
      ctx.restore();
      ctx.textAlign = "center";
      ctx.fillStyle = accent;
      ctx.font = '600 40px "Barlow Condensed", "Arial Narrow", sans-serif';
      ctx.fillText(sub, w / 2, h - 44);
    });
  }

  const gate = new THREE.Group();
  gate.position.set(0, 0, -26);
  const gatePole = new THREE.MeshStandardMaterial({ color: 0x1d1528, roughness: 0.8 });
  [-7.4, 7.4].forEach((x) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.34, 8.4, 0.34), gatePole);
    p.position.set(x, 4.2, 0);
    gate.add(p);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.4, 0.4), gatePole);
  beam.position.set(0, 8.2, 0);
  gate.add(beam);
  const gateSign = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 3.4),
    new THREE.MeshBasicMaterial({ map: bigSign("JALAN PESISIR", "#FF2F7E", "DANDHANY · WEB DEVELOPER"), toneMapped: false })
  );
  gateSign.position.set(0, 8.2, 0.24);
  gate.add(gateSign);
  scene.add(gate);

  const endSign = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 3.4),
    new THREE.MeshBasicMaterial({
      map: bigSign("HUBUNGI SAYA", "#12C2B0", "ADA PROYEK? KLIK PAPAN INI"),
      toneMapped: false,
    })
  );
  endSign.position.set(9.5, 4.6, lastStopZ - 84);
  endSign.rotation.y = -0.55;
  endSign.userData = { contact: true };
  scene.add(endSign);
  pickables.push(endSign);

  const endPole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 0.3), gatePole);
  endPole.position.set(9.5, 2.2, lastStopZ - 84.2);
  scene.add(endPole);

  const endGlowMat = new THREE.MeshBasicMaterial({
    map: glowTexture("#12C2B0"),
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const endGlow = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), endGlowMat);
  endGlow.position.set(9.5, 4.6, lastStopZ - 84.4);
  endGlow.rotation.y = -0.55;
  scene.add(endGlow);
  glowSprites.push({ mat: endGlowMat, base: 0.45 });

  /* ------------------------------------------------------------ player car */

  const car = new THREE.Group();
  const carPaint = new THREE.MeshStandardMaterial({ color: 0xe6d2ae, roughness: 0.3, metalness: 0.55 });
  const carDark = new THREE.MeshStandardMaterial({ color: 0x1d1226, roughness: 0.45, metalness: 0.55 });
  const carGlass = new THREE.MeshStandardMaterial({ color: 0x0d0914, roughness: 0.12, metalness: 0.9 });
  const carRose = new THREE.MeshBasicMaterial({ color: 0xff2f7e, toneMapped: false });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2, 0.52, 4.4), carPaint);
  chassis.position.y = 0.62;
  car.add(chassis);

  const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.22, 3.9), carDark);
  skirt.position.y = 0.36;
  car.add(skirt);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.54, 2.1), carGlass);
  cabin.position.set(0, 1.06, 0.12);
  car.add(cabin);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.14, 1.95), carPaint);
  roof.position.set(0, 1.37, 0.12);
  car.add(roof);

  const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.44), carGlass);
  rearWindow.position.set(0, 1.12, 1.18);
  rearWindow.rotation.x = -0.22;
  car.add(rearWindow);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 4.36), carRose);
  stripe.position.set(0, 0.885, 0);
  car.add(stripe);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.18, 0.24), carDark);
  bumper.position.set(0, 0.46, 2.18);
  car.add(bumper);

  const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.16, 0.22), carDark);
  bumperFront.position.set(0, 0.46, -2.18);
  car.add(bumperFront);

  [-1, 1].forEach((side) => {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.24), carPaint);
    mirror.position.set(side * 0.98, 1.02, -0.78);
    car.add(mirror);
  });

  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.3, 10);
  rimGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0c0910, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcdb79a, roughness: 0.4, metalness: 0.7 });

  [
    [-1, -1.38],
    [1, -1.38],
    [-1, 1.42],
    [1, 1.42],
  ].forEach(([x, z]) => {
    const wheel = new THREE.Group();
    wheel.add(new THREE.Mesh(wheelGeo, wheelMat));
    wheel.add(new THREE.Mesh(rimGeo, rimMat));
    wheel.position.set(x, 0.36, z);
    car.add(wheel);
    wheels.push(wheel);
  });

  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff0cf, toneMapped: false });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3355, toneMapped: false });
  [-0.66, 0.66].forEach((x) => {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.06), lampMat);
    lamp.position.set(x, 0.74, -2.21);
    car.add(lamp);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.06), tailMat);
    tail.position.set(x, 0.76, 2.21);
    car.add(tail);
  });

  const tailGlowMat = new THREE.MeshBasicMaterial({
    map: glowTexture("#FF3355"),
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const tailGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), tailGlowMat);
  tailGlow.position.set(0, 0.78, 2.32);
  car.add(tailGlow);

  const underGlowMat = new THREE.MeshBasicMaterial({
    map: glowTexture("#FF2F7E"),
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const underGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 6.2), underGlowMat);
  underGlow.rotation.x = -Math.PI / 2;
  underGlow.position.set(0, 0.06, 0);
  car.add(underGlow);

  /* Soft contact shadow, otherwise the car reads as floating over the road. */
  const shadowTex = paint(128, 128, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(0,0,0,0.8)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.45)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
  const carShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 5.8),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      toneMapped: false,
    })
  );
  carShadow.rotation.x = -Math.PI / 2;
  carShadow.position.set(0, 0.045, 0.1);
  car.add(carShadow);

  const beamMat = new THREE.MeshBasicMaterial({
    map: paint(64, 256, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, "rgba(255,228,180,0.55)");
      grad.addColorStop(1, "rgba(255,228,180,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }),
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  [-0.62, 0.62].forEach((x) => {
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 12), beamMat);
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(x, 0.035, -8);
    car.add(beam);
  });

  car.position.set(0, 0.02, START_Z);
  scene.add(car);

  const UP = new THREE.Vector3(0, 1, 0);
  const camOffset = new THREE.Vector3();
  const lookPoint = new THREE.Vector3();

  /* --------------------------------------------------------------- moods */

  const current = {
    top: new THREE.Color(MOODS[0].top),
    mid: new THREE.Color(MOODS[0].mid),
    low: new THREE.Color(MOODS[0].low),
    sun: new THREE.Color(MOODS[0].sun),
    fog: new THREE.Color(MOODS[0].fog),
    ambient: MOODS[0].ambient,
    dir: MOODS[0].dir,
    stars: MOODS[0].stars,
    neon: MOODS[0].neon,
  };
  const target = {
    top: new THREE.Color(MOODS[0].top),
    mid: new THREE.Color(MOODS[0].mid),
    low: new THREE.Color(MOODS[0].low),
    sun: new THREE.Color(MOODS[0].sun),
    fog: new THREE.Color(MOODS[0].fog),
    ambient: MOODS[0].ambient,
    dir: MOODS[0].dir,
    stars: MOODS[0].stars,
    neon: MOODS[0].neon,
  };

  function setMood(index) {
    const m = MOODS[index] || MOODS[0];
    target.top.set(m.top);
    target.mid.set(m.mid);
    target.low.set(m.low);
    target.sun.set(m.sun);
    target.fog.set(m.fog);
    target.ambient = m.ambient;
    target.dir = m.dir;
    target.stars = m.stars;
    target.neon = m.neon;
  }

  function applyMood(dt) {
    const k = 1 - Math.exp(-dt * 2.2);
    current.top.lerp(target.top, k);
    current.mid.lerp(target.mid, k);
    current.low.lerp(target.low, k);
    current.sun.lerp(target.sun, k);
    current.fog.lerp(target.fog, k);
    current.ambient += (target.ambient - current.ambient) * k;
    current.dir += (target.dir - current.dir) * k;
    current.stars += (target.stars - current.stars) * k;
    current.neon += (target.neon - current.neon) * k;

    skyUniforms.uTop.value.copy(current.top);
    skyUniforms.uMid.value.copy(current.mid);
    skyUniforms.uLow.value.copy(current.low);
    skyUniforms.uSunColor.value.copy(current.sun);
    scene.fog.color.copy(current.fog);
    hemi.intensity = current.ambient;
    sunLight.intensity = current.dir;
    starMat.opacity = current.stars;
    glowSprites.forEach((g) => {
      g.mat.opacity = Math.min(1, g.base * current.neon);
    });
  }

  /* --------------------------------------------------------------- update */

  let elapsed = 0;

  function update(dt, state) {
    elapsed += dt;
    const { distance, lateral, speed, steer, reduced, lookYaw = 0 } = state;

    applyMood(dt);

    const carZ = START_Z - distance;
    const bob = reduced ? 0 : Math.sin(elapsed * 6.4) * 0.013 * Math.min(1, speed / 18);
    car.position.set(lateral, 0.02 + bob, carZ);
    car.rotation.z = -steer * 0.05;
    car.rotation.y = -steer * 0.028;
    wheels.forEach((wheel) => {
      wheel.rotation.x -= speed * dt * 2.6;
    });
    tailGlowMat.opacity = 0.52 + Math.sin(elapsed * 2.2) * 0.06;
    underGlowMat.opacity = 0.36 + Math.sin(elapsed * 3.1) * 0.05;

    /* Chase camera: behind and above the car, swinging around it when the car
       pulls up to a resto. */
    const camDist = 7.2 + Math.min(2.2, speed * 0.06);
    camOffset.set(0, 2.55, camDist).applyAxisAngle(UP, lookYaw);
    camera.position.set(car.position.x + camOffset.x, camOffset.y, carZ + camOffset.z);
    lookPoint.set(0, 0.85, -8).applyAxisAngle(UP, lookYaw);
    camera.lookAt(car.position.x + lookPoint.x, 1.05, carZ + lookPoint.z);

    const fov = 60 + Math.min(9, speed * 0.26);
    if (Math.abs(camera.fov - fov) > 0.1) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    sky.position.set(camera.position.x, 0, camera.position.z);
    stars.position.set(camera.position.x, 0, camera.position.z);

    /* Water: slow swell, cheap vertex sine. */
    const pos = oceanGeo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = oceanBase[i * 3];
      const y = oceanBase[i * 3 + 1];
      pos.array[i * 3 + 2] =
        Math.sin(x * 0.09 + elapsed * 0.9) * 0.32 + Math.cos(y * 0.07 - elapsed * 0.65) * 0.22;
    }
    pos.needsUpdate = true;

    roadMap.offset.y -= dt * speed * 0.0022;
    glitterMat.opacity = 0.17 + Math.sin(elapsed * 0.7) * 0.05;

    cars.forEach((car) => {
      car.mesh.position.z += car.speed * dt;
      if (car.mesh.position.z > camera.position.z + 46) {
        car.mesh.position.z -= 900;
      }
    });
  }

  /* ----------------------------------------------------------------- pick */

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    return hits.length ? hits[0].object.userData : null;
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();

  return {
    renderer,
    scene,
    camera,
    update,
    pick,
    resize,
    setMood,
    moods: MOODS,
    startZ: START_Z,
    stopZ,
  };
}
