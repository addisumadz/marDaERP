/**
 * Windows 10 Built-in Amharic Phonetic Keyboard Engine & Transliteration Helper
 *
 * Implements the exact Windows 10 / Ge'ez Frontier Foundation (GFF) Phonetic keyboard rules:
 * - Consonants alone default to their 6th-order (Sadis, e.g. l -> ል, m -> ም, k -> ክ, b -> ብ).
 * - When immediately followed by vowels, the 6th-order consonant morphs:
 *     + e  -> 1st order (Ge'ez: ለ, መ, ከ, በ, ደ, ተ, ሰ)
 *     + u  -> 2nd order (Ka'eb: ሉ, ሙ, ኩ, ቡ, ዱ, ቱ, ሱ)
 *     + i  -> 3rd order (Salis: ሊ, ሚ, ኪ, ቢ, ዲ, ቲ, ሲ)
 *     + a  -> 4th order (Rabi:  ላ, ማ, ካ, ባ, ዳ, ታ, ሳ)
 *     + E / ee / ie -> 5th order (Hamis: ሌ, ሜ, ኬ, ቤ, ዴ, ቴ, ሴ)
 *     + o  -> 7th order (Sabi:  ሎ, ሞ, ኮ, ቦ, ዶ, ቶ, ሶ)
 *     + ua / wa -> 8th order (Diphthong: ሏ, ሟ, ኳ, ቧ, ዷ, ቷ, ሷ)
 * - Multi-letter consonants:
 *     sh -> ሸ/ሽ, ch -> ቸ/ች, zh -> ዠ/ዥ, kh -> ኸ/ኽ, ts -> ጸ/ጽ, ny/gn -> ኘ/ኝ
 * - Standalone vowels (start of word or after vowels):
 *     a/A -> አ, u/U -> ኡ, i/I -> ኢ, e -> እ, E -> ኤ, o/O -> オ
 * - Apostrophe (') acts as syllable divider (e.g. mel'ak -> መልአክ vs melak -> መላክ)
 *   or glottal modifier (t' -> ጥ, c' -> ጭ, p' -> ጵ, s' -> ጽ)
 * - Natural duplicate consonant collapse for Ethiopian names (e.g. Tadesse -> ታደሰ, Mohammed -> ሞሃመድ)
 */

export const FAMILIES = {
  h: ["ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ", "ኋ"],
  H: ["ሐ", "ሑ", "ሒ", "ሓ", "ሔ", "ሕ", "ሖ", "ሗ"],
  l: ["ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ", "ሏ"],
  m: ["መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ", "ሟ"],
  r: ["ረ", "ሩ", "ሪ", "ራ", "ሬ", "ር", "ሮ", "ሯ"],
  s: ["ሰ", "ሱ", "ሲ", "ሳ", "ሴ", "ስ", "ሶ", "ሷ"],
  S: ["ሠ", "ሡ", "ሢ", "ሣ", "ሤ", "ሥ", "ሦ", "ሧ"],
  sh: ["ሸ", "ሹ", "ሺ", "ሻ", "ሼ", "ሽ", "ሾ", "ሿ"],
  q: ["ቀ", "ቁ", "ቂ", "ቃ", "ቄ", "ቅ", "ቆ", "ቋ"],
  b: ["በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ", "ቧ"],
  v: ["ቨ", "ቩ", "ቪ", "ቫ", "ቬ", "ቭ", "ቮ", "ቯ"],
  t: ["ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ", "ቷ"],
  ch: ["ቸ", "ቹ", "ቺ", "ቻ", "ቼ", "ች", "ቾ", "ቿ"],
  n: ["ነ", "ኑ", "ኒ", "ና", "ኔ", "ን", "ኖ", "ኗ"],
  ny: ["ኘ", "ኙ", "ኚ", "ኛ", "ኜ", "ኝ", "ኞ", "ኟ"],
  k: ["ከ", "ኩ", "ኪ", "ካ", "ኬ", "ክ", "ኮ", "ኳ"],
  kh: ["ኸ", "ኹ", "ኺ", "ኻ", "ኼ", "ኽ", "ኾ", "ዃ"],
  w: ["ወ", "ዉ", "ዊ", "ዋ", "ዌ", "ው", "ዎ", "ዏ"],
  z: ["ዘ", "ዙ", "ዚ", "ዛ", "ዜ", "ዝ", "ዞ", "ዟ"],
  zh: ["ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ", "ዧ"],
  y: ["የ", "ዩ", "ዪ", "ያ", "ዬ", "ይ", "ዮ", "ዯ"],
  d: ["ደ", "ዱ", "ዲ", "ዳ", "ዴ", "ድ", "ዶ", "ዷ"],
  j: ["ጀ", "ጁ", "ጂ", "ጃ", "ጄ", "ጅ", "ጆ", "ጇ"],
  g: ["ገ", "ጉ", "ጊ", "ጋ", "ጌ", "ግ", "ጎ", "ጓ"],
  T: ["ጠ", "ጡ", "ጢ", "ጣ", "ጤ", "ጥ", "ጦ", "ጧ"],
  C: ["ጨ", "ጩ", "ጪ", "ጫ", "ጬ", "ጭ", "ጮ", "ጯ"],
  P: ["ጰ", "ጱ", "ጲ", "ጳ", "ጴ", "ጵ", "ጶ", "ጷ"],
  ts: ["ጸ", "ጹ", "ጺ", "ጻ", "ጼ", "ጽ", "ጾ", "ጿ"],
  TS: ["ፀ", "ፁ", "ፂ", "ፃ", "ፄ", "ፅ", "ፆ", "ፇ"],
  f: ["ፈ", "ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ", "ፏ"],
  p: ["ፐ", "ፑ", "ፒ", "ፓ", "ፔ", "ፕ", "ፖ", "ፗ"],
  vowels: ["አ", "ኡ", "ኢ", "ኣ", "ኤ", "እ", "ኦ", "ኧ"],
};

