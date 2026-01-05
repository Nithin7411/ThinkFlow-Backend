const express = require("express");
const router = express.Router();
const storyHandler = require("../handlers/storyHandler");
const { allowAuthorized, hasFields } = require("../handlers/commonHandler");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:storyId/responses", storyHandler.getStoryResponses);
router.get("/:storyId", storyHandler.getStory);

router.use(allowAuthorized);

router.put("/", hasFields(["title", "content"]), storyHandler.updateStory);
router.get("/draft/:draftId", storyHandler.getDraft);
router.delete("/draft", hasFields(["draftId"]), storyHandler.deleteDraft);
router.post("/:storyId/response", hasFields(["response"]), storyHandler.addResponse);
router.put("/:storyId/clap", storyHandler.clap);
router.post("/:storyId/publish", hasFields(["tags"]), storyHandler.publish);

module.exports = router;
