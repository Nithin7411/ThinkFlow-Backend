const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const { admin } = require("./db/database");

const FirestoreDatabase = require("./db/firestoreDatabase");

const loginHandler = require("./handlers/loginHandler");
const storyHandler = require("./handlers/storyHandler");
const userRouter = require("./routes/userRouter");
const storyRouter = require("./routes/storyRouter");
const handler = require("./handlers/commonHandler");
const searchRoutes = require("./routes/searchRouter");

const {
  SECRET_MSG,
  FRONT_END_URL,
} = require("../config");

const app = express();


const db = new FirestoreDatabase();
app.locals.db = db;
app.locals.SECRET_MSG = SECRET_MSG;
app.locals.FRONT_END_URL = FRONT_END_URL;


app.use(morgan("dev"));

app.use(
  cors({
    origin: "https://thinkflow.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload());
app.use(
  session({
    name: "sid",
    secret: SECRET_MSG,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);


app.post("/firebase-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token missing" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const userData = {
      uid: decoded.uid,
      name: decoded.name || "Anonymous",
      email: decoded.email || null,
      avatar_url: decoded.picture || null,
      provider: decoded.firebase.sign_in_provider,
    };


    const user = await req.app.locals.db.upsertUser(userData);
    req.session.userId = user.uid;
    req.session.username = user.name;
    req.session.avatar_url = user.avatar_url;

    res.json({ success: true, user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});


app.use("/coverImage", express.static(`${__dirname}/../database/images`));

app.get(
  "/post-login",
  handler.hasQueryParams(["code"]),
  loginHandler.handleLogin
);

app.get("/isLoggedIn", loginHandler.handlerIsLoggedIn);

app.use(
  "/search",
  handler.hasQueryParams(["keyword"]),
  handler.allowAuthorized,
  searchRoutes
);

app.delete(
  "/draft",
  handler.allowAuthorized,
  handler.hasFields(["draftId"]),
  storyHandler.deleteDraft
);

app.get(
  "/draft/:draftId",
  handler.hasPathParams(["draftId"]),
  handler.allowAuthorized,
  storyHandler.getDraft
);

app.use("/story", storyRouter);
app.use("/user", userRouter);


module.exports = app;
