export type Point = [number, number];
export type Curve = [Point, Point, Point, Point];
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => {
  const t = clamp(n);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const canopyStems: { curve: Curve; width: number; tip: number; material: string }[] = [
  {
    curve: [
      [812, 620],
      [815, 470],
      [1000, 260],
      [1005, 18],
    ],
    width: 76,
    tip: 5,
    material: 'forest',
  },
  {
    curve: [
      [845, 620],
      [775, 460],
      [1055, 255],
      [995, 20],
    ],
    width: 70,
    tip: 5,
    material: 'ivory',
  },
  {
    curve: [
      [825, 620],
      [945, 470],
      [865, 235],
      [1002, 22],
    ],
    width: 60,
    tip: 4,
    material: 'forest',
  },
];

export const canopyNodes: {
  id: string;
  curve: Curve;
  width: number;
  spriteWidth: number;
  label: Point;
}[] = [
  {
    id: 'foundation',
    curve: [
      [830, 640],
      [825, 635],
      [825, 632],
      [825, 630],
    ],
    width: 70,
    spriteWidth: 250,
    label: [988, 548],
  },
  {
    id: 'spare-parts',
    curve: [
      [850, 555],
      [955, 475],
      [1090, 525],
      [1195, 475],
    ],
    width: 44,
    spriteWidth: 215,
    label: [1305, 387],
  },
  {
    id: 'compressors',
    curve: [
      [865, 510],
      [775, 470],
      [690, 515],
      [635, 483],
    ],
    width: 42,
    spriteWidth: 190,
    label: [410, 384],
  },
  {
    id: 'bulkers-lpg',
    curve: [
      [900, 400],
      [790, 285],
      [735, 370],
      [645, 332],
    ],
    width: 43,
    spriteWidth: 260,
    label: [470, 119],
  },
  {
    id: 'exports',
    curve: [
      [960, 240],
      [935, 174],
      [865, 205],
      [805, 186],
    ],
    width: 35,
    spriteWidth: 170,
    label: [590, 79],
  },
  {
    id: 'mixers',
    curve: [
      [935, 340],
      [1045, 280],
      [1150, 354],
      [1270, 335],
    ],
    width: 43,
    spriteWidth: 245,
    label: [1390, 210],
  },
  {
    id: 'silos',
    curve: [
      [984, 140],
      [1070, 100],
      [1145, 166],
      [1230, 163],
    ],
    width: 34,
    spriteWidth: 200,
    label: [1340, 49],
  },
];

export function pointAt(curve: Curve, t: number): Point {
  const s = 1 - t;
  return [
    s * s * s * curve[0][0] +
      3 * s * s * t * curve[1][0] +
      3 * s * t * t * curve[2][0] +
      t * t * t * curve[3][0],
    s * s * s * curve[0][1] +
      3 * s * s * t * curve[1][1] +
      3 * s * t * t * curve[2][1] +
      t * t * t * curve[3][1],
  ];
}

/** Uniform travel along a curve prevents abrupt growth-speed changes through tight bends. */
export function arcSampler(curve: Curve) {
  const lengths = [0];
  let total = 0;
  let previous = pointAt(curve, 0);
  for (let i = 1; i <= 80; i++) {
    const p = pointAt(curve, i / 80);
    total += Math.hypot(p[0] - previous[0], p[1] - previous[1]);
    lengths.push(total);
    previous = p;
  }
  return (fraction: number): Point => {
    const target = clamp(fraction) * total;
    let lo = 0,
      hi = 80;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid] < target) lo = mid;
      else hi = mid;
    }
    const span = lengths[hi] - lengths[lo];
    const t = (lo + (span ? (target - lengths[lo]) / span : 0)) / 80;
    return pointAt(curve, clamp(t));
  };
}

/** Actual tapered ribbon geometry, grown along the curve; no bitmap reveal mask. */
export function ribbonAt(curve: Curve, growth: number, width: number, tip = 12) {
  const end = clamp(growth);
  if (end < 0.001) return { surface: 'M0 0', fold: 'M0 0', edge: 'M0 0' };
  const left: Point[] = [],
    right: Point[] = [],
    middle: Point[] = [];
  const steps = Math.max(3, Math.ceil(30 * end));
  const sample = arcSampler(curve);
  for (let i = 0; i <= steps; i++) {
    const t = (end * i) / steps,
      p = sample(t);
    const before = sample(Math.max(0, t - 0.001)),
      after = sample(Math.min(1, t + 0.001));
    const dx = after[0] - before[0],
      dy = after[1] - before[1],
      length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length,
      ny = dx / length;
    const w = (tip + (width - tip) * (1 - t) ** 0.75) / 2;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
    middle.push([p[0] + nx * w * 0.28, p[1] + ny * w * 0.28]);
  }
  const line = (points: Point[]) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  return {
    surface: line([...left, ...right.slice().reverse()]) + ' Z',
    fold: line([...left, ...middle.slice().reverse()]) + ' Z',
    edge: line(middle),
  };
}

export function bendCurve(curve: Curve, amount: number): Curve {
  return curve.map((p, i) => [
    p[0] + amount * 0.25 * (i / 3),
    p[1] + amount * (i / 3) ** 2,
  ]) as Curve;
}
