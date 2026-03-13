import mongoose from "mongoose";
import db from "../config/db.js";
const commonQuery = `SELECT * FROM artists WHERE id = $1`;
const musicQuery = `SELECT * FROM musics WHERE id = $1`;

export const createMusic = async (req, res, next) => {
  try {
    const { artist_id, title, album_name, genre } = req.body;

    if (!artist_id || !title) {
      return res
        .status(400)
        .json({ success: false, message: "Artist ID and Title are required" });
    }

    const artistExists = await db.query(commonQuery, [artist_id]);

    if (!artistExists) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }
    //every time when you create music it automatically increase the number of albums released
    const updateMusicQuery = `UPDATE artists SET no_of_albums_released = no_of_albums_released + 1 WHERE id = $1 RETURNING *`;
    await db.query(updateMusicQuery, [artist_id]);
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
    const { id } = req.params;
    const music = await db.query(musicQuery, [id]);
    if (!music.rows.length) {
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
    const music = await db.query(musicQuery, [req.params.id]);
    if (!music.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Music not found" });
    }

    const updateQuery = `UPDATE musics SET title = $1, album_name = $2, genre = $3 WHERE id = $4 RETURNING *`;
    const updatedMusic = await db.query(updateQuery, [
      req.body.title,
      req.body.album_name,
      req.body.genre,
      req.params.id,
    ]);

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
    const { id } = req.params;
    const music = await db.query(musicQuery, [id]);
    if (!music.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Music not found" });
    }

    const deleteQuery = `DELETE FROM musics WHERE id = $1`;
    await db.query(deleteQuery, [id]);
    const artist = await db.query(commonQuery, [id]);
    const updateQuery = `UPDATE artists SET no_of_albums_released = $1 WHERE id = $2`;
    await db.query(updateQuery, [
      artist.rows[0].no_of_albums_released - 1,
      artist.rows[0].id,
    ]);

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
