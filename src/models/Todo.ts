import { Schema, model, models } from "mongoose";

const TodoSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String },
  user: { type: Schema.ObjectId, ref: "User" },
});

const Todo = model("Todo", TodoSchema);

export default Todo;
