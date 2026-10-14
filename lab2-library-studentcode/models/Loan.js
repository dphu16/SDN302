const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    items: {
      type: [
        {
          book_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
          },

          quantity: { type: Number, min: 1, required: true },
        },
      ],
      required: true,
      minlength: 1,
    },

    borrowDate: { type: Date, default: Date.now },

    dueDate: { type: Date, required: true },

    returnDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ["Borrowing", "Returned", "Overdue"],
      default: "Borrowing",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Loan", loanSchema);
