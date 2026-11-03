const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const {
  getStudents,
  getAttendanceSummary,
  saveAttendances,
} = require("../controllers/classController");

const router = express.Router();

router.get("/:classId/students", verifyToken, getStudents);
router.get("/:classId/attendance-summary", verifyToken, getAttendanceSummary);
router.post("/:classId/attendances", verifyToken, saveAttendances);

module.exports = router;
