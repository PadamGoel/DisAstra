const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function responderMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({ msg: "Authorization token missing" });
    }

    const parts = authHeader.split(" ");
    const jwtToken = parts[1];

    // Validate token format
    if (!jwtToken) {
      return res.status(401).json({ msg: "Invalid token format" });
    }

    // Verify token
    const decodedValue = jwt.verify(jwtToken, JWT_SECRET);

    if (decodedValue.username) {
      req.username = decodedValue.username; // Attach username to request
      return next();
    }

    return res.status(403).json({ msg: "You are not authenticated" });

  } catch (error) {
    return res.status(400).json({ msg: "Incorrect or expired token" });
  }
}

module.exports = responderMiddleware;
