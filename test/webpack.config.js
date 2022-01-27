const { normalize } = require('path');
const path = require('path');

const config = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
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
                test: /\.(png|jpe?g|webp|tiff?)$/i,
                loader: '../dist/index.js',
                options: {
                    pipelines: {
                        benchmark: sharp => sharp.resize(1000, 1000).toFormat("webp", { quality: 90 }),

                        benchmark2: sharp => 
                            sharp.resize(500, 500)
                                 .toFormat("webp", { quality: 60 }),

                        benchmark3: sharp => 
                            sharp.resize(1000, 1000)
                                 .toFormat("jpeg", { quality: 90 }),

                        benchmark4: sharp => 
                            sharp.resize(500, 500)
                                 .toFormat("jpeg", { quality: 60 }),
                                 
                        benchmarkOperations: sharp => 
                            sharp.flip()
                                 .flop("jpeg", { quality: 90 })
                                 .rotate(45)
                                 .sharpen()
                                 .normalize()
                                 .toColorspace("srgb")
                    }
                }
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};

module.exports = config