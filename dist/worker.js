"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { workerData, parentPort } = require('worker_threads');
const sharp_1 = __importDefault(require("sharp"));
const { source, pipelineName, pipelines } = workerData;
let sharpInstance = process((0, sharp_1.default)(source), pipelineName, pipelines, []);
generateOutput(sharpInstance).then(data => {
    parentPort.postMessage(data);
});
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
/**
 * Generates the final output buffer
 *
 * @param {Sharp} sharpInstance the processed image as sharp instance
 * @returns {Buffer} Final img
 */
async function generateOutput(sharpInstance) {
    const buffer = await sharpInstance.toBuffer();
    // TODO: set output format
    const { format } = await (0, sharp_1.default)(buffer).metadata();
    return buffer;
}
//# sourceMappingURL=worker.js.map