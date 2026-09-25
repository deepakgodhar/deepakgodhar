"use client";

import { useEffect, useRef } from "react";
import { content, type HeadConfig } from "@/content";

// Where the face sits in the frame (fractions), measured on the front-facing image.
const FACE_X = 0.5;
const FACE_Y = 0.38;

// Decoded frames, shared by every head on the page (so a second head costs nothing).
const frameCache = new Map<string, Promise<HTMLImageElement>>();
function loadFrame(url: string) {
  let p = frameCache.get(url);
  if (!p) {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    p = img.decode().then(() => img);
    p.catch(() => frameCache.delete(url));
    frameCache.set(url, p);
  }
  return p;
}

// Step load order, coarse-to-fine, so every direction is usable early.
function stepOrder(n: number): number[] {
  const order = [0, n];
  for (let div = 2; div <= n; div *= 2) {
    for (let i = 1; i < div; i += 2) order.push(Math.round((i * n) / div));
  }
  for (let i = 0; i <= n; i++) order.push(i);
  return [...new Set(order)];
}

export default function HeadTracker({ head }: { head: HeadConfig }) {
  const { steps, width, height, base } = head;
  const src = (dir: string, step: number) => `/${base}/${dir}/f_${String(step).padStart(2, "0")}.webp`;
  // Directions sorted by angle so neighbours can be found by walking the circle.
  const dirs = [...head.directions].sort((a, b) => a.angle - b.angle);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const tilt = tiltRef.current;
    if (!canvas || !tilt) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const images = new Map<string, HTMLImageElement>();
    // Every direction has its own front frame (video clips start on slightly different frames).
    const key = (dir: string, step: number) => `${dir}/${step}`;
    let disposed = false;

    // --- sizing -----------------------------------------------------------
    let lastKey = "";
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      lastKey = "";
    };

    // --- drawing ----------------------------------------------------------
    // Closest loaded step to `want` in a direction (falls back toward the front pose).
    const loadedStep = (dir: string, want: number) => {
      for (let d = 0; d <= steps; d++) {
        if (want - d >= 0 && images.has(key(dir, want - d))) return want - d;
        if (want + d <= steps && images.has(key(dir, want + d))) return want + d;
      }
      return -1;
    };
    const blit = (img: HTMLImageElement) => {
      const s = Math.max(canvas.width / width, canvas.height / height);
      const w = width * s;
      const h = height * s;
      ctx.drawImage(img, (canvas.width - w) / 2, canvas.height - h, w, h);
    };

    // Angular distance between two angles in degrees (0..180).
    const angDist = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
    // Half the gap to the nearest neighbouring direction, per direction.
    const halfGap = dirs.map((d, i) => {
      const prev = dirs[(i - 1 + dirs.length) % dirs.length];
      const next = dirs[(i + 1) % dirs.length];
      const gap = Math.min(angDist(d.angle, prev.angle), angDist(d.angle, next.angle)) / 2;
      return gap > 0 ? gap : 90; // a lone direction covers the half-circle around it
    });

    // look.x / look.y in -1..1 (screen space: +x right, +y down).
    // Never cross-fades two directions (that ghosts two faces): pick the nearest
    // direction and shrink the turn as the cursor moves toward the boundary with the
    // next one, so switching happens near the front pose.
    // `blend` is 1 while moving (dissolve between the two nearest steps for smooth
    // motion) and eases to 0 at rest (settle on one sharp frame without a pop).
    const draw = (lx: number, ly: number, blend: number) => {
      const mag = Math.min(1, Math.hypot(lx, ly));
      const angle = (((Math.atan2(ly, lx) * 180) / Math.PI) + 360) % 360;

      let best = 0;
      for (let i = 1; i < dirs.length; i++) {
        if (angDist(angle, dirs[i].angle) < angDist(angle, dirs[best].angle)) best = i;
      }
      const off = angDist(angle, dirs[best].angle) / halfGap[best]; // 0 on-axis .. 1 at boundary
      const falloff = Math.cos(Math.min(1, off) * (Math.PI / 2));

      // Fractional position along the direction; blend the two neighbouring steps
      // (near-identical poses, so this reads as smooth motion rather than a ghost).
      const pos = mag * falloff * steps;
      const dir = dirs[best].name;
      const s0 = loadedStep(dir, Math.floor(pos));
      if (s0 < 0) return;
      const s1 = Math.min(steps, s0 + 1);
      const hasNext = s1 !== s0 && images.has(key(dir, s1));
      const frac = Math.max(0, Math.min(1, pos - s0));
      const w = !hasNext ? 0 : Math.round((frac * blend + Math.round(frac) * (1 - blend)) * 16) / 16;

      const k = `${key(dir, s0)}|${w}`;
      if (k === lastKey) return;
      lastKey = k;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 1;
      blit(images.get(key(dir, s0))!);
      if (w > 0) {
        ctx.globalAlpha = w;
        blit(images.get(key(dir, s1))!);
        ctx.globalAlpha = 1;
      }
    };

    // --- input ------------------------------------------------------------
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let usingGyro = false;

    // Cursor on the face = look straight ahead; further away = turn more.
    // Both axes use the same scale (based on screen size, not the space left on each
    // side), so up/down doesn't max out after a few pixels when the face is near the top.
    // A small dead zone around the face stops direction flicker when the cursor is on it.
    let lookUntil = 0; // while > now, the head looks where the page told it to
    const aimAt = (clientX: number, clientY: number) => {
      const r = (tilt.parentElement ?? tilt).getBoundingClientRect(); // untransformed stage
      const fx = r.left + r.width * FACE_X;
      const fy = r.top + r.height * FACE_Y;
      const reach = Math.max(320, Math.min(window.innerWidth * 0.5, window.innerHeight * 0.75));
      let nx = (clientX - fx) / reach;
      let ny = (clientY - fy) / reach;
      const d = Math.hypot(nx, ny);
      const dead = 0.06;
      const eased = d <= dead ? 0 : Math.min(1, (d - dead) / (1 - dead));
      const scale = d > 0 ? eased / d : 0;
      nx *= scale;
      ny *= scale;
      target.x = nx;
      target.y = ny;
    };
    const onPointer = (e: PointerEvent) => {
      if (usingGyro || performance.now() < lookUntil) return;
      aimAt(e.clientX, e.clientY);
    };
    const onLook = (e: Event) => {
      const { x, y, ms = 1400 } = (e as CustomEvent<{ x: number; y: number; ms?: number }>).detail;
      lookUntil = performance.now() + ms;
      aimAt(x, y);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      usingGyro = true;
      target.x = Math.max(-1, Math.min(1, e.gamma / 25));
      target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    };
    // iOS needs an explicit permission request from a user gesture.
    const requestGyro = () => {
      const DOE = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DOE?.requestPermission === "function") {
        DOE.requestPermission()
          .then((r) => r === "granted" && window.addEventListener("deviceorientation", onOrient))
          .catch(() => {});
      }
    };
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("head:look", onLook);
    window.addEventListener("pointerdown", onPointer, { passive: true });
    if (isTouch) {
      window.addEventListener("deviceorientation", onOrient);
      window.addEventListener("touchend", requestGyro, { once: true });
    }
    window.addEventListener("resize", resize);
    // The stage is sized by JS after mount (Intro.tsx), so track the canvas box itself —
    // otherwise its pixel buffer keeps the first-paint size and the image stretches.
    // Debounced: the stage resizes every frame while scrolling through the intro, and
    // reallocating the buffer each time stutters; meanwhile CSS scales it (same 16:9).
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    });
    ro.observe(canvas);
    // Skip drawing while off screen (the head keeps easing, so it's right on return).
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      lastKey = "";
    });
    io.observe(canvas);

    // --- loop -------------------------------------------------------------
    let raf = 0;
    let blend = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - prev);
      prev = now;

      const k = reduceMotion ? 1 : 1 - Math.pow(0.001, (dt / 1000) * 1.25); // frame-rate independent easing
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;

      const moving = Math.hypot(target.x - current.x, target.y - current.y) > 0.01;
      blend = moving ? 1 : Math.max(0, blend - dt / 250);
      if (onScreen) draw(current.x, current.y, blend);
      if (onScreen && !reduceMotion) {
        tilt.style.transform = `perspective(1400px) rotateX(${-current.y * 3}deg) rotateY(${current.x * 3}deg) translate3d(${current.x * 8}px, ${current.y * 6}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    // --- preload ------------------------------------------------------------
    const queue: [string, number][] = [];
    for (const s of stepOrder(steps)) {
      for (const d of dirs) queue.push([d.name, s]);
    }
    for (const [dir, step] of queue) {
      loadFrame(src(dir, step)).then(
        (img) => {
          if (disposed) return;
          images.set(key(dir, step), img);
          lastKey = "";
        },
        () => {},
      );
    }

    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("head:look", onLook);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("touchend", requestGyro);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      io.disconnect();
      clearTimeout(resizeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- head config is static per page
  }, [head]);

  return (
    <div ref={tiltRef} className="h-full w-full will-change-transform">
      {/* Poster shows the front-facing frame until the canvas has something to draw. */}
      <canvas
        ref={canvasRef}
        aria-label={`Portrait of ${content.name} that turns to follow your cursor`}
        role="img"
        className="head-canvas h-full w-full"
        style={{ backgroundImage: `url(${src(dirs[0].name, 0)})` }}
      />
    </div>
  );
}
