const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');
const sequelize = require('./db.js');
const User = require('./models/user.js')
const { pay, startButtons } = require('./options.js')
require('dotenv').config();
const Redis = require('ioredis');
const { checkAndUpdateRequestLimit } = require('./serviceCheckLimits.js');
const { encodeImageToBase64 } = require('./serviceEncodeimage.js');
const { resetLimitRequest } = require('./serviceCron.js');
const { startBot } = require('./comandStart.js');
const { getResponseGPT } = require('./openaiServices.js/openAI.js');

const tgBotToken = process.env.TG_BOT_TOKEN;
const logChannelId = process.env.LOG_CHANNEL_ID;
const subscriptionChannelId = process.env.SUBSCRIPTION_CHANNEL_ID;
const redis = new Redis();
const bot = new TelegramBot(tgBotToken, { polling: true });

resetLimitRequest();


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username || 'Unknown';
    const userId = msg.from.id.toString();
    const userMessage = msg.text || msg.caption || 'Сообщение отсутствует';
    const mediaGroupId = msg.media_group_id;
    // console.log("Содержимое msg:", JSON.stringify(msg, null, 2));

    try {
        typingInterval = setInterval(async () => {
            await bot.sendChatAction(chatId, 'typing');
        }, 4000);

        startBot(bot,userId,subscriptionChannelId,chatId,userMessage,username)
        // await bot.sendMessage(chatId, '🤖 Работа бота приостановлена. Проводятся технические работы');
//         const user = await User.findByPk(userId)
//         const isSubscribed = await checkChatMember(bot, subscriptionChannelId, userId, chatId);
//         if (!isSubscribed) {
//             await bot.sendMessage(
//                 chatId,
// `   Для дальнейшего использования бота, пожалуйста, подпишитесь на наш канал.

// ⭐️ Мы просим так сделать для защиты от ботов и за это мы дарим вам *5 бесплатных запросов в ChatGPT*. Для использования бота подпишитесь на канал: [Наш канал](https://t.me/${subscriptionChannelId})`,
//                  {parse_mode: 'Markdown', 
//                  reply_markup: startButtons.reply_markup,}
//             );
//             return;
            
//         }
        
        const isAllowed = await checkAndUpdateRequestLimit(userId, username);
        if (!isAllowed) {
            // await bot.sendMessage(chatId, '🤖 Ваш лимит запросов исчерпан. Оплатите подписку, чтобы продолжить использование бота.', pay);
            await bot.sendMessage(chatId, '🤖 Вы достигли лимита запросов (5 в сутки). Попробуйте снова завтра.')
            return;
        }
        await bot.sendMessage(chatId, "🤖 Думаю над ответом...");
console.log(msg.message_id)
      const response  = await getResponseGPT(bot,msg,chatId,username,logChannelId, userId)

        const botResponse = response.content.trim().replace(/[#*-]/g, '');
    if(botResponse) {
        await bot.sendMessage(chatId, botResponse);
    } else {
        await bot.sendMessage(chatId, "Повтори пожалуйста)");
    }
        
        await bot.sendMessage(logChannelId, `Чат: ${chatId}\nОтвет бота:\n ${botResponse}`);
        await bot.sendMessage(logChannelId, `Чат: ${chatId}\nОтвет бота:\n ()`);
        await bot.sendMessage(logChannelId, `Чат: ${chatId}\nПользователь: @${username} (${userId})\nСообщение: ${userMessage}`);
    } catch (error) {
        const errorMessage = error.message || error.toString() || 'Неизвестная ошибка';
        console.error('Ошибка:', errorMessage);
        await bot.sendMessage(chatId, '🤖 Произошла ошибка при обработке вашего запроса. Попробуйте позже.');
        await bot.sendMessage(logChannelId, `Чат: ${chatId}\nОтвет бота:\n ${errorMessage}`);
    } finally {
        // Останавливаем периодическое обновление состояния
        clearInterval(typingInterval);
    }
});

// bot.on('callback_query', async msg => {
//     try {
//         const data = msg.data;
//         const chatId = msg.message.chat.id;
//         const messageId = msg.message.message_id;
//         const userId = msg.from.id;

//         if (data === 'check') {

//             const isSubscribed = await checkChatMember(bot, subscriptionChannelId, userId, chatId);
//             if (isSubscribed) {
//                 await bot.editMessageText("Просто задайте вопрос или отправьте фото — я помогу! 💚",
//                 {
//                 chat_id:chatId,
//                 message_id:messageId,
//                  });
//                 return;
//             }
//             await bot.editMessageText(
// `❌ Вы не подписаны на [наш канал](https://t.me/${subscriptionChannelId}) `,
//                 {
//                 chat_id:chatId,
//                 message_id:messageId,
//                 parse_mode: 'Markdown', 
//                 reply_markup: startButtons.reply_markup,}
//             );
//             return;

//         }

//     } catch (error) {
//         const errorMessage = error.message || error.toString() || 'Неизвестная ошибка';
//         console.error('Ошибка:', errorMessage);
//         await bot.sendMessage(logChannelId, `\nОтвет бота:\n ${errorMessage}`);
//     }
// });

// console.log('Бот запущен и готов к работе!');
const startServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Connected to database...');
    } catch (error) {
        console.error('Отсутствует подключение к БД', error);
    }
};

startServer();