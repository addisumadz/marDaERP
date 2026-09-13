import { amharicEquivalents } from './amharicVariants';

const variantCache = new Map();

export function generateWordVariants(word) {
  if (variantCache.has(word)) {
    return variantCache.get(word);
  }

  const chars = word.split('');

  const variants = chars.map((char) => {
    return amharicEquivalents[char] || [char];
  });

  const cartesian = (arr) =>
    arr.reduce((a, b) =>
      a.flatMap((d) => b.map((e) => d + e)), ['']
    );

  const result = cartesian(variants);
  variantCache.set(word, result);
  return result;
}
