const fs = require("fs")

fs.readdirSync("./img").forEach((file: string) => {
    require("./" + file + "?preset=test");
});
