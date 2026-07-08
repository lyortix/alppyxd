"use client";

import { useEffect, useRef, useState } from "react";
import { bus } from "@/game/net/bus";

/**
 * Touch virtual joystick (bottom-left, thumb zone). Publishes a normalized
 * vector on the bus; WorldScene reads it as an analog movement input. Only
 * shown on touch devices so desktop keeps WASD/arrows unobstructed.
 */
export function Joystick() {
  const [touch, setTouch] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activeId = useRef<number | null>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    setTouch(isTouch);
  }, []);

  useEffect(() => {
    // Ensure movement stops if the joystick unmounts mid-press.
    return () => bus.emit("joystick:move", { x: 0, y: 0 });
  }, []);

  if (!touch) return null;

  const RADIUS = 52;

  const emit = (nx: number, ny: number) => bus.emit("joystick:move", { x: nx, y: ny });

  const handleMove = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    emit(dx / RADIUS, dy / RADIUS);
  };

  const reset = () => {
    activeId.current = null;
    setKnob({ x: 0, y: 0 });
    emit(0, 0);
  };

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto absolute bottom-24 left-6 w-32 h-32 rounded-full bg-white/5 border border-white/15 touch-none select-none"
      onPointerDown={(e) => {
        activeId.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (activeId.current === e.pointerId) handleMove(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        className="absolute left-1/2 top-1/2 w-14 h-14 -ml-7 -mt-7 rounded-full bg-[#ffb46b]/70 border border-white/30 shadow-lg transition-transform"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
