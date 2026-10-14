require("dotenv").config();
const express = require("express");
const connectDB = require("./dbConnect/db");
const errorHandler = require("./middlewares/errorHandler");

const bookRoutes = require("./routes/book.route");
const memberRoutes = require("./routes/member.route");
const loanRoutes = require("./routes/loan.route");

const app = express();
connectDB();

app.use(express.json());

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/loans", loanRoutes);

// Middleware xử lý route 404
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Middleware bắt lỗi tập trung (Đặt ở cuối cùng)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
