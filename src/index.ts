// import { validate } from 'schema-utils';
// import { Schema } from 'schema-utils/declarations/ValidationError';
import fileLoader from 'file-loader'
// import { interpolateName } from 'loader-utils';
import { LoaderContext } from 'webpack';

import sharp, { Sharp } from 'sharp'
import queryString from 'query-string'
import replaceExt from 'replace-ext'
import path from 'path'

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

    const defaultOptions = {
		pipelines: {},
        name: '[name]-[contenthash].[ext]',
        outputPath: 'images'
    }
    
    let options = this.getOptions()

    options = {...defaultOptions, ...options}

    const query = this.resourceQuery

    const queryObject = queryString.parse(query)

    const pipelineName = queryObject.pipeline

    let output:string

    if (typeof pipelineName != "string") {

        let error = new Error("Pipeline not defined in query string")
        this.emitWarning(error)

        let resultObj = {
            data: source,
            info: {
                format: path.extname(this.resourcePath).replace('.', '')
            }
        }
        
        let output = await generateOutput(this, resultObj, options)

        callback(null, output)
        return

    } else {

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
            const resultObj = await sharpInstance.toBuffer({ resolveWithObject: true })

            output = await generateOutput(this, resultObj, options)

        } catch (error) {
            let errorString = String(error)
            let errorError = new Error(errorString)
            
            callback(errorError)
            return
        }
    }

    const resourcePath = path.relative(this.rootContext, this.resourcePath)

    console.log(`\x1b[0mProcessed image \x1b[1m\x1b[32m${resourcePath}\x1b[0m with pipeline \x1b[1m\x1b[33m${pipelineName}\x1b[0m`)

    callback(null, output)
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

    // Add custom runPipelineMethod to sharp instance
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
async function generateOutput(loaderContext:LoaderContext<any>, resultObj: any, options: Object) {
    
    let resourcePath = replaceExt(loaderContext.resourcePath, `.${resultObj.info.format}`)
    
    const fileLoaderContext = {
        ...loaderContext,
        resourcePath: resourcePath,
        query: options
    };

    const fileLoaderResult = fileLoader.call(
        fileLoaderContext,
        resultObj.data
    );

    return fileLoaderResult
}
