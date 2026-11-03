const mongoose = require("mongoose");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

function parseDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function dayBounds(date) {
  const end = new Date(date);
  end.setUTCDate(end.getUTCDate() + 1);
  return { $gte: date, $lt: end };
}

function databaseError(res, error) {
  console.error(error);
  return res.status(500).json({ error: "Internal server error." });
}

async function getStudents(req, res) {
  const { classId } = req.params;
  if (!isObjectId(classId)) {
    return res.status(400).json({ error: "Invalid classId." });
  }

  const status = String(req.query.status || "enrolled").toUpperCase();
  if (!["ENROLLED", "DROPPED"].includes(status)) {
    return res.status(400).json({ error: "Status must be enrolled or dropped." });
  }

  try {
    const classDoc = await Class.findById(classId).populate("enrollments.studentId");
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found." });
    }

    return res.json(
      classDoc.enrollments
        .filter(
          (enrollment) =>
            enrollment.status.toUpperCase() === status && enrollment.studentId,
        )
        .map((enrollment) => ({
          studentId: enrollment.studentId._id,
          studentCode: enrollment.studentId.studentCode,
          fullName: enrollment.studentId.fullName,
          email: enrollment.studentId.email,
        })),
    );
  } catch (error) {
    return databaseError(res, error);
  }
}

async function getAttendanceSummary(req, res) {
  const { classId } = req.params;
  if (!isObjectId(classId)) {
    return res.status(400).json({ error: "Invalid classId." });
  }

  try {
    const classDoc = await Class.findById(classId).populate("enrollments.studentId");
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found." });
    }

    const enrolled = classDoc.enrollments.filter(
      (enrollment) =>
        enrollment.status.toUpperCase() === "ENROLLED" && enrollment.studentId,
    );
    const studentIds = enrolled.map((enrollment) => enrollment.studentId._id);
    const attendances = await Attendance.find({
      classId,
      studentId: { $in: studentIds },
    }).lean();
    const students = enrolled.map((enrollment) => {
      const records = attendances.filter((record) =>
        record.studentId.equals(enrollment.studentId._id),
      );
      const present = records.filter(
        (record) => record.status.toUpperCase() === "PRESENT",
      ).length;
      const absent = records.filter(
        (record) => record.status.toUpperCase() === "ABSENT",
      ).length;
      const totalSessions = records.length;
      const attendanceRate =
        totalSessions === 0
          ? 0
          : Number(((present / totalSessions) * 100).toFixed(1));

      return {
        studentCode: enrollment.studentId.studentCode,
        totalSessions,
        present,
        absent,
        attendanceRate,
        warning: attendanceRate < 80,
      };
    });

    return res.json(students);
  } catch (error) {
    return databaseError(res, error);
  }
}

async function saveAttendances(req, res) {
  const { classId } = req.params;
  const { date, records } = req.body || {};
  if (!isObjectId(classId)) {
    return res.status(400).json({ error: "Invalid classId." });
  }

  const attendanceDate = parseDateOnly(date);
  if (!attendanceDate || attendanceDate > new Date()) {
    return res.status(400).json({ error: "Date must be valid and not in the future." });
  }
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "Records must be a non-empty array." });
  }

  try {
    const classDoc = await Class.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found." });
    }

    const enrollmentMap = new Map(
      classDoc.enrollments.map((enrollment) => [
        enrollment.studentId.toString(),
        enrollment.status.toUpperCase(),
      ]),
    );
    const seenStudents = new Set();
    for (const record of records) {
      const studentId = record && String(record.studentId);
      const status = record && String(record.status).toUpperCase();
      if (
        !record ||
        !isObjectId(studentId) ||
        seenStudents.has(studentId) ||
        enrollmentMap.get(studentId) !== "ENROLLED" ||
        !["PRESENT", "ABSENT"].includes(status)
      ) {
        return res.status(400).json({
          error: "Each record must contain a valid enrolled studentId and status PRESENT or ABSENT.",
        });
      }
      seenStudents.add(studentId);
    }

    const enrolledStudentIds = Array.from(enrollmentMap.entries())
      .filter(([, status]) => status === "ENROLLED")
      .map(([studentId]) => studentId);
    if (
      seenStudents.size !== enrolledStudentIds.length ||
      enrolledStudentIds.some((studentId) => !seenStudents.has(studentId))
    ) {
      return res.status(400).json({
        error: "Records must include every currently enrolled student.",
      });
    }

    const studentCount = await Student.countDocuments({
      _id: { $in: records.map((record) => record.studentId) },
    });
    if (studentCount !== records.length) {
      return res.status(400).json({ error: "One or more students do not exist." });
    }

    const bounds = dayBounds(attendanceDate);
    const savedRecords = [];
    for (const record of records) {
      const saved = await Attendance.findOneAndUpdate(
        { classId, studentId: record.studentId, date: bounds },
        {
          $set: {
            date: attendanceDate,
            status: String(record.status).toUpperCase(),
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      savedRecords.push(saved);
    }

    return res.status(200).json({
      message: "Attendance records saved successfully.",
      records: savedRecords,
    });
  } catch (error) {
    return databaseError(res, error);
  }
}

module.exports = {
  getStudents,
  getAttendanceSummary,
  saveAttendances,
};
