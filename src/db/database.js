const admin = require("firebase-admin");

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error(
    "❌ FIREBASE_PRIVATE_KEY is missing. Did you load dotenv or set Render ENV?"
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
