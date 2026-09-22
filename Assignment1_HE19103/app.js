const express = require("express");

const articleRoute = require('./routes/articleRouter');
const commentRoute = require('./routes/commentRouter');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/articles', articleRoute);
app.use('/comments', commentRoute);

app.get('/', (req, res) => {
  res.redirect('/articles');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;