import { Artist } from "../models/artist.models.js";

export const createArtist = async (req, res, next) => {
  try {
    const { name, dob, gender, address, first_release_year, no_of_albums_released } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const artist = await Artist.create({
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
    });

    return res.status(201).json({
      success: true,
      artist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const getAllArtists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const artists = await Artist.find(query)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalArtists = await Artist.countDocuments(query);
    const totalPages = Math.ceil(totalArtists / limit);

    return res.status(200).json({
      success: true,
      artists,
      total: totalPages,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const getArtistById = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    return res.status(200).json({
      success: true,
      artist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const updateArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    const updatedArtist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      artist: updatedArtist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};

export const deleteArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    await Artist.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Artist deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Internal Server Error" });
  }
};
