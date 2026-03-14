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

router.post(
  "/create",
  verifyJWT,
  authorizeRoles("artist_manager"),
  createArtist,
);
router.get(
  "/all",
  verifyJWT,
  authorizeRoles("super_admin", "artist_manager"),
  getAllArtists,
);
router.get(
  "/:id",
  verifyJWT,
  authorizeRoles("super_admin", "artist_manager"),
  getArtistById,
);
router.put(
  "/update/:id",
  verifyJWT,
  authorizeRoles("super_admin", "artist_manager"),
  updateArtist,
);
router.delete(
  "/delete/:id",
  verifyJWT,
  authorizeRoles("super_admin", "artist_manager"),
  deleteArtist,
);

export default router;
