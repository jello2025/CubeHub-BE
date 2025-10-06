import { Schema, model } from "mongoose";

const AttemptSchema = new Schema(
  {
    duration: { type: String },
    user: { type: Schema.ObjectId, ref: "User" },
    scramble: { type: Schema.ObjectId, ref: "Scramble" },
  },
  {
    timestamps: true,
  }
);

const Attempt = model("Attempt", AttemptSchema);

export default Attempt;
