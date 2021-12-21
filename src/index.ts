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
            ["flip"],
            ["resize", 300, 300],
            ["runPreset", "flip"],
            ["greyscale"],
            ["jpeg", { quality: 40}]
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

    var sharpInstance = process(sharp(source), options.presets[0].pipeline, options.presets)



    try {
        buffer = await sharpInstance.toBuffer()
    } catch (error) {
        var msg = `[Sharp] ${error}`

        console.log(msg)
        
        var errorError = new Error(msg)
        callback(errorError)
        return
    }
     
    callback(null, buffer)
}

function process(sharpInstance:Sharp, methodArray: Pipeline, presets: Object):Sharp {

    methodArray.forEach(method => {

        var methodName:string = method[0]
        var args = method.splice(1)

        switch (methodName) {
            case "runPreset":
                var presetName: string = args[0]
                process(sharpInstance, presets[presetName], presets)
                break;
        
            default:
                if ( typeof sharpInstance[methodName] === 'function') {
                    sharpInstance = sharpInstance[methodName](...args)
                } else {
                    console.log("Sharp Method", methodName, "doesn't exist.")
                };
        }
        
        

    })
    
    
    return (sharpInstance)

}
