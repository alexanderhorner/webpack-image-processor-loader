"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string',
        },
    },
};
async function default_1(source) {
    // const options = this.getOptions();
    // validate(schema, options, {
    //     name: 'Example Loader',
    //     baseDataPath: 'options',
    // });
    var callback = this.async();
    var buffer = null;
    // source.toString('hex')
    // try {
    //     var sharpInstance = sharp(source.toString('hex'))
    //     buffer = await sharpInstance.greyscale()
    //                                 .toBuffer()
    // } catch (error) {
    //     var msg = `[Sharp] ${error}`
    //     console.log(msg)
    //     var errorError = new Error(msg)
    //     callback(errorError)
    //     return
    // }
    callback(null, source.toString('utf8'));
}
exports.default = default_1;
//# sourceMappingURL=index.js.map