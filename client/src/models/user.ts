import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique:true },
    name: { type: String, required: true },
    image: {type: String, required: false, default: ""},
    _id: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
