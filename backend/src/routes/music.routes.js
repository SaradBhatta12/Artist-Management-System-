import express from "express";
import { getAllMusics } from "../controllers/music.controllers.js";
const router = express.Router();

router.get("/all", getAllMusics);

export default router;
