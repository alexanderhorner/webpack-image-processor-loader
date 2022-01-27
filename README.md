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
  module: {
    rules: [
      // ...
      {
        test: /\.(png|jpe?g|webp|tiff?)/i,
        loader: '../../dist/index.js',
        options: {
          pipelines: {
            thumbnail: [
              ["resize", 720, 1280],
              ["toFormat", "webp", { quality: 60 }]
            ],
            profilepic: [
              ["resize", 256, 256],
              ["sharpen"],
              ["toFormat", "jpg", { quality: 60 }]
            ]
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
