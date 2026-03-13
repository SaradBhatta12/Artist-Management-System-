import db from "../config/db.js";
import bcrypt from "bcrypt";
export const createArtist = async (req, res, data) => {
  try {
    const {
      name,
      email,
      phone,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
      password,
    } = req.body;

    if (!name || !dob || !gender || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, DOB, and gender are required",
      });
    }
    const first_name = name.split(" ")[0] || "";
    const last_name = name.split(" ")[1] || "";
    const userExistsQuery = "SELECT * FROM users WHERE email = $1";
    const userExistsResult = await db.query(userExistsQuery, [email]);
    if (userExistsResult.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userCreateQuery =
      "INSERT INTO users (first_name, last_name, email, password, phone, dob, role, gender, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id";

    const userResult = await db.query(userCreateQuery, [
      first_name,
      last_name,
      email,
      hashedPassword,
      phone,
      dob,
      "artist",
      gender,
      address,
    ]);

    const userId = userResult.rows[0].id;

    const artistCreateQuery = `INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const artistResult = await db.query(artistCreateQuery, [
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
      userId,
    ]);

    return res.status(201).json({
      success: true,
      artist: artistResult.rows[0],
      userId: userId,
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

    const allArtistsQuery = `
      SELECT artists.*, users.first_name, users.last_name, users.email, users.phone, users.role
      FROM artists
      INNER JOIN users ON artists.user_id = users.id
      WHERE artists.name ILIKE $1
      LIMIT $2 OFFSET $3
    `;
    const totalArtistsQuery = `SELECT COUNT(*) FROM artists WHERE name ILIKE $1`;

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
    const query = `
      SELECT artists.*, users.first_name, users.last_name, users.email, users.phone, users.role
      FROM artists
      INNER JOIN users ON artists.user_id = users.id
      WHERE artists.id = $1
    `;
    const result = await db.query(query, [req.params.id]);
    if (!result?.rows?.length) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    return res.status(200).json({
      success: true,
      artist: result.rows[0],
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
    const artistId = req.params.id;
    const {
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
      phone,
      email,
    } = req.body;

    // Get current artist to find user_id
    const currentArtistResult = await db.query(
      "SELECT user_id FROM artists WHERE id = $1",
      [artistId],
    );
    if (!currentArtistResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    const userId = currentArtistResult.rows[0].user_id;

    // Update artists table
    const updateArtistQuery = `
      UPDATE artists 
      SET name = $1, dob = $2, gender = $3, address = $4, first_release_year = $5, no_of_albums_released = $6, updated_at = NOW()
      WHERE id = $7 
      RETURNING *
    `;
    const updatedArtistResult = await db.query(updateArtistQuery, [
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
      artistId,
    ]);

    // Update users table
    if (userId) {
      const updateUserQuery = `
        UPDATE users 
        SET first_name = $1, last_name = $2, email = $3, phone = $4, dob = $5, gender = $6, address = $7, updated_at = NOW()
        WHERE id = $8
      `;
      const first_name = name ? name.split(" ")[0] : "";
      const last_name = name ? name.split(" ").slice(1).join(" ") : "";

      await db.query(updateUserQuery, [
        first_name,
        last_name,
        email,
        phone,
        dob,
        gender,
        address,
        userId,
      ]);
    }

    return res.status(200).json({
      success: true,
      artist: updatedArtistResult.rows[0],
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
    const artistId = req.params.id;

    // Get the user_id for this artist
    const artistResult = await db.query(
      "SELECT user_id FROM artists WHERE id = $1",
      [artistId],
    );

    if (!artistResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    const userId = artistResult.rows[0].user_id;

    // Delete the user (cascades to artists)
    if (userId) {
      await db.query("DELETE FROM users WHERE id = $1", [userId]);
    } else {
      // If for some reason there's no user_id, delete artist directly
      await db.query("DELETE FROM artists WHERE id = $1", [artistId]);
    }

    return res.status(200).json({
      success: true,
      message: "Artist and associated user deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};
