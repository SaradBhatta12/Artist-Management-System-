import express from "express";
import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
} from "../controllers/artist.controllers.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, authorizeRoles("super_admin"), createArtist);
router.get("/all", verifyJWT, authorizeRoles("super_admin"), getAllArtists);
router.get("/:id", verifyJWT, authorizeRoles("super_admin"), getArtistById);
router.put("/update/:id", verifyJWT, authorizeRoles("super_admin"), updateArtist);
router.delete("/delete/:id", verifyJWT, authorizeRoles("super_admin"), deleteArtist);

export default router;
