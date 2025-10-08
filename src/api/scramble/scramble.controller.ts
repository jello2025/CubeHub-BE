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

    // check if user already submitted
    let alreadySubmitted = false;
    let userAttempt: any = null;
    if (req.user) {
      const attempt = await Attempt.findOne({
        user: req.user,
        scramble: scrambleDoc._id,
      });
      if (attempt) {
        alreadySubmitted = true;
        userAttempt = attempt;
      }
    }

    res.json({
      _id: scrambleDoc._id,
      scramble: scrambleDoc.scramble,
      alreadySubmitted,
      userAttempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error generating scramble" });
  }
};

// Controller: Submit a user's solve
export const submitSolve = async (req: Request, res: Response) => {
  try {
    const { scrambleId, duration } = req.body;

    if (!req.user || !scrambleId || duration === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(req.user);
    const scramble = await Scramble.findById(scrambleId);

    if (!user || !scramble) {
      return res.status(404).json({ message: "User or scramble not found" });
    }

    const alreadySubmitted = await Attempt.findOne({
      user: req.user,
      scramble: scramble._id,
    });

    if (alreadySubmitted) {
      return res
        .status(400)
        .json({ message: "You already submitted a solve for this scramble" });
    }

    const newAttempt = await Attempt.create({
      user: req.user,
      scramble: scramble._id,
      duration,
    });

    // Add attempt to user & scramble
    user.attempts.push(newAttempt._id);
    user.scrambles.push(scramble._id);

    // ✅ STREAK LOGIC
    const today = new Date();
    const lastDate = user.lastSubmissionDate
      ? new Date(user.lastSubmissionDate)
      : null;

    if (lastDate) {
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // consecutive day
        user.streak = (user.streak || 0) + 1;
      } else if (diffDays > 1) {
        // missed a day
        user.streak = 1;
      } // diffDays === 0 → same day, no change
    } else {
      // first submission ever
      user.streak = 1;
    }

    user.lastSubmissionDate = today;
    await user.save();

    scramble.attempt.push(newAttempt._id);
    await scramble.save();

    res.status(201).json({
      message: "Solve submitted",
      attempt: newAttempt,
      streak: user.streak, // send back updated streak
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error submitting solve" });
  }
};

// Get all attempts
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

// Create attempt (legacy)
export const createAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.body.duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const today = new Date();
    const utcToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const existingAttempt = await Attempt.findOne({
      user: req.user,
      createdAt: {
        $gte: utcToday,
        $lt: new Date(utcToday.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttempt) {
      return res
        .status(400)
        .json({ message: "You already submitted a solve today" });
    }

    let scrambleDoc = await Scramble.findOne({ date: utcToday });
    if (!scrambleDoc) {
      scrambleDoc = await Scramble.create({
        scramble: generateScramble(),
        date: utcToday,
      });
    }

    const newAttempt = await Attempt.create({
      user: req.user,
      scramble: scrambleDoc._id,
      duration: +req.body.duration,
    });

    await User.findByIdAndUpdate(req.user, {
      $push: { attempts: newAttempt._id, scrambles: scrambleDoc._id },
    });

    scrambleDoc.attempt.push(newAttempt._id);
    await scrambleDoc.save();

    return res
      .status(201)
      .json({ message: "Attempt submitted", attempt: newAttempt });
  } catch (err) {
    next(err);
  }
};

// Leaderboard controller: only gets users who submitted today, sorted fastest → slowest
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // Today's date (UTC)
    const today = new Date();
    const utcToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    // Get today's scramble
    const scramble = await Scramble.findOne({ date: utcToday });
    if (!scramble)
      return res.status(404).json({ message: "No scramble for today" });

    // Get all attempts for today's scramble and sort by duration
    const attempts = await Attempt.find({ scramble: scramble._id }).sort({
      duration: 1,
    });

    // Map to leaderboard: only user ID and time
    const leaderboard = attempts.map((attempt) => ({
      user: attempt.user, // just the ObjectId of the user
      time: attempt.duration,
    }));

    return res.json({ scrambleId: scramble._id, leaderboard });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error fetching leaderboard" });
  }
};

export const getUserScrambleHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId; // from :userId in route

    // Get all scrambles
    const scrambles = await Scramble.find().sort({ date: -1 }); // latest first
    const history = [];

    for (const scramble of scrambles) {
      // get all attempts for this scramble sorted by duration
      const attempts = await Attempt.find({ scramble: scramble._id }).sort({
        duration: 1,
      });

      // find user's attempt
      const userAttempt = attempts.find((a) => a.user?.toString() === userId);
      if (!userAttempt) continue; // skip if user didn't attempt this scramble

      // calculate ranking
      const rank = attempts.findIndex((a) => a.user?.toString() === userId) + 1;

      history.push({
        scrambleId: scramble._id,
        date: scramble.date,
        time: userAttempt.duration,
        rank,
      });
    }

    return res.json({ history });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error fetching scramble history" });
  }
};

export const deleteAttempt = async (req: Request, res: Response) => {
  try {
    const attemptId = req.params.attemptId;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    await Attempt.findByIdAndDelete(attemptId);

    return res.json({ message: "Attempt deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error deleting attempt" });
  }
};
