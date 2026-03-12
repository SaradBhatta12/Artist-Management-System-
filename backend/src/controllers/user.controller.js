import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwt-set.js";
export const registerUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone, dob, gender, address } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please enter all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone,
      dob,
      gender,
      address,
    });

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

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }



    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      address,
    });

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found. register first." });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

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
    const user = await User.findById(req.user._id).select("-password");

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

// Keeping existing getAllUsers for compatibility if needed
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      $or: [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    const users = await User.find(query)
      .select("-password")
      .limit(limit)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(query);
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

