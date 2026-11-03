const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentCode: { type: String },
    fullName: { type: String },
    email: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
