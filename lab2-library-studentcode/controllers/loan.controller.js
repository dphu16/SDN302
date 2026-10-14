const Loan = require("../models/Loan");
const Book = require("../models/Book");

// POST /api/loans
exports.createLoan = async (req, res, next) => {
  try {
    const { member_id, items, dueDate } = req.body;

    // Trừ số lượng sách trong kho
    for (const item of items) {
      const qty = item.quantity || 1;
      await Book.findByIdAndUpdate(item.books_id, {
        $inc: { totalCopies: -qty },
      });
    }

    const newLoan = await Loan.create({ member_id, items, dueDate });

    const populatedLoan = await Loan.findById(newLoan._id)
      .populate({
        path: "member_id",
        select: "name email phone membershipType",
      })
      .populate({
        path: "items.books_id",
        select: "title author isbn category",
      });

    res.status(201).json(populatedLoan);
  } catch (err) {
    next(err);
  }
};

// GET /api/loans (Requirement 3: populate member_id & items.books_id với select)
exports.getAllLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find()
      .populate({
        path: "member_id",
        select: "name email phone membershipType",
      })
      .populate({
        path: "items.books_id",
        select: "title author isbn category",
      });

    res.status(200).json(loans);
  } catch (err) {
    next(err);
  }
};

// GET /api/loans/:id
exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate({
        path: "member_id",
        select: "name email phone membershipType",
      })
      .populate({
        path: "items.books_id",
        select: "title author isbn category",
      });

    if (!loan) {
      return res
        .status(404)
        .json({ message: "Borrowing record does not exist" });
    }
    res.status(200).json(loan);
  } catch (err) {
    next(err);
  }
};

// PUT /api/loans/:id/return (Task 4)
exports.returnLoan = async (req, res, next) => {
  try {
    const loan = req.loan; // Đã được lấy từ middleware validateReturnLoan

    // 1. Khôi phục số lượng sách (restore book quantities)
    for (const item of loan.items) {
      const returnQty = item.quantity || 1;
      await Book.findByIdAndUpdate(item.books_id, {
        $inc: { totalCopies: returnQty },
      });
    }

    // 2. Cập nhật returnDate và status = 'Returned'
    loan.returnDate = new Date();
    loan.status = "Returned";
    await loan.save();

    // 3. Populate lại dữ liệu trước khi trả về response
    const updatedLoan = await Loan.findById(loan._id)
      .populate({
        path: "member_id",
        select: "name email phone membershipType",
      })
      .populate({
        path: "items.books_id",
        select: "title author isbn category",
      });

    res.status(200).json({
      message: "Books returned successfully",
      data: updatedLoan,
    });
  } catch (err) {
    next(err);
  }
};
