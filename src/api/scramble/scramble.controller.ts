import { Request, Response } from "express";
import Scramble from "../../models/Scramble";

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

function generateScramble() {
  const scramble: string[] = [];
  let lastFace = "";

  for (let i = 0; i < 20; i++) {
    const face = getRandomFace(lastFace);
    const modifier = getRandomModifier();
    scramble.push(face + modifier);
    lastFace = face;
  }

  return scramble.join(" ");
}

// Controller
export const getDailyScramble = async (req: Request, res: Response) => {
  try {
    // Get today's date in UTC at 00:00:00
    const today = new Date();
    const utcToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    // Check if a scramble for today exists
    let scrambleDoc = await Scramble.findOne({ date: utcToday });

    if (!scrambleDoc) {
      // If not, generate a new scramble and save it
      const newScramble = generateScramble();
      scrambleDoc = await Scramble.create({
        scramble: newScramble,
        date: utcToday,
      });
    }

    // Return the scramble
    res.json(scrambleDoc.scramble);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error generating scramble" });
  }
};
