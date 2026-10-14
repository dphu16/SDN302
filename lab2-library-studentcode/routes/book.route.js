const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const { validateBook } = require("../middlewares/validateRequest");

router.post("/", validateBook, bookController.createBook);
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.put("/:id", validateBook, bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;
