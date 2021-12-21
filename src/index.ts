import { urlToRequest } from 'loader-utils';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/ValidationError';
import { LoaderContext, LoaderDefinition, LoaderDefinitionFunction, LoaderModule, LoaderTargetPlugin, prefetch, SourceMapDevToolPlugin } from 'webpack';

import sharp, { Sharp } from 'sharp'

// const schema:Schema = {
//     type: 'object',
//     properties: {
//         presets: {
//             type: 'object',
//         },
//     },
// };


type Pipeline = Array<Array<any>>

interface Options {
    presets: Object
}

// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input

export default async function (this:LoaderContext<any>, source: Buffer) {
    const options = this.getOptions();

    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });

    var callback = this.async();

    var buffer:Buffer

    try {
        // TODO: Process preset based on url
        var sharpInstance = process(sharp(source), "thumbnail", options.presets, [])  
    } catch (error) {
        var errorString = String(error)
        var errorError = new Error(errorString)
        
        callback(errorError)
        return
    }


    // Output sharpInstance to Buffer and return it back to webpack
    try {
        buffer = await sharpInstance.toBuffer()
    } catch (error) {
        var errorString = String(error)
        var errorError = new Error(errorString)
        
        callback(errorError)
        return
    }
     
    callback(null, buffer)
}

function process(sharpInstance:Sharp, presetName: string, presets: Object, executedPresets: string[]):Sharp {

    if (presets[presetName] === undefined) {
        throw new Error(`Preset ${presetName} is not defined.`)
    }

    if (executedPresets.includes(presetName)) {
        throw new Error(`Infinite Loop! Preset "${presetName}" calls itself. Trace: ${executedPresets},*${presetName}*`);
    }

    executedPresets.push(presetName)

    const pipeline: Pipeline = presets[presetName]
    
    pipeline.forEach(command => {

        var methodName:string = command[0]
        var args = Array.from(command).splice(1)

        switch (methodName) {
            case "runPreset":
                var presetName: string = args[0]

                process(sharpInstance, presetName, presets, executedPresets)
                
                break;
        
            default:
                if (typeof sharpInstance[methodName] === 'function') {
                    sharpInstance = sharpInstance[methodName](...args)
                } else {
                    throw new Error(`Sharp Method ${methodName} doesn't exist.`)
                };
        }
        
        

    })
    
    
    return (sharpInstance)

}
