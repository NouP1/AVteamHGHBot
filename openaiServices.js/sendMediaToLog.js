exports.sendMediaToLogChannel = async(bot, logChannelId, msg, messageContent ) => {
    if (msg.photo) {
        const photoFileId = msg.photo[msg.photo.length - 1].file_id;
        await bot.sendPhoto(logChannelId, photoFileId, { caption: messageContent });
    } else if (msg.video) {
        const videoFileId = msg.video.file_id;
        await bot.sendVideo(logChannelId, videoFileId, { caption: messageContent });
    } else if (msg.voice) {
        const voiceFileId = msg.voice.file_id;
        await bot.sendVoice(logChannelId, voiceFileId, { caption: messageContent });
    } else {
        await bot.sendMessage(logChannelId, messageContent);
    }
}