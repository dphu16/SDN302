const express = require("express");
const fs = require("fs");
const path = require("path");

const articleRoute = express.Router();
const dataFilePath = path.join(__dirname, "../data.json");

const readDataFromFile = async () => {
  const rawData = await fs.promises.readFile(dataFilePath, "utf-8");
  return JSON.parse(rawData);
};

const writeDataToFile = async (data) => {
  await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
};

articleRoute.get("/", async (req, res) => {
  try {
    const data = await readDataFromFile();
    res.status(200).json(data.articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

articleRoute.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await readDataFromFile();
    const article = data.articles.find((item) => item.id === id);

    if (!article) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json(article);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

articleRoute.post("/", async (req, res) => {
  try {
    const { title, content, author, date } = req.body;

    if (!title || !content || !author || !date) {
      return res.status(400).json({ message: "title, content, author and date are required" });
    }

    const data = await readDataFromFile();
    const newId = data.articles.length ? Math.max(...data.articles.map((a) => a.id)) + 1 : 1;

    const newArticle = { id: newId, title, content, author, date };
    data.articles.push(newArticle);

    await writeDataToFile(data);
    return res.status(201).json(newArticle);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

articleRoute.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, author, date } = req.body;
    const data = await readDataFromFile();
    const articleIndex = data.articles.findIndex((item) => item.id === id);

    if (articleIndex === -1) {
      return res.status(404).json({ message: "Not found" });
    }

    data.articles[articleIndex] = {
      ...data.articles[articleIndex],
      title: title ?? data.articles[articleIndex].title,
      content: content ?? data.articles[articleIndex].content,
      author: author ?? data.articles[articleIndex].author,
      date: date ?? data.articles[articleIndex].date,
    };

    await writeDataToFile(data);
    return res.status(200).json(data.articles[articleIndex]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

articleRoute.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await readDataFromFile();
    const articleIndex = data.articles.findIndex((item) => item.id === id);

    if (articleIndex === -1) {
      return res.status(404).json({ message: "Not found" });
    }

    const deletedArticle = data.articles.splice(articleIndex, 1)[0];
    await writeDataToFile(data);
    return res.status(200).json({ message: "Article deleted", article: deletedArticle });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = articleRoute;