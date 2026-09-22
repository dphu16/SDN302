const fs = require("fs");

const data = {
    name: "Node.js",
    description: "File System Demo",
    version: "1.0"
};

fs.writeFileSync(
    "data.json",
    JSON.stringify(data, null, 2)
);

console.log("data.json has been created.");