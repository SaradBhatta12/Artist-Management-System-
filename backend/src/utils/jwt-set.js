import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign({ _id: id, role: role }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "15d",
  });
};

export default generateToken;
