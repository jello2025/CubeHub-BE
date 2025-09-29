import { Schema, model } from "mongoose";

const StatsSchema = new Schema({
  ao5: { type: Number, required: true },
  ao12: { type: Number, required: true },
  single: { type: Number, required: true },
});
