"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input
async function default_1(source) {
    const options = this.getOptions();
    const query = this.resourceQuery;
    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });
    var callback = this.async();
    var buffer;
    try {
        // TODO: Process preset based on url
        var sharpInstance = process((0, sharp_1.default)(source), "thumbnail", options.presets, []);
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
        const { format } = await (0, sharp_1.default)(buffer).metadata();
    }
    catch (error) {
        var errorString = String(error);
        var errorError = new Error(errorString);
        callback(errorError);
        return;
    }
    callback(null, buffer);
    // callback(null,  `export default ${JSON.stringify(buffer)}`)
}
exports.default = default_1;
function process(sharpInstance, presetName, presets, executedPresets) {
    if (presets[presetName] === undefined) {
        throw new Error(`Preset ${presetName} is not defined.`);
    }
    if (executedPresets.includes(presetName)) {
        throw new Error(`Infinite Loop! Preset "${presetName}" calls itself. Trace: ${executedPresets},*${presetName}*`);
    }
    const newExecutedPresets = Array.from(executedPresets);
    newExecutedPresets.push(presetName);
    const pipeline = presets[presetName];
    pipeline.forEach(command => {
        // console.log("Command:" + command);
        const methodName = command[0];
        const args = Array.from(command).splice(1);
        switch (methodName) {
            case "runPreset":
                const presetName = args[0];
                process(sharpInstance, presetName, presets, newExecutedPresets);
                break;
            default:
                if (typeof sharpInstance[methodName] === 'function') {
                    sharpInstance = sharpInstance[methodName](...args);
                }
                else {
                    throw new Error(`Sharp Method "${methodName}" doesn't exist.`);
                }
                ;
        }
    });
    return sharpInstance;
}
// function getQueryParameters(params:type) {
// }
//# sourceMappingURL=index.js.map