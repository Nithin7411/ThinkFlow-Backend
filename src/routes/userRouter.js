const express = require("express");
const user = express.Router();
const userHandler = require("../handlers/userHandler");
const { hasFields, allowAuthorized } = require("../handlers/commonHandler");

user.get("/dashboard", userHandler.getDashboard);


user.get("/stories", allowAuthorized, userHandler.getUserStories);
user.get("/profile/:userId", allowAuthorized, userHandler.getProfile);
user.post("/follow", allowAuthorized, hasFields(["authorId"]), userHandler.follow);
user.post(
  "/unFollow",
  allowAuthorized,
  hasFields(["authorId"]),
  userHandler.unFollow
);

user.post("/logout", userHandler.logout);

module.exports = user;
