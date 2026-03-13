import bcrypt from "bcrypt";
import generateToken from "../utils/jwt-set.js";
import db from "../config/db.js"
export const registerUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone, dob, gender, address } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please enter all required fields" });
    }

    const userExistsQuery = "SELECT * FROM users WHERE email = $1";
    const userExistsResult = await db.query(userExistsQuery, [email]);
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const query = "INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";

    const result = await db.query(query, [first_name, last_name, email, hashedPassword, phone, dob, gender, address]);
    const user = result.rows[0];

    if (user) {
      res
        .status(201).json({
          success: true,
          user: user,
        });
    } else {
      return res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

// admin able to create new user with any roles 
export const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, role, dob, gender, address } = req.body;

    if (!first_name || !last_name || !role || !email) {
      return res.status(400).json({ success: false, message: "Please enter all required fields" });
    }

    const userExistsQuery = "SELECT * FROM users WHERE email = $1";
    const userExistsResult = await db.query(userExistsQuery, [email]);
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const query = "INSERT INTO users (first_name, last_name, email, phone, role, dob, gender, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";

    const result = await db.query(query, [first_name, last_name, email, phone, role, dob, gender, address]);
    const user = result.rows[0];

    if (user) {
      res
        .status(201).json({
          success: true,
          user: user,
        });
    } else {
      return res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found. register first." });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id, user.role);

      const options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res
        .status(200)
        .cookie("token", token, options)
        .cookie("role", user.role || "user", options)
        .json({
          success: true,
          user: user,
          token: token,
        });
    } else {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.cookie("role", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const query = "SELECT id, first_name, last_name, email, phone, role, dob, gender, address, created_at, updated_at FROM users WHERE id = $1";
    const result = await db.query(query, [req.user.id]);
    const user = result.rows[0];

    if (user) {
      return res.status(200).json({
        success: true,
        user,
      });
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let usersQuery = "SELECT id, first_name, last_name, email, phone, role, dob, gender, address, created_at, updated_at FROM users";
    let countQuery = "SELECT COUNT(*) FROM users";
    let params = [];

    if (search) {
      const searchPattern = `%${search}%`;
      usersQuery += " WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1";
      countQuery += " WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1";
      params.push(searchPattern);
    }

    usersQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const usersResult = await db.query(usersQuery, [...params, limit, offset]);
    const countResult = await db.query(countQuery, params);

    const users = usersResult.rows;
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    return res.json({
      success: true,
      users,
      total: totalPages,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, role, dob, gender, address } = req.body;
    
    // Check if user exists
    const checkQuery = "SELECT * FROM users WHERE id = $1";
    const checkResult = await db.query(checkQuery, [req.params.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, role = $5, dob = $6, gender = $7, address = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING id, first_name, last_name, email, phone, role, dob, gender, address, created_at, updated_at
    `;
    const result = await db.query(updateQuery, [
      first_name || checkResult.rows[0].first_name,
      last_name || checkResult.rows[0].last_name,
      email || checkResult.rows[0].email,
      phone || checkResult.rows[0].phone,
      role || checkResult.rows[0].role,
      dob || checkResult.rows[0].dob,
      gender || checkResult.rows[0].gender,
      address || checkResult.rows[0].address,
      req.params.id
    ]);

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const checkQuery = "SELECT * FROM users WHERE id = $1";
    const checkResult = await db.query(checkQuery, [req.params.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const deleteQuery = "DELETE FROM users WHERE id = $1";
    await db.query(deleteQuery, [req.params.id]);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

