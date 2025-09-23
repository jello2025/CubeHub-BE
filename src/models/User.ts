import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true },
  passwaord: { type: String, required: true },
  todos: [{ type: Schema.ObjectId, res: "todo" }],
});

const User = model("User", UserSchema);

export default User;
