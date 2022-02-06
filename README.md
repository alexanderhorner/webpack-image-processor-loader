# webpack-image-processor-loader
A webpack loader for processing images.

This loader enable you to process [sharp](https://sharp.pixelplumbing.com/) on images when webpack bundles them.

According to [sharp](https://sharp.pixelplumbing.com/):

> This module supports reading JPEG, PNG, WebP, TIFF, GIF and SVG images.
>
> Output images can be in JPEG, PNG, WebP and TIFF formats as well as uncompressed raw pixel data.

## Install

Install with npm:

```bash
npm install --save-dev webpack-image-processor-loader
```

Install with yarn:

```bash
yarn add --dev webpack-image-processor-loader
```

## Usage

If you only want to process some but not all images use webpack's `oneOf`.

#### webpack.config.js

```javascript
module.exports = {
  // ...
  // IMPORTANT: Don't forget to enable caching!
  //            It's also recommended to use a persistant folder (unlike the default node_modules/.cache/webpack).
  cache: {
    type: 'filesystem',
    cacheDirectory: '/user/tom/persistant_folder/'
  },
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.(png|jpe?g|webp|tiff?)/i,
        loader: 'webpack-image-processor-loader',
        options: {
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
                   .flop()
                   .rotate(45)
                   .sharpen()
                   .normalize()
                   .toColorspace("srgb")
          }
        }
      },
    ],
  },
};

```


### `pipelines`

The `pipelines` option is an object. Each property is one pipeline and the property name is the name of the pipeline. You can call it as an url parameter like this:

```javascript

require('./img/picture.jpg?pipeline=thumbnail')

```

A pipeline is a function that specifies how to process with [sharp](https://sharp.pixelplumbing.com/).

See [sharp's API page](https://sharp.pixelplumbing.com/api-operation) for details.

The function is called with a parameter named `sharp`, it is an object of the same type as the `sharp()`'s in [sharp's API page](https://sharp.pixelplumbing.com/api-operation).

The return type of the function should be an `sharp` object.

### Custom `.runPipeline()` method

The loader adds a custom `.runPipeline()` method to the sharp object. It enables you to run another pipeline function so you dont have to repeat yourself as often.

### file-loader

You can also include every option the [file-loader](https://www.npmjs.com/package/file-loader) provides. See [file-loader's npm page](https://www.npmjs.com/package/file-loader) for details

```javascript
module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.(png|jpe?g|webp|tiff?)/i,
        loader: 'webpack-image-processor-loader',
        options: {
          pipelines: {
            // ...
          },
          name: '[name]-[contenthash].[ext]',
          outputPath: 'images',
          esModule: true
          // For more options see the file-loader package
        }
      },
    ],
  },
};

```