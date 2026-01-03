const express = require("express");
const router = express.Router();
const { search } = require("../handlers/searchHandler");

/* 🔓 PUBLIC SEARCH */
router.get("/", search);

module.exports = router;
