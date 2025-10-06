import { NextFunction, Request, Response } from "express";
import Scramble from "../../models/Scramble";
import User from "../../models/User";
import Attempt from "../../models/Attempt";

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

// Controller: Get today's scramble
export const getDailyScramble = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const utcToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    let scrambleDoc = await Scramble.findOne({ date: utcToday });

    if (!scrambleDoc) {
      const newScramble = generateScramble();
      scrambleDoc = await Scramble.create({
        scramble: newScramble,
        date: utcToday,
      });
    }

    res.json(scrambleDoc.scramble);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error generating scramble" });
  }
};

// Controller: Submit a user's solve
export const submitSolve = async (req: Request, res: Response) => {
  try {
    const { userId, scrambleId, time } = req.body;

    if (!userId || !scrambleId || time === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    const scramble = await Scramble.findById(scrambleId);

    if (!user || !scramble) {
      return res.status(404).json({ message: "User or scramble not found" });
    }

    // Check if user already solved this scramble today
    const alreadySolved = user.scrambles.some(
      (s) => s.toString() === scramble._id.toString()
    );

    if (alreadySolved) {
      return res
        .status(400)
        .json({ message: "You already have a record for today's scramble" });
    }

    // Save the scramble to the user
    user.scrambles.push(scramble._id);
    await user.save();

    // Optionally, you can create a field to store the time for ranking
    // e.g., in the future you might extend Scramble schema to include solves per user

    res.status(200).json({ message: "Solve submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error submitting solve" });
  }
};

export const getAllAttempts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const attempts = await Attempt.find();
    return res.json(attempts);
  } catch (err) {
    next(err);
  }
};

export const createAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // find daily scamble

    const today = new Date();
    const utcToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    //we have to check wether the user submitted or not:
    // attempt mpodel

    const attempt = await Attempt.findOne({
      createdAt: utcToday,
      user: req.user,
    });

    if (attempt) {
      return res.status(400).json({
        message: "u already attempted a solve today",
      });
    }

    let scrambleDoc = await Scramble.findOne({ date: utcToday });

    if (!scrambleDoc) {
      return res.status(400).json({
        message: "scramble doesnt exist",
      });
    }

    // update req body to have req.body.user assigned with req.user
    req.body.user = req.user;
    // add req.body.scramble with todays scramble
    req.body.scamble = scrambleDoc;
    const newAttempt = await Attempt.create(req.body);
    return res.status(204).json(newAttempt);
  } catch (err) {
    next(err);
  }
};
