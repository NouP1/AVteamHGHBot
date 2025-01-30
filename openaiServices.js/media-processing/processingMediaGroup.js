const { processingPhoto } = require('./processingPhoto');

exports.processingMedia = async (redis, mediaGroupId, msg, bot) => {
    if (mediaGroupId) {
   
                if (msg.photo) {
                    const imageBase64 = await processingPhoto(bot, msg);
                    return imageBase64;
                }
      
    } else {
            if (msg.photo) {
                const imageBase64 = await processingPhoto(bot, msg);
                return imageBase64;
            }
    }
};