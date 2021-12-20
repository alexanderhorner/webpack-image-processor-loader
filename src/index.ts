import { urlToRequest } from 'loader-utils';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/ValidationError';
import { LoaderContext, LoaderDefinition, LoaderDefinitionFunction, LoaderModule, LoaderTargetPlugin, SourceMapDevToolPlugin } from 'webpack';

import sharp from 'sharp'

const schema:Schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string',
        },
    },
};

export default async function (this:LoaderContext<any>, source: Buffer) {
    // const options = this.getOptions();

    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });

    var callback = this.async();

    var buffer:Buffer | null = null
    
    // source.toString('hex')

    // try {
    //     var sharpInstance = sharp(source.toString('hex'))
    //     buffer = await sharpInstance.greyscale()
    //                                 .toBuffer()
    // } catch (error) {
    //     var msg = `[Sharp] ${error}`

    //     console.log(msg)
        
    //     var errorError = new Error(msg)
    //     callback(errorError)
    //     return
    // }
     
    callback(null, source.toString('utf8'))
}
