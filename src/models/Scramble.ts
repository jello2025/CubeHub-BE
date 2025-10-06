import { Schema, model } from "mongoose";

const ScrambleSchema = new Schema({
  scramble: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: Number },
  attempt: [{ type: Schema.ObjectId, ref: "Attempt" }],
});

const Scramble = model("Scramble", ScrambleSchema);

export default Scramble;
