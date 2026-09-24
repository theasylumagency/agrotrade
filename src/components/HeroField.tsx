"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const bladeVert = /* glsl */ `
attribute vec3 iOffset;
attribute vec2 iScale;
attribute float iRot;
attribute float iHue;
uniform float uTime;
uniform float uWind;
varying float vY;
varying float vHue;
varying vec3 vWorld;
varying float vDepth;
void main() {
  vec3 p = position;
  float y = uv.y;
  p.x *= iScale.x;
  p.y *= iScale.y;
  p.z *= iScale.x;
  float c = cos(iRot), s = sin(iRot);
  p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  vec3 w = p + iOffset;
  float t = uTime;
  float gust = sin(t * 0.55 + iOffset.x * 0.045 + iOffset.z * 0.07) * 0.5 + 0.5;
  float sway = sin(t * 1.6 + iOffset.x * 0.33 + iOffset.z * 0.21) * (0.08 + 0.24 * gust) * uWind
             + sin(t * 3.3 + iOffset.z * 0.9 + iOffset.x) * 0.025;
  float bend = y * y;
  w.x += sway * bend * iScale.y;
  w.z += sway * 0.35 * bend * iScale.y;
  w.y -= abs(sway) * bend * 0.18 * iScale.y;
  vec4 mv = viewMatrix * vec4(w, 1.0);
  vDepth = -mv.z;
  vY = y;
  vHue = iHue;
  vWorld = w;
  gl_Position = projectionMatrix * mv;
}`;

const bladeFrag = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uFog;
uniform float uFogDen;
uniform vec3 uCam;
varying float vY;
varying float vHue;
varying vec3 vWorld;
varying float vDepth;
void main() {
  vec3 base = mix(vec3(0.07, 0.06, 0.03), vec3(0.32, 0.26, 0.10), vY);
  vec3 tip = mix(vec3(0.80, 0.56, 0.24), vec3(0.98, 0.79, 0.44), vHue);
  vec3 col = mix(base, tip, smoothstep(0.30, 1.0, vY));
  vec3 V = normalize(vWorld - uCam);
  float back = pow(max(dot(V, uSunDir), 0.0), 5.0);
  col += vec3(1.0, 0.52, 0.18) * back * smoothstep(0.2, 1.0, vY) * 1.1;
  col *= 0.72 + 0.34 * vHue;
  float fog = 1.0 - exp(-uFogDen * uFogDen * vDepth * vDepth);
  col = mix(col, uFog, clamp(fog, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}`;

const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const skyFrag = /* glsl */ `
uniform vec3 uSunDir;
uniform float uTime;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 top = vec3(0.035, 0.045, 0.10);
  vec3 mid = vec3(0.30, 0.17, 0.24);
  vec3 hor = vec3(0.99, 0.58, 0.28);
  vec3 col = mix(hor, mid, smoothstep(0.0, 0.16, h));
  col = mix(col, top, smoothstep(0.12, 0.62, h));
  float s = max(dot(d, uSunDir), 0.0);
  col += vec3(1.0, 0.78, 0.50) * pow(s, 900.0) * 4.0;
  col += vec3(1.0, 0.55, 0.22) * pow(s, 18.0) * 0.55;
  col += vec3(1.0, 0.45, 0.20) * pow(s, 3.0) * 0.18 * (1.0 - smoothstep(0.0, 0.3, h));
  if (h < 0.0) col = mix(hor * 0.55, vec3(0.05, 0.035, 0.02), smoothstep(0.0, -0.08, h));
  gl_FragColor = vec4(col, 1.0);
}`;

const groundFrag = /* glsl */ `
uniform vec3 uFog;
uniform float uFogDen;
varying float vDepth;
void main() {
  vec3 col = vec3(0.045, 0.034, 0.018);
  float fog = 1.0 - exp(-uFogDen * uFogDen * vDepth * vDepth);
  gl_FragColor = vec4(mix(col, uFog, clamp(fog, 0.0, 1.0)), 1.0);
}`;
const groundVert = /* glsl */ `
varying float vDepth;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const dustVert = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uPx;
varying float vA;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.3 + aSeed * 6.28) * 0.6;
  p.y += sin(uTime * 0.5 + aSeed * 12.0) * 0.25;
  p.z += cos(uTime * 0.2 + aSeed * 3.0) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPx * (1.0 + aSeed) * 6.0 / max(-mv.z, 0.5);
  vA = (0.35 + 0.65 * sin(uTime * 1.3 + aSeed * 40.0) * 0.5 + 0.5) * smoothstep(40.0, 4.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const dustFrag = /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(1.0, 0.78, 0.45, a * vA * 0.9);
}`;

