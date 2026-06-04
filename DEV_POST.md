---
title: I Built Solstice Cipher, a Light-and-Shadow Puzzle for the June Solstice Game Jam
published: false
tags: devchallenge, gamechallenge, gamedev, javascript
---

*This is a submission for the [June Solstice Game Jam](https://dev.to/challenges/june-solstice-game-jam-2026-06-03).*

![Solstice Cipher cover](https://raw.githubusercontent.com/kax168/solstice-cipher/main/assets/cover.png?v=1)

## What I Built

I built **Solstice Cipher**, a small browser puzzle game about balancing light and shadow during the solstice.

The game is played on a maze-like canvas. You move with `WASD` or arrow keys, collect four cipher sparks, keep the light meter inside a safe band, and then reach the gate before time runs out.

The theme connection is:

- **Solstice:** the central mechanic is balancing the longest day and the shortest night.
- **Light and darkness:** collecting light sparks pushes the meter upward, while shadow sparks pull it downward.
- **Alan Turing:** the gate only opens after collecting enough cipher sparks, a small mechanical nod to code breaking and computation.

The goal was to make something compact but actually playable, not just a themed mockup.

## Demo

Play it here:

https://kax168.github.io/solstice-cipher/

Code:

https://github.com/kax168/solstice-cipher

Controls:

```text
WASD / Arrow keys: move
Start / Restart: reset the run
Sound toggle: enable or disable small collection sounds
```

Win condition:

```text
Collect 4 cipher sparks + keep balance in the golden band + reach the gate
```

## How I Built It

I kept the stack intentionally small:

- HTML for the page shell
- CSS for the moody solstice visual style
- JavaScript modules for level data and game logic
- Canvas for rendering the maze, player, gate, sparks, and HUD
- A tiny Node test to validate level metadata and win-condition data

The level is stored as ASCII map data:

```js
export const LEVEL = [
  "########################",
  "#P..l....#.....s......G#",
  "#.####.#.#.###.###.#####",
  "...",
];
```

That made the game easy to tune because I could move walls, sparks, the player start, and the gate without touching rendering code.

The most interesting part is the balance meter. Movement nudges the meter, spark collection changes it more dramatically, and the timer drains faster when the player lets light or shadow drift too far. The gate only opens when the player has enough cipher sparks and the balance meter is stable.

## What I Learned

The hardest part was keeping the game small while still making it feel like a real game.

I originally wanted more mechanics, but the better choice was to make one mechanic legible:

> The solstice is a turning point, so the player should constantly feel pulled between two states.

That gave the game a clearer identity. It also made the theme visible through play instead of only through text.

## What's Next

If I keep going, I would add:

- a second level where the ideal light band moves over time
- a tiny story card about Alan Turing and code breaking
- a Pride palette challenge mode
- mobile touch controls
- a short gameplay GIF for the DEV post

For now, I am happy that it is a complete playable jam entry: a maze, a timer, a resource, collectibles, a win condition, and a theme that is part of the mechanics.

## AI Disclosure

I used AI assistance while designing and implementing this submission. Final game direction, code review, testing, and publishing decisions were made by me.
