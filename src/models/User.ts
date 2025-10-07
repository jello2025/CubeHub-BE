import { Schema, model } from "mongoose";
import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";
const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  passwaord: { type: String, required: true, min: 8 },
  image: { type: String },
  ao5: { type: Number },
  ao12: { type: Number },
  single: { type: Number },
  scrambles: [{ type: Schema.ObjectId, ref: "Scramble" }],
  attempts: [{ type: Schema.ObjectId, ref: "Attempt" }],
});

export type UserAttrs = InferSchemaType<typeof UserSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;

const User = model("User", UserSchema);

export default User;
