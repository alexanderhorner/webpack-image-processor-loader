import fileLoader from "file-loader";
import { urlToRequest } from 'loader-utils';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/ValidationError';
import { LoaderContext, LoaderDefinition, LoaderDefinitionFunction, LoaderModule, LoaderTargetPlugin, prefetch, SourceMapDevToolPlugin } from 'webpack';

import sharp, { Sharp } from 'sharp'
import queryString from 'query-string'
import replaceExt from 'replace-ext'

// const schema:Schema = {
//     type: 'object',
//     properties: {
//         pipelines: {
//             type: 'object',
//         },
//     },
// };

interface Options {
    pipelines: Object
}

// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input


export default async function (this:LoaderContext<any>, source: Buffer) {

    const callback = this.async();
    
    const options = this.getOptions()

    const query = this.resourceQuery

    const queryObject = queryString.parse(query)

    const pipelineName = queryObject.pipeline

    if (typeof pipelineName != "string") {
        let error = new Error("Pipeline not defined in query string")
        
        callback(error)
        return
    }
    
    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });

    let buffer:Buffer

    let sharpInstance:Sharp

    try {
        sharpInstance = process(sharp(source), pipelineName, options.pipelines, [])  
    } catch (error) {
        let errorString = String(error)
        let errorError = new Error(errorString)
        
        callback(errorError)
        return
    }

    // Output sharpInstance to Buffer and return it back to webpack
    try {
        buffer = await generateOutput(this, sharpInstance)

    } catch (error) {
        let errorString = String(error)
        let errorError = new Error(errorString)
        
        callback(errorError)
        return
    }

    const resourcePath = this.resourcePath.replace(this.context, '')

    console.log(`\x1b[0mProcessed image \x1b[32m${resourcePath}\x1b[0m`)

    callback(null,  buffer)
}

/**
 * Processes an image given a pipeline name
 * 
 * @param {Sharp} sharpInstance Image to be processed inform of an sharp instance.
 * @param {string} pipelineName Name of the pipeline.
 * @param {Object} pipelines All the available Pipelines.
 * @param {string[]} executedPipelines All the previously executed pipelines to prevent infinite loop.
 * @returns {Sharp} returns processed image as an sharp instance.
 */
function process(sharpInstance:Sharp, pipelineName: string, pipelines: Object, executedPipelines: string[]):Sharp {

    if (pipelines[pipelineName] === undefined) {
        throw new Error(`Pipeline ${pipelineName} is not defined.`)
    }

    if (executedPipelines.includes(pipelineName)) {
        throw new Error(`Infinite Loop! Pipeline "${pipelineName}" calls itself. Trace: ${executedPipelines},*${pipelineName}*`);
    }

    const newExecutedPipelines = Array.from(executedPipelines)
    newExecutedPipelines.push(pipelineName)

    const pipeline: Function = pipelines[pipelineName]

    // Add custom runPipelineMethod to sharp class
    sharp.prototype.runPipeline = function (nameOfPipeline: string) {
        process(this, nameOfPipeline, pipelines, newExecutedPipelines)
        return this
    }

    sharpInstance = pipeline(sharpInstance)

    return sharpInstance
}

/**
 * Generates the final output buffer
 * 
 * @param {LoaderContext<any>} this
 * @param {Sharp} sharpInstance the processed image as sharp instance 
 * @returns {Buffer} Final img
 */
async function generateOutput(loaderContext:LoaderContext<any>, sharpInstance: Sharp) {

    const resultObj = await sharpInstance.toBuffer({ resolveWithObject: true })

    const fileLoaderContext = {
        ...loaderContext,
        resourcePath: replaceExt(loaderContext.resourcePath, `.${resultObj.info.format}`)
    };

    const fileLoaderResult = fileLoader.call(
        fileLoaderContext,
        resultObj.data
    );

    return fileLoaderResult
}

