exports.checkChatMember = async (bot, subscriptionChannelId, userId, chatId) => {
    try {
        const chatMember = await bot.getChatMember(subscriptionChannelId, userId);
        if (
            chatMember.status !== 'member' &&
            chatMember.status !== 'administrator' &&
            chatMember.status !== 'creator'
        ) {

            return false;
        }
        return true;
    } catch (error) {
        console.error('Ошибка при проверке подписки:', error.message || error);
        return false;
    }
};