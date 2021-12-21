import { urlToRequest } from 'loader-utils';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/ValidationError';
import { LoaderContext, LoaderDefinition, LoaderDefinitionFunction, LoaderModule, LoaderTargetPlugin, prefetch, SourceMapDevToolPlugin } from 'webpack';

import sharp, { Sharp } from 'sharp'

const schema:Schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string',
        },
    },
};


type Pipeline = Array<Array<any>>

interface Options {
    presets: Object
}

const options:Options = {
    presets: {
        "thumbnail": [
            ["resize", 2000, 300],
            ["resize", 300, 300],
            ["runPreset", "flip"],
            ["greyscale"],
            ["jpeg", { quality: 40}]
        ],
        "flip": [
            ["flip"],
            ["jpeg", { quality: 50}]
        ]
    }
}

// Webpack loader config
module.exports.raw = true; // make sure loader recieves raw input

export default async function (this:LoaderContext<any>, source: Buffer) {
    // const options = this.getOptions();

    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });

    var callback = this.async();

    var buffer:Buffer

    try {
        // TODO: Process preset based on url
        var sharpInstance = process(sharp(source), options.presets["thumbnail"], options.presets, 0)  
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

function process(sharpInstance:Sharp, pipeline: Pipeline, presets: Object, depth: number):Sharp {
    console.log("Running Preset")

    var pipeline2 = pipeline
    
    console.log(pipeline2);
    

    pipeline2.forEach(method => {

        console.log("Method: " + method);
        

        var methodName:string = method[0]
        var args = method.splice(1)

        switch (methodName) {
            case "runPreset":
                var presetName: string = args[0]

                if (presets[presetName] === undefined) {
                    throw new Error(`Preset ${presetName} is not defined.`)
                }

                process(sharpInstance, presets[presetName], presets, depth + 1)
                
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
