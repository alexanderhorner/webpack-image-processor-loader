import { urlToRequest } from 'loader-utils';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/ValidationError';
import { LoaderContext } from 'webpack';

import queryString from 'query-string'
const { Worker } = require('worker_threads')


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

    runWorker(source, pipelineName, options.pipelines).then(data => {
        callback(null,  data)
    }).catch(error => {
        callback(error)
    })

    // try {
    //     buffer = await runWorker(source, pipelineName, options.pipelines)
    // } catch (error) {
        
    // }

    // callback(null,  buffer)
    // callback(null,  `export default ${JSON.stringify(buffer)}`)
}

function runWorker(source: Buffer, pipelineName: string, pipelines: Object) {
    
    const workerData = {
        source: source,
        pipelineName: pipelineName,
        pipelines: pipelines
    }

    const worker = new Worker('/Users/alexanderhorner/Documents/GitHub/webpack-image-processor-loader/dist/worker.js', { workerData: workerData });


    return new Promise((resolve, reject) => {
        
        worker.on('message', (result:Buffer) => {
            resolve(Buffer.from(result, 'utf8'))
        })
    
        worker.on('error', (error: string) => {
            reject(new Error(error));
        })
    
        worker.on('exit', (code: number) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with  ${code} exit code`))
            }
            reject(new Error(`Worker exited too early`))
        })
    })

    
}