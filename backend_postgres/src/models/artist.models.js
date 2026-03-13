import mongoose from "mongoose";
const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  address: { type: String },
  first_release_year: { type: Number },
  no_of_albums_released: { type: Number, default: 0 },
});

export const Artist = mongoose.model("Artist", artistSchema);
