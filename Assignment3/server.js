require("dotenv").config();

const express = require("express");
const app = express();
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoute");
const classRoutes = require("./routes/classRoute");
const studentRoutes = require("./routes/studentRoute");

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    res.send({ message: "Welcome to Practical Exam!" });
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);
const PORT = process.env.PORT || 9999;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
