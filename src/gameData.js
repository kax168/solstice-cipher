export const TILE = 40;

export const LEVEL = [
  "########################",
  "#P..l....#.....s......G#",
  "#.####.#.#.###.###.#####",
  "#....#.#...#.....#.....#",
  "####.#.#####.###.#####.#",
  "#....#.....#...#.....#.#",
  "#.########.###.#####.#.#",
  "#....s...#.....#...l.#.#",
  "#.######.#######.###.#.#",
  "#......#.....s...#...#.#",
  "#.####.#####.#####.###.#",
  "#l...#.....#.....#.....#",
  "########################",
];

export const levelMeta = {
  width: LEVEL[0].length,
  height: LEVEL.length,
  requiredCipher: 4,
  startBalance: 50,
  dangerLow: 24,
  dangerHigh: 76,
  idealLow: 38,
  idealHigh: 62,
  seconds: 90,
};

export function parseLevel(level = LEVEL) {
  const walls = [];
  const sparks = [];
  const lights = [];
  const shadows = [];
  let player = { x: 1, y: 1 };
  let gate = { x: 1, y: 1 };

  level.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "#") walls.push({ x, y });
      if (cell === "P") player = { x, y };
      if (cell === "G") gate = { x, y };
      if (cell === "l") lights.push({ x, y });
      if (cell === "s") shadows.push({ x, y });
      if (cell === "l" || cell === "s") sparks.push({ x, y, kind: cell === "l" ? "light" : "shadow" });
    });
  });

  return { walls, sparks, lights, shadows, player, gate };
}
