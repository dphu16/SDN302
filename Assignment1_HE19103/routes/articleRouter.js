
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../data.json");

async function getData() {
    const data = await fs.promises.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
}

async function saveData(data) {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

router.get("/", async (req, res) => {
    const data = await getData();

    res.status(200).json(data.articles);
});

router.get("/:id", async (req, res) => {
    const data = await getData();

    const id = Number(req.params.id);

    const article = data.articles.find(
        article => article.id === id
    );

    if (!article) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    res.status(200).json(article);
});

router.post("/", async (req, res) => {
    const { title, content, author, date } = req.body;

    if (!title || !content || !author || !date) {
        return res.status(404).json(null);
    }

    const data = await getData();

    const newArticle = {
        id: data.articles.length > 0
            ? data.articles[data.articles.length - 1].id + 1
            : 1,
        title,
        content,
        author,
        date
    };

    data.articles.push(newArticle);

    await saveData(data);

    res.status(201).json(newArticle);
});

router.put("/:id", async (req, res) => {
    const data = await getData();

    const id = Number(req.params.id);

    const article = data.articles.find(
        article => article.id === id
    );

    if (!article) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    const { title, content, author, date } = req.body;

    if (!title || !content || !author || !date) {
        return res.status(404).json(null);
    }

    article.title = title;
    article.content = content;
    article.author = author;
    article.date = date;

    await saveData(data);

    res.status(200).json(article);
});

router.delete("/:id", async (req, res) => {
    const data = await getData();

    const id = Number(req.params.id);

    const index = data.articles.findIndex(
        article => article.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    const deletedArticle = data.articles.splice(index, 1)[0];

    await saveData(data);

    res.status(200).json(deletedArticle);
});

module.exports = router;