function bladeGeometry(segments = 6) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const y = i / segments;
    // wheat-like profile: thin stem, a fuller ear near the top, pointed tip
    const ear = y > 0.68 ? Math.sin(((y - 0.68) / 0.32) * Math.PI) * 1.05 : 0;
    const w = (1 - y * 0.55) * 0.5 + ear * 0.5;
    const z = y * y * 0.12;
    if (i === segments) {
      pos.push(0, y, z);
      uv.push(0.5, y);
    } else {
      pos.push(-w * 0.5, y, z, w * 0.5, y, z);
      uv.push(0, y, 1, y);
    }
  }
  for (let i = 0; i < segments - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, c, b, d, c);
  }
  const last = (segments - 1) * 2;
  idx.push(last, last + 1, segments * 2);
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export default function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch {
      const r = requestAnimationFrame(() => setFailed(true));
      return () => cancelAnimationFrame(r);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 800;
    const N = small ? 26000 : (navigator.hardwareConcurrency || 4) >= 8 ? 90000 : 60000;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.6 : 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(small ? 62 : 48, 1, 0.1, 400);
    const sunDir = new THREE.Vector3(0.18, 0.055, -1).normalize();
    const fog = new THREE.Color(0.93, 0.55, 0.3);
    const fogDen = 0.028;

    // sky
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(200, 32, 16),
      new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false, uniforms: { uSunDir: { value: sunDir }, uTime: { value: 0 } } }),
    );
    sky.renderOrder = -1;
    scene.add(sky);

    // ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.ShaderMaterial({ vertexShader: groundVert, fragmentShader: groundFrag, uniforms: { uFog: { value: fog }, uFogDen: { value: fogDen } } }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // field: furrow rows converging to the horizon
    const geo = bladeGeometry(6);
    const off = new Float32Array(N * 3);
    const scl = new Float32Array(N * 2);
    const rot = new Float32Array(N);
    const hue = new Float32Array(N);
    const rowGap = 0.34;
    for (let i = 0; i < N; i++) {
      const row = Math.floor(Math.random() * 260) - 130;
      const x = row * rowGap + (Math.random() - 0.5) * 0.16;
      const z = 4.6 - Math.pow(Math.random(), 0.8) * 106;
      off[i * 3] = x;
      off[i * 3 + 1] = 0;
      off[i * 3 + 2] = z;
      scl[i * 2] = 0.035 + Math.random() * 0.03;
      scl[i * 2 + 1] = 0.72 + Math.random() * 0.5 + (Math.abs(row) % 2) * 0.05;
      rot[i] = (Math.random() - 0.5) * 1.2;
      hue[i] = Math.random();
    }
    geo.setAttribute("iOffset", new THREE.InstancedBufferAttribute(off, 3));
    geo.setAttribute("iScale", new THREE.InstancedBufferAttribute(scl, 2));
    geo.setAttribute("iRot", new THREE.InstancedBufferAttribute(rot, 1));
    geo.setAttribute("iHue", new THREE.InstancedBufferAttribute(hue, 1));
    geo.instanceCount = N;
    const bladeMat = new THREE.ShaderMaterial({
      vertexShader: bladeVert,
      fragmentShader: bladeFrag,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uWind: { value: 1 }, uSunDir: { value: sunDir }, uFog: { value: fog }, uFogDen: { value: fogDen }, uCam: { value: new THREE.Vector3() } },
    });
    const field = new THREE.Mesh(geo, bladeMat);
    field.frustumCulled = false;
    scene.add(field);

    // floating pollen
    const D = small ? 260 : 520;
    const dp = new Float32Array(D * 3);
    const ds = new Float32Array(D);
    for (let i = 0; i < D; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 30;
      dp[i * 3 + 1] = 0.4 + Math.random() * 3.2;
      dp[i * 3 + 2] = 6 - Math.random() * 38;
      ds[i] = Math.random();
    }
    const dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    dgeo.setAttribute("aSeed", new THREE.BufferAttribute(ds, 1));
    const dmat = new THREE.ShaderMaterial({ vertexShader: dustVert, fragmentShader: dustFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } } });
    scene.add(new THREE.Points(dgeo, dmat));

    const look = new THREE.Vector3();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollP = 0;
    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const h = canvas.parentElement?.offsetHeight || window.innerHeight;
      scrollP = Math.min(1, Math.max(0, window.scrollY / h));
    };
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    const t0 = performance.now();
    let raf = 0;
    let first = true;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = reduce ? 4 : (performance.now() - t0) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const p = scrollP;
      const ease = p * p * (3 - 2 * p);
      camera.position.set(mouse.x * 0.5 + Math.sin(t * 0.07) * 0.3, 1.18 + ease * 4.6 - mouse.y * 0.12, 7 - ease * 5 + Math.sin(t * 0.09) * 0.5);
      look.set(mouse.x * 1.4, 1.0 - ease * 7.5 - mouse.y * 0.3, camera.position.z - 30);
      camera.lookAt(look);
      sky.position.copy(camera.position);
      bladeMat.uniforms.uTime.value = t;
      bladeMat.uniforms.uCam.value.copy(camera.position);
      dmat.uniforms.uTime.value = t;
      renderer.render(scene, camera);
      if (first) {
        first = false;
        setReady(true);
      }
      if (reduce) cancelAnimationFrame(raf);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      geo.dispose();
      bladeMat.dispose();
      dgeo.dispose();
      dmat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`hero-field ${ready ? "is-ready" : ""} ${failed ? "is-failed" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-fallback" src="/images/agro-field.webp" alt="" />
      <canvas ref={canvasRef} />
    </div>
  );
}
