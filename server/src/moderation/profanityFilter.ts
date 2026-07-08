/**
 * Server-side profanity filter. This is the only gate a chat message passes
 * through before it is broadcast — clients never see raw unfiltered text.
 *
 * MVP scope: a normalized blacklist match. It deliberately over-blocks
 * (whole message replaced, not surgical word censorship) rather than risk
 * leetspeak/spacing bypasses slipping partial matches through.
 */

// Small seed blacklist (Turkish + English). Extend freely — this is a plain
// array on purpose so growing the list never touches matching logic.
const BLACKLIST = [
  "amk", "aq", "yarrak", "yarak", "orospu", "piç", "pic", "siktir", "sikerim",
  "sikeyim", "göt", "got", "ibne", "kahpe", "sürtük", "surtuk", "amcik",
  "amcık", "oç", "oc", "gavat", "puşt", "pust",
  "fuck", "shit", "bitch", "asshole", "cunt", "whore", "slut", "nigger",
  "nigga", "faggot", "retard",
];

const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b",
  "@": "a", "$": "s", "!": "i", "+": "t",
};

function normalize(input: string): string {
  let s = input.toLocaleLowerCase("tr-TR");
  // Turkish diacritics -> ascii base letters, so "ş", "ı" etc. still match plain roots.
  s = s
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");
  s = s
    .split("")
    .map((ch) => LEET_MAP[ch] ?? ch)
    .join("");
  // Strip everything that isn't a letter/digit, collapsing spaced-out or
  // punctuated evasion like "k.u.f.u.r" or "k u f u r" into "kufur".
  s = s.replace(/[^a-z0-9]/g, "");
  return s;
}

export function containsProfanity(rawMessage: string): boolean {
  const normalized = normalize(rawMessage);
  if (!normalized) return false;
  return BLACKLIST.some((word) => normalized.includes(normalize(word)));
}

const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

/**
 * Returns the message to broadcast: the original text if clean, or a
 * placeholder if it trips the filter. Also enforces a max length and
 * strips control characters so head-bubble text can't be abused.
 */
export function moderateMessage(rawMessage: string): string {
  const trimmed = rawMessage.replace(CONTROL_CHARS, "").trim().slice(0, 140);
  if (!trimmed) return "";
  if (containsProfanity(trimmed)) return "[message filtered]";
  return trimmed;
}
