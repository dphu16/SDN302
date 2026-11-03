const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Đăng nhập để nhận Token
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  // Giả lập xác thực người dùng
  if (email === "masv@fpt.edu.vn" && password === "masv@123") {
    const token = jwt.sign(
      {
        userId: "masv",
        studentId: "masv",
        email,
        role: "student",
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
    });
  }

  res.status(401).json({ error: "Invalid username or password" });
});

module.exports = router;
