import admin from "../../server.js";
import User from "../mongodb/models/User.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    // Extract token
    const token = authHeader.split("Bearer ")[1];

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user info to request
    req.firebaseUser = decodedToken;
    //console.log("Verified user:", decodedToken);

    // reset session user if not set
    if (!req.session.user) {
      const user = await User.findOne({
        firebaseUID: decodedToken.uid,
      })
        .lean()
        .exec();
      if (!user) {
        return res
          .status(404)
          .json({ message: "User with this Firebase UID not found." });
      }
      req.session.user = user;
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }
};
