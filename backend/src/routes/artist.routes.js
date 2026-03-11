import express from "express";
import { getAllArtists } from "../controllers/artist.controllers.js";
const router = express.Router();

router.get("/all", getAllArtists);
export default router;
