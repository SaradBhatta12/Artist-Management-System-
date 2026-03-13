import db from "../config/db.js";
const baseArtistFindQuery = `SELECT * FROM artists WHERE id = $1`;
export const createArtist = async (req, res, next) => {
  try {
    const {
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
    } = req.body;
    if (!name || !dob || !gender) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, DOB, and gender are required",
        });
    }
    const artistExist = await db.query(
      `SELECT * FROM artists WHERE name = $1 AND dob = $2`,
      [name, dob],
    );

    if (artistExist.rows.length) {
      return res
        .status(400)
        .json({ success: false, message: "Artist already exists" });
    }
    const artistCreatequery = `INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const artist = await db.query(artistCreatequery, [
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
    ]);
    return res.status(201).json({
      success: true,
      artist: artist.rows[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const getAllArtists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const allArtistsQuery = `SELECT * FROM artists WHERE name LIKE $1 LIMIT $2 OFFSET $3`;
    const totalArtistsQuery = `SELECT COUNT(*) FROM artists WHERE name LIKE $1`;

    const artists = await db.query(allArtistsQuery, [
      `%${search}%`,
      limit,
      (page - 1) * limit,
    ]);

    const totalArtists = await db.query(totalArtistsQuery, [`%${search}%`]);
    const totalPages = Math.ceil(parseInt(totalArtists.rows[0].count) / limit);

    return res.status(200).json({
      success: true,
      artists: artists.rows,
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

export const getArtistById = async (req, res, next) => {
  try {
    const artist = await db.query(baseArtistFindQuery, [req.params.id]);
    if (!artist?.rows?.length) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    return res.status(200).json({
      success: true,
      artist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const updateArtist = async (req, res, next) => {
  try {
    const artist = await db.query(baseArtistFindQuery, [req.params.id]);
    if (!artist) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }
    const updateQuery = `UPDATE artists SET name = $1, dob = $2, gender = $3, address = $4, first_release_year = $5, no_of_albums_released = $6 WHERE id = $7 RETURNING *`;
    const updatedArtist = await db.query(updateQuery, [
      req.body.name,
      req.body.dob,
      req.body.gender,
      req.body.address,
      req.body.first_release_year,
      req.body.no_of_albums_released,
      req.params.id,
    ]);

    return res.status(200).json({
      success: true,
      artist: updatedArtist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const deleteArtist = async (req, res, next) => {
  try {
    const artist = await db.query(baseArtistFindQuery, [req.params.id]);
    if (!artist?.rows?.length) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }
    const deleteQuery = `DELETE FROM artists WHERE id = $1`;
    await db.query(deleteQuery, [req.params.id]);

    return res.status(200).json({
      success: true,
      message: "Artist deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};
