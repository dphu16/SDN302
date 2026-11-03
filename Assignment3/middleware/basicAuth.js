function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("You are not authenticated!");
  }

  // Tách base64 string từ "Basic <token>"
  const auth = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  const email = auth[0];
  const pass = auth[1];

  if (email === "masv@fpt.edu.vn" && pass === "masv@123") {
    next(); // Hợp lệ
  } else {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("You are not authenticated!");
  }
}

module.exports = basicAuth;
