const {encodeImageToBase64} = require('../../serviceEncodeimage')
exports.processingPhoto = async(bot,msg) => {
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;
    const imageUrl = await bot.getFileLink(fileId);
    const imageBase64 = await encodeImageToBase64(imageUrl);
    return imageBase64;
}
