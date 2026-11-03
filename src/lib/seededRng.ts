/**
 * Seeded Pseudo-Random Number Generator with sub-seed isolation
 * Implements MurmurHash3 + Mulberry32 for deterministic cross-session consistency.
 * Conforms to spec v2.2 (§05.3):
 * "Mỗi lần lấy ngẫu nhiên dùng PRNG khởi tạo từ hash(seed, gameIndex, phase, eventSlot),
 * không dùng một luồng random chung tiêu thụ tuần tự."
 */

export function murmurHash3(str: string, seed: number = 0): number {
  let h1 = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  for (let i = 0; i < str.length; i++) {
    let k1 = str.charCodeAt(i);
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
  }

  h1 ^= str.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

export function computeSubSeed(
  masterSeed: number,
  gameIndex: number,
  phase: string,
  eventSlot: number
): number {
  const token = `${masterSeed}_g${gameIndex}_p${phase}_s${eventSlot}`;
  return murmurHash3(token, masterSeed);
}

export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /**
   * Mulberry32 algorithm
   */
  next(): number {
    let z = (this.state += 0x6d2b79f5);
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(items: T[]): T {
    if (items.length === 0) throw new Error('Cannot choose from empty array');
    const index = Math.floor(this.next() * items.length);
    return items[index];
  }

  weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length === 0 || items.length !== weights.length) {
      throw new Error('Items and weights mismatch');
    }
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomVal = this.next() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      if (randomVal < weights[i]) {
        return items[i];
      }
      randomVal -= weights[i];
    }
    return items[items.length - 1];
  }
}

/**
 * Creates an isolated generator for a specific phase event slot
 */
export function getPhaseRng(
  masterSeed: number,
  gameIndex: number,
  phase: string,
  eventSlot: number
): SeededRng {
  const subSeed = computeSubSeed(masterSeed, gameIndex, phase, eventSlot);
  return new SeededRng(subSeed);
}
