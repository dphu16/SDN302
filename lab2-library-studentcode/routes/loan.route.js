const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loan.controller");
const {
  validateCreateLoan,
  validateReturnLoan,
} = require("../middlewares/validateRequest");

router.post("/", validateCreateLoan, loanController.createLoan);
router.get("/", loanController.getAllLoans);
router.get("/:id", loanController.getLoanById);
router.put("/:id/return", validateReturnLoan, loanController.returnLoan);

module.exports = router;
