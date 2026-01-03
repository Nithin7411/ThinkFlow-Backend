const { admin } = require("../db/database");

module.exports = async function verifyFirebase(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ isLoggedIn: false });
    }

    const token = header.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      name: decoded.name,
      email: decoded.email,
      avatar_url: decoded.picture,
    };

    next();
  } catch (err) {
    return res.status(401).json({ isLoggedIn: false });
  }
};
