const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    className: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    lecturerName: { type: String },
    status: { type: String },
    enrollments: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: { type: String }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Class', classSchema);
