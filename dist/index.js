"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string',
        },
    },
};
const options = {
    presets: {
        "thumbnail": [
            ["resize", 2000, 300],
            ["flip"],
            ["resize", 300, 300],
            ["runPreset", "flip"],
            ["greyscale"],
            ["jpeg", { quality: 40 }]
        ]
    }
};
// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input
async function default_1(source) {
    // const options = this.getOptions();
    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });
    var callback = this.async();
    var buffer;
    var sharpInstance = process((0, sharp_1.default)(source), options.presets[0].pipeline, options.presets);
    try {
        buffer = await sharpInstance.toBuffer();
    }
    catch (error) {
        var msg = `[Sharp] ${error}`;
        console.log(msg);
        var errorError = new Error(msg);
        callback(errorError);
        return;
    }
    callback(null, buffer);
}
exports.default = default_1;
function process(sharpInstance, methodArray, presets) {
    methodArray.forEach(method => {
        var methodName = method[0];
        var args = method.splice(1);
        switch (methodName) {
            case "runPreset":
                var presetName = args[0];
                process(sharpInstance, presets[presetName], presets);
                break;
            default:
                if (typeof sharpInstance[methodName] === 'function') {
                    sharpInstance = sharpInstance[methodName](...args);
                }
                else {
                    console.log("Sharp Method", methodName, "doesn't exist.");
                }
                ;
        }
    });
    return (sharpInstance);
}
//# sourceMappingURL=index.js.map