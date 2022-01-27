import { urlToRequest } from 'loader-utils';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/ValidationError';
import { LoaderContext, LoaderDefinition, LoaderDefinitionFunction, LoaderModule, LoaderTargetPlugin, prefetch, SourceMapDevToolPlugin } from 'webpack';

import queryString from 'query-string'
import sharp, { Sharp } from 'sharp'

// const schema:Schema = {
//     type: 'object',
//     properties: {
//         pipelines: {
//             type: 'object',
//         },
//     },
// };


type Pipeline = Array<Array<any>>

interface Options {
    pipelines: Object
}

// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input


export default async function (this:LoaderContext<any>, source: Buffer) {

    var callback = this.async();
    
    const options = this.getOptions()

    const query = this.resourceQuery

    const queryObject = queryString.parse(query)

    const pipelineName = queryObject.pipeline

    if (typeof pipelineName != "string") {
        var error = new Error("Pipeline not defined in query string")
        
        callback(error)
        return
    }
    
    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });

    var buffer:Buffer

    try {
        var sharpInstance = process(sharp(source), pipelineName, options.pipelines, [])  
    } catch (error) {
        var errorString = String(error)
        var errorError = new Error(errorString)
        
        callback(errorError)
        return
    }

    // Output sharpInstance to Buffer and return it back to webpack
    try {
        buffer = await generateOutput(sharpInstance)

    } catch (error) {
        var errorString = String(error)
        var errorError = new Error(errorString)
        
        callback(errorError)
        return
    }

    callback(null,  buffer)
    // callback(null,  `export default ${JSON.stringify(buffer)}`)
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

    const pipeline: Pipeline = pipelines[pipelineName]
    
    pipeline.forEach(command => {

        // console.log("Command:" + command);

        const methodName:string = command[0]
        const args = Array.from(command).splice(1)

        switch (methodName) {
            case "runPipeline":
                const pipelineName: string = args[0]

                process(sharpInstance, pipelineName, pipelines, newExecutedPipelines)
                
                break;
        
            default:
                if (typeof sharpInstance[methodName] === 'function') {
                    sharpInstance = sharpInstance[methodName](...args)
                } else {
                    throw new Error(`Sharp Method "${methodName}" doesn't exist.`)
                };
        }
        
        

    })
    
    return sharpInstance
}

/**
 * Generates the final output buffer
 * 
 * @param {Sharp} sharpInstance the processed image as sharp instance 
 * @returns {Buffer} Final img
 */
async function generateOutput(sharpInstance: Sharp) {

    const buffer = await sharpInstance.toBuffer()

    // TODO: set output format
    const { format } = await sharp(buffer).metadata()

    return buffer
}