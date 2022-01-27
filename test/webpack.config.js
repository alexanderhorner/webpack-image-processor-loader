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
                loader: '../dist/index.js',
                options: {
                    pipelines: {
                        "thumbnail": [
                            ["resize", 2000, 300],
                            ["resize", 300, 300],
                            ["runPipeline", "flip"],
                            ["greyscale"],
                            ["runPipeline", "flip"],
                        ],
                        "flip": [
                            ["flip"],
                            ["runPipeline", "flop"]
                        ],
                        "flop": [
                            ["flop"],
                            ["jpeg", { quality: 50}],
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