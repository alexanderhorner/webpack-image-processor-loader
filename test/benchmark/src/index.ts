const fs = require("fs")

const files = fs.readdirSync("./img")

files.forEach((file: string) => {
    require("./" + file + "?pipeline=benchmark");
    require("./" + file + "?pipeline=benchmark2");
    require("./" + file + "?pipeline=benchmark3");
    require("./" + file + "?pipeline=benchmark4");
});
