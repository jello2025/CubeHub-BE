// controllers/scrambleController.ts
import { Request, Response } from "express";

const faces = ["U", "D", "L", "R", "F", "B"];
const modifiers = ["'", "2"];

function getRandomFace(exclude?: string) {
  let face;
  do {
    face = faces[Math.floor(Math.random() * faces.length)];
  } while (face === exclude);
  return face;
}

function getRandomModifier() {
  return modifiers[Math.floor(Math.random() * modifiers.length)];
}

export const getScramble = (req: Request, res: Response) => {
  const scramble: string[] = [];
  let lastFace = "";

  for (let i = 0; i < 20; i++) {
    const face = getRandomFace(lastFace);
    const modifier = getRandomModifier();
    scramble.push(face + modifier);
    lastFace = face;
  }

  res.json(scramble.join(" "));
};
