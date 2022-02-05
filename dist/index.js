"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { validate } from 'schema-utils';
// import { Schema } from 'schema-utils/declarations/ValidationError';
const file_loader_1 = __importDefault(require("file-loader"));
const sharp_1 = __importDefault(require("sharp"));
const query_string_1 = __importDefault(require("query-string"));
const replace_ext_1 = __importDefault(require("replace-ext"));
const path_1 = __importDefault(require("path"));
// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input
async function default_1(source) {
    const callback = this.async();
    const defaultOptions = {
        pipelines: {},
        name: '[name]-[contenthash].[ext]',
        outputPath: 'images'
    };
    let options = this.getOptions();
    options = { ...defaultOptions, ...options };
    const query = this.resourceQuery;
    const queryObject = query_string_1.default.parse(query);
    const pipelineName = queryObject.pipeline;
    let output;
    if (typeof pipelineName != "string") {
        let error = new Error("Pipeline not defined in query string");
        this.emitWarning(error);
        let resultObj = {
            data: source,
            info: {
                format: path_1.default.extname(this.resourcePath).replace('.', '')
            }
        };
        let output = await generateOutput(this, resultObj, options);
        callback(null, output);
        return;
    }
    else {
        let sharpInstance;
        try {
            sharpInstance = process((0, sharp_1.default)(source), pipelineName, options.pipelines, []);
        }
        catch (error) {
            let errorString = String(error);
            let errorError = new Error(errorString);
            callback(errorError);
            return;
        }
        // Output sharpInstance to Buffer and return it back to webpack
        try {
            const resultObj = await sharpInstance.toBuffer({ resolveWithObject: true });
            output = await generateOutput(this, resultObj, options);
        }
        catch (error) {
            let errorString = String(error);
            let errorError = new Error(errorString);
            callback(errorError);
            return;
        }
    }
    const resourcePath = path_1.default.relative(this.rootContext, this.resourcePath);
    console.log(`\x1b[0mProcessed image \x1b[1m\x1b[32m${resourcePath}\x1b[0m with pipeline \x1b[1m\x1b[33m${pipelineName}\x1b[0m`);
    callback(null, output);
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
    // Add custom runPipelineMethod to sharp instance
    sharp_1.default.prototype.runPipeline = function (nameOfPipeline) {
        process(this, nameOfPipeline, pipelines, newExecutedPipelines);
        return this;
    };
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
async function generateOutput(loaderContext, resultObj, options) {
    let resourcePath = (0, replace_ext_1.default)(loaderContext.resourcePath, `.${resultObj.info.format}`);
    const fileLoaderContext = {
        ...loaderContext,
        resourcePath: resourcePath,
        query: options
    };
    const fileLoaderResult = file_loader_1.default.call(fileLoaderContext, resultObj.data);
    return fileLoaderResult;
}
// async function fileLoader(fileLoaderContext:LoaderContext<any>, content: Buffer) {
//     const options = fileLoaderContext.getOptions()
//     const context = options.context || fileLoaderContext.rootContext;
// 	const name = options.name || '[contenthash].[ext]';
// 	const url = interpolateName(fileLoaderContext, name, {
// 		context,
// 		content,
// 		regExp: options.regExp,
// 	});
// 	let outputPath = url;
// 	if (options.outputPath) {
// 		if (typeof options.outputPath === 'function') {
// 			outputPath = options.outputPath(url, fileLoaderContext.resourcePath, context);
// 		} else {
// 			outputPath = path.posix.join(options.outputPath, url);
// 		}
// 	}
// 	let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;
// 	if (options.publicPath) {
// 		if (typeof options.publicPath === 'function') {
// 			publicPath = options.publicPath(url, fileLoaderContext.resourcePath, context);
// 		} else {
// 			publicPath = `${
// 				options.publicPath.endsWith('/')
// 					? options.publicPath
// 					: `${options.publicPath}/`
// 			}${url}`;
// 		}
// 		publicPath = JSON.stringify(publicPath);
// 	}
// 	if (options.postTransformPublicPath) {
// 		publicPath = options.postTransformPublicPath(publicPath);
// 	}
// 	if (typeof options.emitFile === 'undefined' || options.emitFile) {
// 		const assetInfo: any = {};
// 		if (typeof name === 'string') {
// 			let normalizedName = name;
// 			const idx = normalizedName.indexOf('?');
// 			if (idx >= 0) {
// 				normalizedName = normalizedName.substr(0, idx);
// 			}
// 			const isImmutable = /\[([^:\]]+:)?(hash|contenthash)(:[^\]]+)?]/gi.test(
// 				normalizedName
// 			);
// 			if (isImmutable === true) {
// 				assetInfo.immutable = true;
// 			}
// 		}
// 		assetInfo.sourceFilename = path.normalize(
// 			path.relative(fileLoaderContext.rootContext, fileLoaderContext.resourcePath)
// 		);
// 		fileLoaderContext.emitFile(outputPath, content, undefined, assetInfo);
// 	}
// 	const esModule =
// 		typeof options.esModule !== 'undefined' ? options.esModule : true;
// 	return `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`;
// }
//# sourceMappingURL=index.js.map