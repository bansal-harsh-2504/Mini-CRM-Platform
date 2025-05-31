import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

export const authenticateUser = async (req, res) => {
  const { credentials } = req.body;
  if (!credentials) {
    return res.status(400).json({ message: "No credentials provided" });
  }
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credentials,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
      });
      await user.save();
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    req.user = payload;
    res.status(200).json({
      success: true,
      message: "Google token verified successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    console.error("Error verifying Google token: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
