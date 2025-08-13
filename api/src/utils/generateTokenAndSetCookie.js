import jwt from "jsonwebtoken";
export const generateTokenAndSetCookie = ({ id, res }) => {
  try {
    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.log("Error while generating token", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};
