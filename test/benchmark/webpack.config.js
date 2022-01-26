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
                loader: '../../dist/index.js',
                options: {
                    presets: {
                        "thumbnail": [
                            ["resize", 4000, 4000],
                            ["flip"],
                            ["flop"],
                            ["toFormat", "jpeg", { quality: 80 }]
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
    preset: {
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