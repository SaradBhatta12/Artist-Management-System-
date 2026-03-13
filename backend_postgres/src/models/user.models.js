import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ["artist_manager", "super_admin", "user"],
      default: "user",
    },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
  },
  { timestamps: true },
); // tracks createdAt, updatedAt

export const User = mongoose.model("User", userSchema);
