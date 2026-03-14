import express from "express";
import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  multipleCreateArtist,
  exportallArtestsToExcel
} from "../controllers/artist.controllers.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, authorizeRoles("artist_manager"), createArtist);
router.get("/all", verifyJWT, authorizeRoles("super_admin", "artist_manager"), getAllArtists);
router.get("/export-all-artists-to-excel", verifyJWT, authorizeRoles("super_admin", "artist_manager"), exportallArtestsToExcel); // static first
router.get("/:id", verifyJWT, authorizeRoles("super_admin", "artist_manager"), getArtistById); // dynamic after
router.put("/update/:id", verifyJWT, authorizeRoles("super_admin", "artist_manager"), updateArtist);
router.delete("/delete/:id", verifyJWT, authorizeRoles("super_admin", "artist_manager"), deleteArtist);
router.post("/import-all-artists-from-excel", verifyJWT, authorizeRoles("super_admin", "artist_manager"), multipleCreateArtist);
export default router;
