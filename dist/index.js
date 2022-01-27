"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_string_1 = __importDefault(require("query-string"));
const { Worker } = require('worker_threads');
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
    runWorker(source, pipelineName, options.pipelines).then(data => {
        callback(null, data);
    }).catch(error => {
        callback(error);
    });
    // try {
    //     buffer = await runWorker(source, pipelineName, options.pipelines)
    // } catch (error) {
    // }
    // callback(null,  buffer)
    // callback(null,  `export default ${JSON.stringify(buffer)}`)
}
exports.default = default_1;
function runWorker(source, pipelineName, pipelines) {
    const workerData = {
        source: source,
        pipelineName: pipelineName,
        pipelines: pipelines
    };
    const worker = new Worker('/Users/alexanderhorner/Documents/GitHub/webpack-image-processor-loader/dist/worker.js', { workerData: workerData });
    return new Promise((resolve, reject) => {
        worker.on('message', (result) => {
            resolve(Buffer.from(result, 'utf8'));
        });
        worker.on('error', (error) => {
            reject(new Error(error));
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with  ${code} exit code`));
            }
            reject(new Error(`Worker exited too early`));
        });
    });
}
//# sourceMappingURL=index.js.map