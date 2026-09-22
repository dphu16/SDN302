const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const server = http.createServer((req, res) => {

    let filePath;

    if (req.url === "/") {
        filePath = path.join(__dirname, "index.html");
    }
    else if (req.url === "/about") {
        filePath = path.join(__dirname, "about.html");
    }
    else {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("404 - Page Not Found");
        return;
    }

    fs.readFile(filePath, "utf8", (err, data) => {

        if (err) {
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });

            res.end("500 - Internal Server Error");
            return;
        }

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});