const fs = require("fs")

const files = fs.readdirSync("./img")

const versions = [
    'benchmark1',
    'benchmark2',
    'benchmark3',
    'benchmark4'
]

files.forEach((file: any) => {

    require(`./img/${file}?pipeline=benchmark1`)
    require(`./img/${file}?pipeline=benchmark2`)
    require(`./img/${file}?pipeline=benchmark3`)
    require(`./img/${file}?pipeline=benchmark4`)

});