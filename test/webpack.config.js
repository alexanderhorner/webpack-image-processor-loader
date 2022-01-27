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
                        benchmark: [
                            ["resize", 1000, 1000],
                            ["runPipeline", "benchmarkOperations"],
                            ["toFormat", "webp", { quality: 90 }]
                        ],
                        benchmark2: [
                            ["resize", 500, 500],
                            ["runPipeline", "benchmarkOperations"],
                            ["toFormat", "webp", { quality: 60 }]
                        ],
                        benchmark3: [
                            ["resize", 1000, 1000],
                            ["runPipeline", "benchmarkOperations"],
                            ["toFormat", "jpeg", { quality: 90 }]
                        ],
                        benchmark4: [
                            ["resize", 500, 500],
                            ["runPipeline", "benchmarkOperations"],
                            ["toFormat", "jpeg", { quality: 60 }]
                        ],
                        benchmarkOperations: [
                            ["flip"],
                            ["flop"],
                            ["rotate", 45],
                            ["sharpen"],
                            ["normalise"],
                            ["toColorspace", "srgb"],
                        ]
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