// Reverse lookup table from any Ge'ez character to its family metadata
export const CHAR_TO_FAMILY = {};
for (const [key, fam] of Object.entries(FAMILIES)) {
  fam.forEach((char, order) => {
    CHAR_TO_FAMILY[char] = { key, fam, order };
  });
}

// Single-character consonant mappings
const CONSONANT_MAP = {
  h: "h", H: "H",
  l: "l", L: "l",
  m: "m", M: "m",
  r: "r", R: "r",
  s: "s", S: "S",
  q: "q", Q: "q",
  b: "b", B: "b",
  v: "v", V: "v",
  t: "t", T: "T",
  c: "ch", C: "C",
  n: "n", N: "ny",
  k: "k", K: "kh",
  w: "w", W: "w",
  z: "z", Z: "zh",
  y: "y", Y: "y",
  d: "d", D: "d",
  j: "j", J: "j",
  g: "g", G: "g",
  P: "P",
  f: "f", F: "f",
  p: "p",
  x: "sh", X: "sh",
};

/**
 * State transition for the next character typed in the input stream.
 */
function transformNextChar(text, char, isFrozen) {
  const prevChar = text.length > 0 ? text[text.length - 1] : null;
  const beforePrev = text.length > 1 ? text[text.length - 2] : null;
  const prevInfo = prevChar ? CHAR_TO_FAMILY[prevChar] : null;

  // Apostrophe handling: modifier or syllable freeze
  if (char === "'") {
    if (prevInfo && prevInfo.order === 5) {
      if (prevInfo.key === "t") return { popCount: 1, newText: FAMILIES.T[5], freeze: false };
      if (prevInfo.key === "ch") return { popCount: 1, newText: FAMILIES.C[5], freeze: false };
      if (prevInfo.key === "p") return { popCount: 1, newText: FAMILIES.P[5], freeze: false };
      if (prevInfo.key === "s") return { popCount: 1, newText: FAMILIES.ts[5], freeze: false };
      return { popCount: 0, newText: "", freeze: true };
    }
    return { popCount: 0, newText: "", freeze: true };
  }

  // If the preceding consonant was frozen with an apostrophe, do not merge
  if (isFrozen) {
    if (char === "a" || char === "A") return { popCount: 0, newText: "አ", freeze: false };
    if (char === "u" || char === "U") return { popCount: 0, newText: "ኡ", freeze: false };
    if (char === "i" || char === "I") return { popCount: 0, newText: "ኢ", freeze: false };
    if (char === "e") return { popCount: 0, newText: "እ", freeze: false };
    if (char === "E") return { popCount: 0, newText: "ኤ", freeze: false };
    if (char === "o" || char === "O") return { popCount: 0, newText: "ኦ", freeze: false };
    if (CONSONANT_MAP[char]) {
      const famKey = CONSONANT_MAP[char];
      return { popCount: 0, newText: FAMILIES[famKey][5], freeze: false };
    }
    return { popCount: 0, newText: char, freeze: false };
  }

  // 1. Labialized combinations: 6th order + w + a -> 8th order (e.g. bwa -> ቧ, lwa -> ሏ)
  if (prevChar === "ው" && (char === "a" || char === "A") && beforePrev) {
    const beforeInfo = CHAR_TO_FAMILY[beforePrev];
    if (beforeInfo && beforeInfo.order === 5 && beforeInfo.fam[7]) {
      return { popCount: 2, newText: beforeInfo.fam[7], freeze: false };
    }
  }

  // 2. Multi-character combinations when prev was 6th order (Sadis):
  if (prevInfo && prevInfo.order === 5) {
    if (prevInfo.key === "s" && (char === "h" || char === "H")) return { popCount: 1, newText: FAMILIES.sh[5], freeze: false };
    if (prevInfo.key === "z" && (char === "h" || char === "H")) return { popCount: 1, newText: FAMILIES.zh[5], freeze: false };
    if (prevInfo.key === "ch" && (char === "h" || char === "H")) return { popCount: 1, newText: FAMILIES.ch[5], freeze: false };
    if (prevInfo.key === "k" && (char === "h" || char === "H")) return { popCount: 1, newText: FAMILIES.kh[5], freeze: false };
    if (prevInfo.key === "t" && (char === "s" || char === "S")) return { popCount: 1, newText: FAMILIES.ts[5], freeze: false };
    if (prevInfo.key === "T" && (char === "s" || char === "S")) return { popCount: 1, newText: FAMILIES.TS[5], freeze: false };
    if (prevInfo.key === "n" && (char === "y" || char === "Y")) return { popCount: 1, newText: FAMILIES.ny[5], freeze: false };
    if (prevInfo.key === "g" && (char === "n" || char === "N")) return { popCount: 1, newText: FAMILIES.ny[5], freeze: false };

    // Ignore duplicate consonant (gemination in English name spelling, e.g. Tadesse -> ታደሰ)
    if (CONSONANT_MAP[char] && CONSONANT_MAP[char] === prevInfo.key) {
      return { popCount: 0, newText: "", freeze: false };
    }
  }

  // 3. Vowel morphing on 6th order consonant (Sadis):
  // e.g. l (ል) + e -> ለ, l (ል) + u -> ሉ, l (ል) + a -> ላ, l (ል) + o -> ሎ
  if (prevInfo && prevInfo.order === 5 && prevInfo.key !== "vowels") {
    if (char === "e") return { popCount: 1, newText: prevInfo.fam[0], freeze: false }; // 1st order
    if (char === "u" || char === "U") return { popCount: 1, newText: prevInfo.fam[1], freeze: false }; // 2nd order
    if (char === "i" || char === "I") return { popCount: 1, newText: prevInfo.fam[2], freeze: false }; // 3rd order
    if (char === "a" || char === "A") return { popCount: 1, newText: prevInfo.fam[3], freeze: false }; // 4th order
    if (char === "E") return { popCount: 1, newText: prevInfo.fam[4], freeze: false }; // 5th order
    if (char === "o" || char === "O") return { popCount: 1, newText: prevInfo.fam[6], freeze: false }; // 7th order
  }

  // 4. Secondary vowel morphing on other orders:
  if (prevInfo) {
    // 1st order + e -> 5th order (e.g. le (ለ) + e -> ሌ)
    // 3rd order + e -> 5th order (e.g. li (ሊ) + e -> ሌ)
    if ((prevInfo.order === 0 || prevInfo.order === 2) && (char === "e" || char === "E")) {
      return { popCount: 1, newText: prevInfo.fam[4], freeze: false };
    }
    // 2nd order + a -> 8th order (e.g. lu (ሉ) + a -> ሏ, bu (ቡ) + a -> ቧ)
    if (prevInfo.order === 1 && (char === "a" || char === "A")) {
      return { popCount: 1, newText: prevInfo.fam[7], freeze: false };
    }
    // 1st order + y -> 5th order (e.g. ley -> ሌ)
    if (prevInfo.order === 0 && char === "y") {
      return { popCount: 1, newText: prevInfo.fam[4], freeze: false };
    }
    // አ + a -> ኣ
    if (prevChar === "አ" && (char === "a" || char === "A")) {
      return { popCount: 1, newText: "ኣ", freeze: false };
    }
    // እ + e -> ኤ
    if (prevChar === "እ" && (char === "e" || char === "E")) {
      return { popCount: 1, newText: "ኤ", freeze: false };
    }
    // ኢ + e -> ኤ
    if (prevChar === "ኢ" && (char === "e" || char === "E")) {
      return { popCount: 1, newText: "ኤ", freeze: false };
    }
  }

  // 5. Standalone Vowels (initial or after completed syllables):
  // Maps a / A to አ (standard for names like Alemu -> አለሙ)
  if (char === "a" || char === "A") return { popCount: 0, newText: "አ", freeze: false };
  if (char === "u" || char === "U") return { popCount: 0, newText: "ኡ", freeze: false };
  if (char === "i" || char === "I") return { popCount: 0, newText: "ኢ", freeze: false };
  if (char === "e") return { popCount: 0, newText: "እ", freeze: false };
  if (char === "E") return { popCount: 0, newText: "ኤ", freeze: false };
  if (char === "o" || char === "O") return { popCount: 0, newText: "ኦ", freeze: false };

  // 6. Standalone Consonants -> Produce 6th order (Sadis)
  if (CONSONANT_MAP[char]) {
    const famKey = CONSONANT_MAP[char];
    return { popCount: 0, newText: FAMILIES[famKey][5], freeze: false };
  }

  // Default: pass character through (spaces, punctuation, digits, existing Ethiopic chars)
  return { popCount: 0, newText: char, freeze: false };
}

