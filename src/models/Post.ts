import { Schema, model } from "mongoose";

const PostSchema = new Schema({
  image: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Post = model("Post", PostSchema);
export default Post;
