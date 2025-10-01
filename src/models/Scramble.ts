import { Schema, model } from "mongoose";

const ScrambleSchema = new Schema({
  scramble: { type: String },
  date: { type: Date },
});

const Scramble = model("Scramble", ScrambleSchema);

export default Scramble;
