const express = require("express");
const fs = require("fs");
const path = require("path");

const commentRoute = express.Router();
const dataFilePath = path.join(__dirname, "../data.json");

const readDataFromFile = async () => {
  const rawData = await fs.promises.readFile(dataFilePath, "utf-8");
  return JSON.parse(rawData);
};

const writeDataToFile = async (data) => {
  await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
};

commentRoute.get("/", async (req, res) => {
  try {
    const data = await readDataFromFile();
    return res.status(200).json(data.comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

commentRoute.get("/article/:articleId", async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);
    const data = await readDataFromFile();
    const comments = data.comments.filter((item) => item.articleId === articleId);
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

commentRoute.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await readDataFromFile();
    const comment = data.comments.find((item) => item.id === id);

    if (!comment) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

commentRoute.post("/", async (req, res) => {
  try {
    const { articleId, author, content, date } = req.body;

    if (!articleId || !author || !content || !date) {
      return res.status(400).json({ message: "articleId, author, content and date are required" });
    }

    const data = await readDataFromFile();
    const articleExists = data.articles.some((article) => article.id === Number(articleId));

    if (!articleExists) {
      return res.status(404).json({ message: "Article does not exist" });
    }

    const newId = data.comments.length ? Math.max(...data.comments.map((item) => item.id)) + 1 : 1;
    const newComment = { id: newId, articleId: Number(articleId), author, content, date };

    data.comments.push(newComment);
    await writeDataToFile(data);

    return res.status(201).json(newComment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

commentRoute.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { articleId, author, content, date } = req.body;
    const data = await readDataFromFile();
    const commentIndex = data.comments.findIndex((item) => item.id === id);

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    data.comments[commentIndex] = {
      ...data.comments[commentIndex],
      articleId: articleId !== undefined ? Number(articleId) : data.comments[commentIndex].articleId,
      author: author ?? data.comments[commentIndex].author,
      content: content ?? data.comments[commentIndex].content,
      date: date ?? data.comments[commentIndex].date,
    };

    await writeDataToFile(data);
    return res.status(200).json(data.comments[commentIndex]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

commentRoute.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await readDataFromFile();
    const commentIndex = data.comments.findIndex((item) => item.id === id);

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const deletedComment = data.comments.splice(commentIndex, 1)[0];
    await writeDataToFile(data);
    return res.status(200).json({ message: "Comment deleted", comment: deletedComment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = commentRoute;
