"use client";

import { useState } from "react";

interface LoginScreenProps {
  onEnter: (name: string, age: number) => void;
}

const MIN_AGE = 13;
const MAX_AGE = 99;
const REQUIRED_AGE = 18;

export function LoginScreen({ onEnter }: LoginScreenProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(REQUIRED_AGE);

  const trimmedName = name.trim();
  const canEnter = trimmedName.length > 0 && age >= REQUIRED_AGE;

  function submit() {
    if (!canEnter) return;
    onEnter(trimmedName, age);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Lo-Fi Square</h1>
        <p className="login-tagline">Sakin bir mahallede, yürü, sohbet et, kaybol.</p>

        <label className="field-label" htmlFor="name-input">
          İsim
        </label>
        <input
          id="name-input"
          className="text-input"
          value={name}
          maxLength={20}
          placeholder="Sana ne diyelim?"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          autoFocus
        />

        <label className="field-label">Yaş</label>
        <div className="age-stepper">
          <button
            type="button"
            className="age-btn"
            onClick={() => setAge((a) => Math.max(MIN_AGE, a - 1))}
            aria-label="Yaşı azalt"
          >
            −
          </button>
          <span className="age-value">{age}</span>
          <button
            type="button"
            className="age-btn"
            onClick={() => setAge((a) => Math.min(MAX_AGE, a + 1))}
            aria-label="Yaşı artır"
          >
            +
          </button>
        </div>
        {age < REQUIRED_AGE && (
          <p className="age-warning">Bu deneyim 18 yaş ve üzeri içindir.</p>
        )}

        <button className="enter-btn" disabled={!canEnter} onClick={submit}>
          Gir
        </button>

        <p className="privacy-note">
          İsim ve yaş dışında hiçbir kişisel veri toplanmaz. Kötüye kullanımı
          engellemek için kimliğinizle bağlantısız, rastgele bir anonim oturum
          kimliği kullanılır. Devam ederek 18 yaş ve üzerinde olduğunuzu kabul
          edersiniz.
        </p>
      </div>
    </div>
  );
}
