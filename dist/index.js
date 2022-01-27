"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_loader_1 = __importDefault(require("file-loader"));
const sharp_1 = __importDefault(require("sharp"));
const query_string_1 = __importDefault(require("query-string"));
const replace_ext_1 = __importDefault(require("replace-ext"));
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
        buffer = await generateOutput(this, sharpInstance);
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
/**
 * Processes an image given a pipeline name
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
    sharpInstance = pipeline(sharpInstance);
    return sharpInstance;
}
/**
 * Generates the final output buffer
 *
 * @param {LoaderContext<any>} this
 * @param {Sharp} sharpInstance the processed image as sharp instance
 * @returns {Buffer} Final img
 */
async function generateOutput(loaderContext, sharpInstance) {
    const resultObj = await sharpInstance.toBuffer({ resolveWithObject: true });
    const fileLoaderContext = {
        ...loaderContext,
        resourcePath: (0, replace_ext_1.default)(loaderContext.resourcePath, `.${resultObj.info.format}`)
    };
    const fileLoaderResult = file_loader_1.default.call(fileLoaderContext, resultObj.data);
    return fileLoaderResult;
}
//# sourceMappingURL=index.js.map