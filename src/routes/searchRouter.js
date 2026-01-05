const express = require("express");
const router = express.Router();
const { search } = require("../handlers/searchHandler");

router.get("/", search);

module.exports = router;
