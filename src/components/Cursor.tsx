"use client";

import { useEffect, useRef } from "react";

// Small dot + trailing ring, only on devices with a fine pointer.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const d = dot.current!;
    const r = ring.current!;
    const pos = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let raf = 0;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      d.style.opacity = r.style.opacity = "1";
      const interactive = (e.target as Element)?.closest?.("a, button");
      r.dataset.hover = interactive ? "true" : "false";
    };
    const leave = () => (d.style.opacity = r.style.opacity = "0");
    const tick = () => {
      trail.x += (pos.x - trail.x) * 0.18;
      trail.y += (pos.y - trail.y) * 0.18;
      d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      r.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    document.documentElement.classList.add("custom-cursor");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
