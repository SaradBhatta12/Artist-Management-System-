import mongoose from "mongoose";

const musicSchema = new mongoose.Schema(
  {
    artist_id: {
      type: String,
      required: true,
      ref: "Artist", // reference to Artist model
    },
    title: { type: String, required: true },
    album_name: { type: String },
    genre: { type: String },
  },
  { timestamps: true },
); // optional: tracks createdAt, updatedAt

const Music = mongoose.model("Music", musicSchema);

module.exports = Music;
