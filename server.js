require("dotenv").config();
const app = require('./src/app');

const PORT = process.env.PORT || 8000;

console.log("ENV CHECK:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HAS_FIREBASE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
git commit -m "Fix: proper Render port handling"
git push