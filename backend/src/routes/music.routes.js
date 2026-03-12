import express from "express";
import {
  createMusic,
  getAllMusics,
  getMusicById,
  updateMusic,
  deleteMusic,
} from "../controllers/music.controllers.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, authorizeRoles("super_admin"), createMusic);
router.get("/all", verifyJWT, authorizeRoles("super_admin"), getAllMusics);
router.get("/:id", verifyJWT, authorizeRoles("super_admin"), getMusicById);
router.put("/update/:id", verifyJWT, authorizeRoles("super_admin"), updateMusic);
router.delete("/delete/:id", verifyJWT, authorizeRoles("super_admin"), deleteMusic);

export default router;
