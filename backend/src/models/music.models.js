import mongoose from "mongoose";

const musicSchema = new mongoose.Schema(
  {
    artist_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Artist", // reference to Artist model
    },
    title: { type: String, required: true },
    album_name: { type: String },
    genre: { type: String },
  },
  { timestamps: true },
); // optional: tracks createdAt, updatedAt

export const Music = mongoose.model("Music", musicSchema);
