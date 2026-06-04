import assert from "node:assert/strict";
import { LEVEL, TILE, levelMeta, parseLevel } from "../src/gameData.js";

const parsed = parseLevel();

assert.equal(LEVEL.length, levelMeta.height, "level height should match metadata");
assert.equal(LEVEL[0].length, levelMeta.width, "level width should match metadata");
assert.ok(parsed.player, "level should include a player start");
assert.ok(parsed.gate, "level should include a gate");
assert.ok(parsed.sparks.length >= levelMeta.requiredCipher, "level should include enough cipher sparks");
assert.ok(parsed.walls.length > 0, "level should include walls");

function findRoute(start, goal) {
  const queue = [start];
  const previous = new Map([[`${start.x},${start.y}`, null]]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current.x === goal.x && current.y === goal.y) break;

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = { x: current.x + dx, y: current.y + dy };
      const key = `${next.x},${next.y}`;
      const blocked =
        next.y < 0 ||
        next.y >= LEVEL.length ||
        next.x < 0 ||
        next.x >= LEVEL[0].length ||
        LEVEL[next.y][next.x] === "#";

      if (blocked || previous.has(key)) continue;
      previous.set(key, `${current.x},${current.y}`);
      queue.push(next);
    }
  }

  const goalKey = `${goal.x},${goal.y}`;
  if (!previous.has(goalKey)) return null;

  const route = [];
  for (let key = goalKey; previous.get(key); key = previous.get(key)) {
    route.push(key);
  }
  return route.reverse();
}

const reachableSparks = parsed.sparks.filter((spark) => findRoute(parsed.player, spark));
assert.ok(findRoute(parsed.player, parsed.gate), "gate should be reachable from player start");
assert.ok(
  reachableSparks.length >= levelMeta.requiredCipher,
  "enough cipher sparks should be reachable from player start",
);

const balancedSparkSet = parsed.sparks
  .filter((spark) => spark.kind === "light")
  .slice(0, 2)
  .concat(parsed.sparks.filter((spark) => spark.kind === "shadow").slice(0, 2));
const routeLength = balancedSparkSet.reduce((total, spark, index) => {
  const start = index === 0 ? parsed.player : balancedSparkSet[index - 1];
  return total + findRoute(start, spark).length;
}, 0);
const finalRouteLength = routeLength + findRoute(balancedSparkSet.at(-1), parsed.gate).length;
const estimatedSeconds = (finalRouteLength * TILE) / 150;

assert.equal(balancedSparkSet.length, levelMeta.requiredCipher, "test route should collect required sparks");
assert.ok(estimatedSeconds < levelMeta.seconds, "a balanced winning route should fit within the timer");

console.log("Level data OK");
