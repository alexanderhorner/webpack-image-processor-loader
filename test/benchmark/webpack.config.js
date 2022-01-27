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
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
            {
                test: /\.(png|jpe?g|webp|tiff?)$/i,
                loader: '../../dist/index.js',
                options: {
                    pipelines: {
                        benchmark: [
                            ["resize", 4000, 4000],
                            ["runPipeline", "benchmarkOperations"],
                            ["toFormat", "webp", { quality: 90 }]
                        ],
                        benchmark2: [
                            ["resize", 2000, 2000],
                            ["runPipeline", "benchmarkOperations"],
                            ["toFormat", "webp", { quality: 60 }]
                        ],
                        benchmark3: [
                            ["resize", 4000, 4000],
                            ["runPipeline", "benchmarkOperations"],
                            ["toFormat", "jpeg", { quality: 90 }]
                        ],
                        benchmark4: [
                            ["resize", 2000, 2000],
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
        fallback: {
            "fs": false
        }
    },
};

module.exports = config







const test = {
    pipeline: {
        default: {
            outputVersions: [
                [
                    ["resize", 4000, 4000],
                    ["flip"],
                    ["flop"],
                    ["toFormat", "webp", { quality: 80 }]
                ],
                [
                    ["resize", 200, 2000],
                    ["saturate", "130"],
                    ["toFormat", "jpeg", { quality: 80 }]
                ],
            ]
        },
        thumbnail: {
            outputVersions: [
                [
                    ["resize", 4000, 4000],
                    ["flip"],
                    ["flop"],
                    ["toFormat", "webp", { quality: 80 }]
                ],
                [
                    ["resize", 200, 2000],
                    ["saturate", "130"],
                    ["toFormat", "jpeg", { quality: 80 }]
                ],
            ]
        }
    }
}