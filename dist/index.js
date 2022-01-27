"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_string_1 = __importDefault(require("query-string"));
const sharp_1 = __importDefault(require("sharp"));
// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input
async function default_1(source) {
    var callback = this.async();
    const options = this.getOptions();
    const query = this.resourceQuery;
    const queryObject = query_string_1.default.parse(query);
    const pipelineName = queryObject.pipeline;
    if (typeof pipelineName != "string") {
        var error = new Error("Pipeline not defined in query string");
        callback(error);
        return;
    }
    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });
    var buffer;
    try {
        // TODO: Process pipeline based on url
        var sharpInstance = process((0, sharp_1.default)(source), pipelineName, options.pipelines, []);
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
        // TODO: set output format
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
/**
 * It processes an image given a pipeline name
 *
 * @param {Sharp} sharpInstance Image to be processed inform of an sharp instance.
 * @param {string} pipelineName Name of the pipeline.
 * @param {Object} pipelines All the available Pipelines.
 * @param {string[]} executedPipelines All the previously executed pipelines to prevent infinite loop.
 * @returns {Sharp} returns processed image as an sharp instance.
 */
function process(sharpInstance, pipelineName, pipelines, executedPipelines) {
    if (pipelines[pipelineName] === undefined) {
        throw new Error(`Pipeline ${pipelineName} is not defined.`);
    }
    if (executedPipelines.includes(pipelineName)) {
        throw new Error(`Infinite Loop! Pipeline "${pipelineName}" calls itself. Trace: ${executedPipelines},*${pipelineName}*`);
    }
    const newExecutedPipelines = Array.from(executedPipelines);
    newExecutedPipelines.push(pipelineName);
    const pipeline = pipelines[pipelineName];
    pipeline.forEach(command => {
        // console.log("Command:" + command);
        const methodName = command[0];
        const args = Array.from(command).splice(1);
        switch (methodName) {
            case "runPipeline":
                const pipelineName = args[0];
                process(sharpInstance, pipelineName, pipelines, newExecutedPipelines);
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
// function getQueryParameters(paramsq) {
// }
//# sourceMappingURL=index.js.map