import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import loginLimiter from "../middlewares/loginLimiter.middleware.js";

const router = express.Router();

router.post("/register", loginLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/profile", verifyJWT, getUserProfile);
router.post("/add-user", verifyJWT, authorizeRoles("super_admin"), createUser);

router.put("/update-user/:id", verifyJWT, authorizeRoles("super_admin"), updateUser);
router.delete("/delete-user/:id", verifyJWT, authorizeRoles("super_admin"), deleteUser);
router.get("all-users", verifyJWT, authorizeRoles("super_admin"), getAllUsers);


// Example of role-based route
router.get("/admin/all", verifyJWT, authorizeRoles("super_admin"), getAllUsers);

export default router;
