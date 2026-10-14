const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    return res.status(400).json({
      message: `${field} already exists`,
    });
  }

  // 2. Bắt lỗi Validate từ Mongoose Schema (thiếu required, sai enum, số âm...)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      message: errors[0],
      errors,
    });
  }

  // 3. Bắt lỗi sai kiểu dữ liệu (ví dụ nhập chữ vào trường totalCopies hoặc ngày tháng sai định dạng)
  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid value for ${err.path}: ${err.value}`,
    });
  }

  // 4. Lỗi Server mặc định
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
