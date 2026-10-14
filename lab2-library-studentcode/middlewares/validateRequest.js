const Book = require("../models/Book");
const Member = require("../models/Member");
const Loan = require("../models/Loan");

// 1. Validate cho Book (Task 1)
exports.validateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;
    const isUpdate = req.method === "PUT" || req.method === "PATCH";

    if (
      !isUpdate &&
      (!title || !author || !isbn || !category || totalCopies === undefined)
    ) {
      return res.status(400).json({
        message:
          "All required fields (title, author, isbn, category, totalCopies) must be provided",
      });
    }

    if (
      totalCopies !== undefined &&
      (typeof totalCopies !== "number" || totalCopies < 0)
    ) {
      return res
        .status(400)
        .json({ message: "Total copies cannot be negative" });
    }

    if (isbn) {
      const existingBook = await Book.findOne({ isbn: isbn.trim() });
      if (existingBook && existingBook._id !== req.params.id) {
        return res
          .status(400)
          .json({ message: "ISBN already exists in the database" });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

// 2. Validate cho Member (Task 2)
exports.validateMember = async (req, res, next) => {
  try {
    const { name, email, phone, membershipType } = req.body;
    const isUpdate = req.method === "PUT" || req.method === "PATCH";
    const permittedTypes = ["Standard", "Premium", "Student", "VIP"];

    if (!isUpdate && (!name || !email || !phone || !membershipType)) {
      return res.status(400).json({
        message:
          "All required fields (name, email, phone, membershipType) must be provided",
      });
    }

    if (membershipType && !permittedTypes.includes(membershipType)) {
      return res.status(400).json({
        message: `membershipType must be one of: ${permittedTypes.join(", ")}`,
      });
    }

    if (email) {
      const existingMember = await Member.findOne({
        email: email.trim().toLowerCase(),
      });
      if (existingMember && existingMember._id !== req.params.id) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

// 3. Validate khi tạo Loan (Task 3)
exports.validateCreateLoan = async (req, res, next) => {
  try {
    const { member_id, items, dueDate } = req.body;

    if (
      !member_id ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !dueDate
    ) {
      return res.status(400).json({
        message: "member_id, items (non-empty array), and dueDate are required",
      });
    }

    const member = await Member.findById(member_id);
    if (!member) {
      return res.status(404).json({ message: "Member does not exist" });
    }
    if (member.isActive === false) {
      return res.status(400).json({ message: "Member account is not active" });
    }

    for (const item of items) {
      const qty = item.quantity || 1;
      const book = await Book.findById(item.books_id);
      if (!book) {
        return res
          .status(404)
          .json({ message: `Book with ID ${item.books_id} does not exist` });
      }
      if (book.totalCopies < qty) {
        return res
          .status(400)
          .json({ message: `Not enough copies for book: ${book.title}` });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

// 4. Validate khi trả sách (Task 4)
exports.validateReturnLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res
        .status(404)
        .json({ message: "Borrowing record does not exist" });
    }

    if (loan.status === "Returned" || loan.returnDate !== null) {
      return res
        .status(400)
        .json({ message: "This borrowing record has already been returned" });
    }

    req.loan = loan;
    next();
  } catch (err) {
    next(err);
  }
};
