import mongoose from "mongoose";
import { Music } from "../models/music.models.js";
import { Artist } from "../models/artist.models.js";
import db from "../config/db.js";

export const createMusic = async (req, res, next) => {
  try {
    const { artist_id, title, album_name, genre } = req.body;

    if (!artist_id || !title) {
      return res
        .status(400)
        .json({ success: false, message: "Artist ID and Title are required" });
    }

    const query = `SELECT * FROM artists WHERE id = $1`;
    const artistExists = await db.query(query, [artist_id]);

    if (!artistExists) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }
    //every time when you create music it automatically increase the number of albums released
    artistExists.no_of_albums_released += 1;
    await artistExists.save();

    const musicQuery = `INSERT INTO musics (artist_id, title, album_name, genre) VALUES ($1, $2, $3, $4) RETURNING *`;
    const music = await db.query(musicQuery, [
      artist_id,
      title,
      album_name,
      genre,
    ]);

    return res.status(201).json({
      success: true,
      music,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const getAllMusics = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { id } = req.query;
    const allmusicsQuery = `SELECT * FROM musics WHERE artist_id = $1 LIMIT $2 OFFSET $3`;
    const totalMusicsQuery = `SELECT COUNT(*) FROM musics WHERE artist_id = $1`;

    const musics = await db.query(allmusicsQuery, [
      id,
      limit,
      (page - 1) * limit,
    ]);

    const totalMusics = await db.query(totalMusicsQuery, [id]);
    const totalPages = Math.ceil(parseInt(totalMusics.rows[0].count) / limit);

    return res.status(200).json({
      success: true,
      musics,
      total: totalPages,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const getMusicById = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id).populate(
      "artist_id",
      "name",
    );
    if (!music) {
      return res
        .status(404)
        .json({ success: false, message: "Music not found" });
    }

    return res.status(200).json({
      success: true,
      music,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const updateMusic = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res
        .status(404)
        .json({ success: false, message: "Music not found" });
    }

    const updatedMusic = await Music.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      music: updatedMusic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const deleteMusic = async (req, res, next) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res
        .status(404)
        .json({ success: false, message: "Music not found" });
    }

    await Music.findByIdAndDelete(req.params.id);
    const artist = await Artist.findById(music.artist_id);
    artist.no_of_albums_released -= 1;
    await artist.save();

    return res.status(200).json({
      success: true,
      message: "Music deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};
