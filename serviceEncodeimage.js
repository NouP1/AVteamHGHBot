const fetch = require('node-fetch');
exports.encodeImageToBase64 = async(url) => {
    const response = await fetch(url);
    const buffer = await response.buffer();
    return buffer.toString('base64');
}