"use client";

import { useEffect, useState } from "react";
import { bus, BusEvents, Occupant } from "@/game/net/bus";

type View = "neighborhood" | "house";

export function HUD() {
  const [view, setView] = useState<View>("neighborhood");
  const [houseName, setHouseName] = useState("");
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [chatText, setChatText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onNeighborhood = () => setView("neighborhood");
    const onHouse = ({ houseName }: { houseId: string; houseName: string }) => {
      setView("house");
      setHouseName(houseName);
    };
    const onOccupants = ({ occupants }: { occupants: Occupant[] }) => setOccupants(occupants);
    const onError = ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 4000);
    };

    bus.on(BusEvents.ViewNeighborhood, onNeighborhood);
    bus.on(BusEvents.ViewHouse, onHouse);
    bus.on(BusEvents.OccupantsUpdate, onOccupants);
    bus.on(BusEvents.GameError, onError);
    return () => {
      bus.off(BusEvents.ViewNeighborhood, onNeighborhood);
      bus.off(BusEvents.ViewHouse, onHouse);
      bus.off(BusEvents.OccupantsUpdate, onOccupants);
      bus.off(BusEvents.GameError, onError);
    };
  }, []);

  function sendChat() {
    const text = chatText.trim();
    if (!text) return;
    bus.emit(BusEvents.ChatSend, { text });
    setChatText("");
  }

  function reportOccupant(occupant: Occupant) {
    const confirmed = window.confirm(
      `${occupant.name} adlı kişiyi bildirmek istediğine emin misin? Bir daha eşleşmeyeceksiniz.`
    );
    if (!confirmed) return;
    bus.emit(BusEvents.ReportSend, { targetSessionId: occupant.sessionId });
  }

  return (
    <div className="hud">
      {view === "neighborhood" && (
        <div className="hud-hint">Yürümek için WASD / ok tuşları · Eve girmek için E veya tıkla</div>
      )}

      {view === "house" && (
        <div className="hud-house-panel">
          <div className="hud-house-header">
            <span className="hud-house-name">{houseName}</span>
            <span className="hud-house-count">{occupants.length + 1} kişi</span>
            <button className="hud-leave-btn" onClick={() => bus.emit(BusEvents.LeaveHouse)}>
              Çık
            </button>
          </div>

          {occupants.length > 0 && (
            <div className="hud-occupants">
              {occupants.map((o) => (
                <span key={o.sessionId} className="hud-occupant-chip">
                  {o.name}
                  <button
                    className="hud-report-btn"
                    title="Bildir"
                    onClick={() => reportOccupant(o)}
                  >
                    ⚑
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="hud-chat-row">
            <input
              className="text-input hud-chat-input"
              value={chatText}
              maxLength={140}
              placeholder="Bir şeyler yaz..."
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendChat();
              }}
            />
            <button className="hud-send-btn" onClick={sendChat}>
              Gönder
            </button>
          </div>
        </div>
      )}

      {error && <div className="hud-error-toast">{error}</div>}

      <div className="privacy-footer">
        İsim ve yaş dışında kişisel veri toplanmaz. Kimliğiniz anonim bir cihaz kimliğiyle temsil edilir.
      </div>
    </div>
  );
}
