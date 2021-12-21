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
    try {
        // TODO: Process preset based on url
        var sharpInstance = process((0, sharp_1.default)(source), options.presets["thumbnail"], options.presets);
    }
    catch (error) {
        var errorString = String(error);
        var errorError = new Error(errorString);
        callback(errorError);
        return;
    }
    // Output sharpInstance to Buffer and return it back to webpack
    try {
        buffer = await sharpInstance.toBuffer();
    }
    catch (error) {
        var errorString = String(error);
        var errorError = new Error(errorString);
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
                // var presetName: string = args[0]
                // if (presets[presetName] !== null) {
                //     process(sharpInstance, presets[presetName], presets)
                // } else {
                //     throw new Error(`${presetName} is not defined.`)
                // }
                break;
            default:
                if (typeof sharpInstance[methodName] === 'function') {
                    sharpInstance = sharpInstance[methodName](...args);
                }
                else {
                    throw new Error(`Sharp Method ${methodName} doesn't exist.`);
                }
                ;
        }
    });
    return (sharpInstance);
}
//# sourceMappingURL=index.js.map