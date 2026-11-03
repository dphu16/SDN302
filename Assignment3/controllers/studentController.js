const mongoose = require("mongoose");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");

async function getAttendances(req, res) {
  const { studentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: "Invalid studentId." });
  }

  try {
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const records = await Attendance.find({ studentId }).sort({ date: -1 }).lean();
    const classes = await Class.find({
      _id: { $in: records.map((record) => record.classId) },
    }).lean();
    const subjects = await Subject.find({
      _id: { $in: classes.map((classDoc) => classDoc.subjectId) },
    }).lean();
    const classMap = new Map(classes.map((classDoc) => [classDoc._id.toString(), classDoc]));
    const subjectMap = new Map(
      subjects.map((subject) => [subject._id.toString(), subject]),
    );

    return res.json(
      records.map((record) => {
        const classDoc = classMap.get(record.classId.toString());
        const subject = classDoc
          ? subjectMap.get(classDoc.subjectId.toString())
          : null;
        return {
          className: classDoc ? classDoc.className : null,
          subjectName: subject ? subject.name : null,
          date: record.date,
          status: record.status,
        };
      }),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { getAttendances };
