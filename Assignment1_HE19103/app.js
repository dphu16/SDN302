const express = require("express");

const articleRouter = require("./routes/articleRouter");
const commentRouter = require("./routes/commentRouter");

const app = express();

app.use(express.json());

app.use("/articles", articleRouter);
app.use("/comments", commentRouter);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});