/**
 * Process any string character-by-character according to Windows 10 Amharic Phonetic rules.
 * Handles both pure English input ("alemu kebede" -> "አለሙ ከበደ")
 * and mixed/incremental typing ("አልeምu" -> "አለሙ").
 */
export function processAmharicString(inputStr) {
  if (!inputStr) return "";
  let text = "";
  let isFrozen = false;
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr[i];
    const res = transformNextChar(text, char, isFrozen);
    isFrozen = Boolean(res.freeze);
    if (res.popCount > 0) {
      text = text.slice(0, -res.popCount) + res.newText;
    } else {
      text += res.newText;
    }
  }
  return text;
}

/**
 * Real-time input change handler for React input fields.
 * Automatically converts typed Latin characters to Amharic following Windows 10 rules,
 * while accurately maintaining the browser's cursor position.
 *
 * @param {React.ChangeEvent<HTMLInputElement>} event
 * @param {(value: string) => void} setValue
 * @param {boolean} isEnabled
 */
export function handleAmharicInputChange(event, setValue, isEnabled = true) {
  const target = event.target;
  const rawValue = target.value;

  if (!isEnabled) {
    setValue(rawValue);
    return;
  }

  // If there are no Latin characters or apostrophe, no transliteration needed
  if (!/[a-zA-Z']/.test(rawValue)) {
    setValue(rawValue);
    return;
  }

  const prevCursor = target.selectionStart ?? rawValue.length;
  const converted = processAmharicString(rawValue);
  setValue(converted);

  // Preserve cursor position across React re-renders
  if (target && typeof target.setSelectionRange === "function") {
    const diff = rawValue.length - converted.length;
    const newPos = Math.max(0, prevCursor - diff);
    requestAnimationFrame(() => {
      try {
        target.setSelectionRange(newPos, newPos);
      } catch (_) {}
    });
  }
}

/**
 * Smart phonetic transliteration tailored for Ethiopian full names.
 * Compatible with existing callers.
 */
export function transliterateNamePhonetic(input) {
  if (!input) return "";
  // If already purely Ge'ez characters and no Latin letters, return untouched
  if (/[\u1200-\u137F]/.test(input) && !/[a-zA-Z']/.test(input)) {
    return input;
  }
  return processAmharicString(input);
}

/**
 * General transliteration function supporting "phonetic" (Windows 10 rule)
 * and legacy modes. Compatible with existing callers across the app.
 */
export function transliterateToAmharic(input, mode = "phonetic") {
  if (!input) return "";
  return processAmharicString(input);
}
