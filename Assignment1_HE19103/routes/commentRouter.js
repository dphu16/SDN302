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

    res.status(200).json(data.comments);
});

router.get("/article/:articleId", async (req, res) => {
    const data = await getData();
    const articleId = Number(req.params.articleId);

    const comments = data.comments.filter(
        comment => comment.articleId === articleId
    );

    if (comments.length === 0) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    res.status(200).json(comments);
});

router.get("/:id", async (req, res) => {
    const data = await getData();

    const id = Number(req.params.id);

    const comment = data.comments.find(
        comment => comment.id === id
    );

    if (!comment) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    res.status(200).json(comment);
});

router.post("/", async (req, res) => {
    const {
        articleId,
        author,
        content,
        date
    } = req.body;

    if (!articleId || !author || !content || !date) {
        return res.status(404).json(null);
    }

    const data = await getData();

    const article = data.articles.find(
        article => article.id === Number(articleId)
    );

    if (!article) {
        return res.status(404).json(null);
    }

    const newComment = {
        id: data.comments.length > 0
            ? data.comments[data.comments.length - 1].id + 1
            : 1,
        articleId: Number(articleId),
        author,
        content,
        date
    };

    data.comments.push(newComment);

    await saveData(data);

    res.status(201).json(newComment);
});

router.put("/:id", async (req, res) => {
    const data = await getData();

    const id = Number(req.params.id);

    const comment = data.comments.find(
        comment => comment.id === id
    );

    if (!comment) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    const {
        articleId,
        author,
        content,
        date
    } = req.body;

    if (!articleId || !author || !content || !date) {
        return res.status(404).json(null);
    }

    const article = data.articles.find(
        article => article.id === Number(articleId)
    );

    if (!article) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    comment.articleId = Number(articleId);
    comment.author = author;
    comment.content = content;
    comment.date = date;

    await saveData(data);

    res.status(200).json(comment);
});

router.delete("/:id", async (req, res) => {
    const data = await getData();

    const id = Number(req.params.id);

    const index = data.comments.findIndex(
        comment => comment.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Not found"
        });
    }

    const deletedComment = data.comments.splice(index, 1)[0];

    await saveData(data);

    res.status(200).json(deletedComment);
});

module.exports = router;

