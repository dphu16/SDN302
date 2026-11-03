const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String },
    name: { type: String },
    credits: { type: Number },
    status: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subject', subjectSchema);
