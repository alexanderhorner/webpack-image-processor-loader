const path = require('path');

const config = {
    cache: false,
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    // cache: {
	// 	type: 'filesystem',
	// 	cacheDirectory: '/Users/alexanderhorner/Documents/GitHub/webpack-image-processor-loader/.cache/webpack'
	// },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.(png|jpe?g|webp|tiff?)/i,
                loader: '../../dist/index.js',
                options: {
                    pipelines: {
                        benchmark1: sharp => 
                            sharp.resize(4000, 2000)
                                 .runPipeline("benchmarkOperations")
                                 .toFormat("webp", { quality: 90 }),
                        
                        
                        benchmark2: sharp => 
                            sharp.resize(2000, 1500)
                                 .runPipeline("benchmarkOperations")
                                 .toFormat("webp", { quality: 60 }),
                        
                        
                        benchmark3: sharp => 
                            sharp.resize(4000, 2000)
                                 .runPipeline("benchmarkOperations")
                                 .toFormat("jpeg", { quality: 90 }),
                        
                        benchmark4: sharp => 
                            sharp.resize(2000, 1500)
                                 .runPipeline("benchmarkOperations")
                                 .toFormat("jpeg", { quality: 60 }),
                        
                        benchmarkOperations: sharp =>
                            sharp.flip()
                                 .flop()
                                 .rotate(45)
                                 .sharpen()
                                 .normalise()
                                 .toColorspace("srgb")
                                 .modulate({
                                    brightness: 1.2,
                                    saturation: 1.5
                                 })
                    }
                }
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],   
        fallback: {
            "fs": false
        }
    },
};

module.exports = config