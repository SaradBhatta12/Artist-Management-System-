import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
  },
  { timestamps: true },
); // tracks createdAt, updatedAt

const User = mongoose.model("User", userSchema);

module.exports = User;
