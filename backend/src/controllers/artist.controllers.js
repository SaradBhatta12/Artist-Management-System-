export const getAllArtists = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "controller connected finally",
      status: 200,
    });
  } catch (error) {
    console.log(error);
  }
};
