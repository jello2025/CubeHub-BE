import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  passwaord: { type: String, required: true, min: 8 },
  image: { type: String },
});

const User = model("User", UserSchema);

export default User;
