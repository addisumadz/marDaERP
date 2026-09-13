const BASE_SERIES = {
  // Basic Amharic consonant series, mapped to their 1st-order ("e") form
  // Examples:
  //  - be → በ, bu → ቡ, bi → ቢ, ba → ባ, bie → ቤ, b → ብ, bo → ቦ, bua → ቧ
  h: "ሀ",
  H: "ሐ", // pharyngeal "ha"
  l: "ለ",
  L: "ለ",
  m: "መ",
  M: "መ",
  s: "ሰ",
  S: "ሠ",
  r: "ረ",
  R: "ረ",
  sh: "ሸ",
  q: "ቀ",
  Q: "ቀ",
  b: "በ",
  B: "በ",
  v: "ቨ",
  V: "ቨ",
  t: "ተ",
  ch: "ቸ",
  n: "ነ",
  N: "ነ",
  x: "አ",
  X: "አ",
  k: "ከ",
  K: "ኸ",
  "'": "አ", // glottal series (ʼe → አ, ʼa → ኣ, ʼ → እ, etc.)
  w: "ወ",
  W: "ወ",
  z: "ዘ",
  Z: "ዠ",
  y: "የ",
  Y: "የ",
  d: "ደ",
  D: "ደ",
  j: "ጀ",
  J: "ጀ",
  g: "ገ",
  G: "ገ",
  T: "ጠ",
  C: "ጨ",
  P: "ጰ",
  ts: "ጸ",
  c: "ፀ",
  f: "ፈ",
  F: "ፈ",
  p: "ፐ",
  Pp: "ፐ",
};

const VOWEL_ORDERS_PHONETIC = {
  // Order indices relative to the base consonant code point
  // (most Ethiopic series are consecutive in Unicode)
  e: 0,   // 1st order  (e)
  u: 1,   // 2nd order  (u)
  i: 2,   // 3rd order  (i)
  a: 3,   // 4th order  (a)
  ie: 4,  // 5th order  (e/é, often written "ie")
  "": 5, // 6th order  (ə / default consonant, e.g. ብ)
  o: 6,   // 7th order  (o)
  ua: 7,  // 8th order  (wa, e.g. ቧ)
};

const VOWEL_ORDERS_POWERGEEZ = {
  // Power Geez style: C, Cu, Ci, Ca, Cy, Ce, Co, Cua
  "": 0,  // 1st order (e) when only consonant is typed (e.g. b → በ)
  u: 1,   // 2nd order (bu → ቡ)
  i: 2,   // 3rd order (bi → ቢ)
  a: 3,   // 4th order (ba → ባ)
  y: 4,   // 5th order (by → ቤ)
  e: 5,   // 6th order (be → ብ)
  o: 6,   // 7th order (bo → ቦ)
  ua: 7,  // 8th order (bua → ቧ)
};

function transliterateWithVowels(input, vowelOrders) {
  let result = "";
  const text = input;
  let i = 0;

  while (i < text.length) {
    let handled = false;

    // Try to read a consonant symbol (2-letter clusters like "sh", "ch", "ts" first)
    let consonant = null;
    let consonantLen = 0;

    const two = text.slice(i, i + 2);
    if (BASE_SERIES[two]) {
      consonant = two;
      consonantLen = 2;
    } else {
      const one = text[i];
      if (BASE_SERIES[one]) {
        consonant = one;
        consonantLen = 1;
      }
    }

    if (consonant) {
      const after = text.slice(i + consonantLen);
      let vowel = "";
      let vowelLen = 0;

      // Multi-letter vowels first
      if (after.startsWith("ua")) {
        vowel = "ua";
        vowelLen = 2;
      } else if (after.startsWith("ie") && vowelOrders.ie !== undefined) {
        vowel = "ie";
        vowelLen = 2;
      } else if (after[0] && vowelOrders[after[0]] !== undefined) {
        vowel = after[0];
        vowelLen = 1;
      } else {
        vowel = "";
        vowelLen = 0;
      }

      const baseChar = BASE_SERIES[consonant];
      const orderIndex = vowelOrders[vowel];
      const baseCode = baseChar.codePointAt(0);
      const geezChar = String.fromCodePoint(baseCode + orderIndex);

      result += geezChar;
      i += consonantLen + vowelLen;
      handled = true;
    }

    if (!handled) {
      // Fallback: copy character as-is
      result += text[i];
      i += 1;
    }
  }

  return result;
}

export function transliterateToAmharic(input, mode = "powerGeez") {
  if (!input) return "";

  const vowelOrders = mode === "phonetic" ? VOWEL_ORDERS_PHONETIC : VOWEL_ORDERS_POWERGEEZ;
  return transliterateWithVowels(input, vowelOrders);
}
