const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: { type: String, required: true },

    author: { type: String, required: true },

    category: { type: String, required: true },

    isbn: { type: String, required: true, unique: true, trim: true },

    publishedYear: { type: Number, required: true },

    totalCopies: { type: Number, required: true, min: 0 },

    availableCopies: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

bookSchema.pre("validate", function (next) {
  if (
    this.totalCopies !== undefined &&
    this.availableCopies !== undefined &&
    this.availableCopies > this.totalCopies
  ) {
    this.invalidate(
      "availableCopies",
      "Available copies cannot exceed total copies",
    );
  }

  next();
});

module.exports = mongoose.model("Book", bookSchema);
