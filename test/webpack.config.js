const { normalize } = require('path');
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
				test: /\.(png|jpe?g|webp|tiff?)$/i,
				loader: '../dist/index.js',
				options: {
					outputDir: 'images',
					pipelines: {
						thumbnail: sharp => sharp.resize(1280, 720).toFormat("jpeg"),

						backgroundSmall: sharp =>
							sharp.resize(500, 500)
								 .runPipeline("background")
								 .toFormat("webp", { quality: 60 }),

						backgroundBig: sharp =>
							sharp.resize(1000, 1000)
								 .runPipeline("background")
								 .toFormat("jpeg", { quality: 90 }),

						background: sharp =>
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