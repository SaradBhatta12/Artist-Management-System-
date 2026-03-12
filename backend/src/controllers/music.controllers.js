import mongoose from "mongoose";
import { Music } from "../models/music.models.js";
import { Artist } from "../models/artist.models.js";

export const createMusic = async (req, res, next) => {
  try {
    const { artist_id, title, album_name, genre } = req.body;

    if (!artist_id || !title) {
      return res.status(400).json({ success: false, message: "Artist ID and Title are required" });
    }

    const artist = await Artist.findById(artist_id);
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }
    //every time when you create music it automatically increase the number of albums released
    artist.no_of_albums_released += 1;
    await artist.save();


    const music = await Music.create({
      artist_id: new mongoose.Types.ObjectId(artist_id),
      title,
      album_name,
      genre,
    });

    return res.status(201).json({
      success: true,
      music,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const getAllMusics = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { album_name: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } },
      ],
    };

    // const musics = await Music.find(query)
    //   .populate("artist_id", "name")
    //   .limit(limit)
    //   .skip((page - 1) * limit);

    // using aggregations 
    const musics = await Music.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "artists",
          localField: "artist_id",
          foreignField: "_id",
          as: "artist",
        },
      },
      {
        $unwind: "$artist",
      },
      {
        $project: {
          _id: 1,
          title: 1,
          album_name: 1,
          genre: 1,
          artist_id: 1,
          artist: 1,
        },
      },
      {
        $limit: limit,
      },
      {
        $skip: (page - 1) * limit,
      },
    ]);

    const totalMusics = await Music.countDocuments(query);
    const totalPages = Math.ceil(totalMusics / limit);

    return res.status(200).json({
      success: true,
      musics: musics[0],
      total: totalPages,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const getMusicById = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id).populate("artist_id", "name");
    if (!music) {
      return res.status(404).json({ success: false, message: "Music not found" });
    }

    return res.status(200).json({
      success: true,
      music,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const updateMusic = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json({ success: false, message: "Music not found" });
    }

    const updatedMusic = await Music.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      music: updatedMusic,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};


export const deleteMusic = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json({ success: false, message: "Music not found" });
    }

    await Music.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Music deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};
