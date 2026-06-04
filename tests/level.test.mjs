import assert from "node:assert/strict";
import { LEVEL, levelMeta, parseLevel } from "../src/gameData.js";

const parsed = parseLevel();

assert.equal(LEVEL.length, levelMeta.height, "level height should match metadata");
assert.equal(LEVEL[0].length, levelMeta.width, "level width should match metadata");
assert.ok(parsed.player, "level should include a player start");
assert.ok(parsed.gate, "level should include a gate");
assert.ok(parsed.sparks.length >= levelMeta.requiredCipher, "level should include enough cipher sparks");
assert.ok(parsed.walls.length > 0, "level should include walls");

console.log("Level data OK");
