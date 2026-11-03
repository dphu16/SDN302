const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const { getAttendances } = require("../controllers/studentController");

const router = express.Router();

router.get("/:studentId/attendances", verifyToken, getAttendances);

module.exports = router;
