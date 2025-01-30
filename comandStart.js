const User = require('./models/user')
const {startButtons} = require('./options.js')

exports.startBot = async(bot,userId,subscriptionChannelId,chatId,userMessage,checkChatMember,username) => {
    if (userMessage === '/start') {
        const user = await User.findByPk(userId)
        if(!user) {
            await User.create({ userId: userId, username: `@${username}`});
        }
        if (user && user.isBlocked) {
           await bot.sendMessage(chatId, '🤖 Работа бота приостановлена.', pay);
            return;
        }
    
        const isSubscribed = await checkChatMember(bot, subscriptionChannelId, userId, chatId);
        if (!isSubscribed) {
            await bot.sendMessage(
                chatId,
    `
    Привет!
    ❤️ Я — твой главный помощник в жизни, который ответит на любой вопрос, на тему растений!
    
    Для дальнейшего использования бота, пожалуйста, подпишитесь на наш канал.
    
    ⭐️ Мы просим так сделать для защиты от ботов и за это мы дарим вам *5 бесплатных запросов в ChatGPT*. Для использования бота подпишитесь на канал: [Наш канал](https://t.me/${subscriptionChannelId})`,
                 {parse_mode: 'Markdown', 
                 reply_markup: startButtons.reply_markup,}
            );
            return;
        }
    
        if (!user) {
            await bot.sendMessage(chatId, 'Привет! Просто задайте вопрос или отправьте фото — я помогу! 💚');
            return
        }
    
    }
}
