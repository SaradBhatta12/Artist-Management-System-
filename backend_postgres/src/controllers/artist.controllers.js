import db from "../config/db.js";
import bcrypt from "bcrypt";
const validateArtistData = (data) => {
  const { name, email, phone, dob, gender, password } = data;
  if (!name || !dob || !gender || !email || !phone || !password) {
    return "Name, DOB, gender, email, phone, and password are required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return "Invalid phone number format";
  }
  return null;
};

export const createArtistInternal = async (data) => {
  const validationError = validateArtistData(data);
  if (validationError) {
    const error = new Error(validationError);
    error.status = 400;
    throw error;
  }

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
  } = data;

  const first_name = name.split(" ")[0] || "";
  const last_name = name.split(" ").slice(1).join(" ") || "";

  const userExistsQuery = "SELECT * FROM users WHERE email = $1";
  const userExistsResult = await db.query(userExistsQuery, [email]);
  if (userExistsResult.rows.length > 0) {
    const error = new Error("User with this email already exists");
    error.status = 400;
    throw error;
  }

  const artistExist = await db.query(
    `SELECT * FROM artists WHERE name = $1 AND dob = $2`,
    [name, dob],
  );

  if (artistExist.rows.length) {
    const error = new Error("Artist with this name and DOB already exists");
    error.status = 400;
    throw error;
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
  console.log(userResult)

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

  return {
    success: true,
    artist: artistResult.rows[0],
    userId: userId,
  };
};

export const createArtist = async (req, res, next) => {
  try {
    const result = await createArtistInternal(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const multipleCreateArtist = async (req, res, next) => {
  try {
    const artists = req.body;

    if (!Array.isArray(artists)) {
      return res.status(400).json({ success: false, message: "Expected an array of artists" });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const artist of artists) {
      try {
        const result = await createArtistInternal(artist);
        console.log(result)
        results.success.push(result.artist);
      } catch (error) {
        results.failed.push({
          artist: artist.name || artist.email || "Unknown",
          message: error.message
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Processed ${artists.length} artists. ${results.success.length} succeeded, ${results.failed.length} failed.`,
      artists: results.success,
      errors: results.failed
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};


export const exportallArtestsToExcel = async (req, res, next) => {
  try {

    const allArtistsQuery = `
      SELECT artists.*, users.first_name, users.last_name, users.email, users.phone, users.role
      FROM artists
      INNER JOIN users ON artists.user_id = users.id
    `;
    const artists = await db.query(allArtistsQuery);
    return res.status(200).json({
      success: true,
      artists: artists.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
}

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
