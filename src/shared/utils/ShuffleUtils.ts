/**
 * Generates a deterministic (reproducible) shuffle of an array based on a seed.
 * Useful for ensuring content stays consistent between different screens.
 */
export const getDeterministicShuffle = (array: any[], seed: string | number) => {
  if (!array || array.length <= 1) return [...array];

  // Hash function to turn string seed into a number
  const hashString = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return h;
  };

  const seedNum = typeof seed === "string" ? hashString(seed) : seed;

  /**
   * Mulberry32: A fast 32-bit state PRNG
   */
  const mulberry32 = (a: number) => {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const shuffle = (arr: any[], rand: () => number) => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const isDerangement = (original: any[], shuffled: any[]) => {
    return shuffled.every((val, idx) => val !== original[idx]);
  };

  let attempts = 0;
  let currentSeed = seedNum;
  let shuffledAnswers;

  do {
    const rand = mulberry32(currentSeed);
    shuffledAnswers = shuffle(array, rand);
    currentSeed += 1;
    attempts++;
  } while (!isDerangement(array, shuffledAnswers) && attempts < 100);

  return shuffledAnswers;
};
