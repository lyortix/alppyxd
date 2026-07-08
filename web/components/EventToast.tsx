"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";

/**
 * Ambient world-event banner ("a rain shower is passing through…"), driven
 * by synced room state so everyone in the map sees it at the same moment.
 */
export function EventToast() {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return bus.on(BusEvents.EventAnnounce, (p: { text: string }) => {
      if (p.text) {
        setText(p.text);
        setVisible(true);
      } else {
        setVisible(false);
      }
    });
  }, []);

  return (
    <div
      className={`absolute top-16 inset-x-0 flex justify-center transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
    >
      <div className="rounded-full bg-[#262230]/85 backdrop-blur border border-[#ffd166]/30 px-5 py-2 text-sm shadow-[0_0_24px_rgba(255,209,102,0.15)]">
        {text}
      </div>
    </div>
  );
}
