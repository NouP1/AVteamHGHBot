const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');
const sequelize = require('./db.js');
const User = require('./models/user.js')
const { pay, startButtons } = require('./options.js')
require('dotenv').config();
const { checkAndUpdateRequestLimit } = require('./serviceCheckLimits.js');
const { encodeImageToBase64 } = require('./serviceEncodeimage.js');
const { resetLimitRequest } = require('./serviceCron.js');
const { startBot } = require('./comandStart.js');

const tgBotToken = process.env.TG_BOT_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;
// const logChannelId = '-1002452793233';
const logChannelId = process.env.LOG_CHANNELID;
const subscriptionChannelId = process.env.SUBSCRIPTION_CHANNEL_ID;

const openai = new OpenAI({
    apiKey: openaiApiKey,
});

const SYSTEM_MESSAGE = {
    role: "system",
    content: "GPT Role: You are a plant care expert. Response Language: Always respond in Russian. Task: Provide accurate, friendly, and motivating advice on watering, lighting, repotting, diseases, pests, and selecting plants for various conditions (light, humidity, temperature, space). If necessary, ask for more details if the initial information is insufficient. Restriction: Only answer questions about plants. Politely refuse to answer questions on other topics, explaining that you specialize exclusively in plants."
};

const bot = new TelegramBot(tgBotToken, { polling: true });

const checkChatMember = async (bot, subscriptionChannelId, userId, chatId) => {
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

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username || 'Unknown';
    const userId = msg.from.id.toString();
    const userMessage = msg.text || msg.caption || 'Сообщение отсутствует';
    let imageBase64 = null;

    try {

        // startBot(bot,userId,subscriptionChannelId,chatId,userMessage,checkChatMember)
        await bot.sendMessage(chatId, '🤖 Работа бота приостановлена.');
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
        
//         const isAllowed = await checkAndUpdateRequestLimit(userId, username);
//         if (!isAllowed) {
//             await bot.sendMessage(chatId, '🤖 Ваш лимит запросов исчерпан. Оплатите подписку, чтобы продолжить использование бота.', pay);
//             return;
//         }
//         await bot.sendMessage(chatId, "🤖 Думаю над ответом...");

        // let messageContent = `Чат: ${chatId}\nПользователь: @${username} (${userId})\nСообщение: ${userMessage}`;

        // if (msg.photo) {
        //     const photoFileId = msg.photo[msg.photo.length - 1].file_id;
        //     await bot.sendPhoto(logChannelId, photoFileId, { caption: messageContent });
        // }

        // if (msg.video) {
        //     const videoFileId = msg.video.file_id;
        //     await bot.sendVideo(logChannelId, videoFileId, { caption: messageContent });
        // }

        // if (msg.voice) {
        //     const voiceFileId = msg.voice.file_id;
        //     await bot.sendVoice(logChannelId, voiceFileId, { caption: messageContent });
        // }
        // if (!msg.photo && !msg.video && !msg.voice) {
        //     await bot.sendMessage(logChannelId, messageContent);
        // }


        // if (msg.photo) {
        //     const photo = msg.photo[msg.photo.length - 1];
        //     const fileId = photo.file_id;

        //     const imageUrl = await bot.getFileLink(fileId);
        //     imageBase64 = await encodeImageToBase64(imageUrl);
        // }
        // const messages = [
        //     SYSTEM_MESSAGE,
        //     { role: "user", content: userMessage }, // Текстовое сообщение
        // ];

        // if (imageBase64) {
        //     messages.push({
        //         role: "user",
        //         content: [
        //             {
        //                 type: "text",
        //                 text: userMessage + "дели текст на абзацы, добавляй большей emoji по смыслу и пытайся сделать более структурированным, постарайся предложить варианты по решению проблемы",
        //             },
        //             {
        //                 type: "image_url",
        //                 image_url: {
        //                     url: `data:image/jpeg;base64,${imageBase64}`,
        //                 },
        //             },
        //         ],
        //     });
        // }

        // const response = await openai.chat.completions.create({
        //     model: "gpt-4-turbo", // Убедитесь, что модель поддерживает обработку изображений
        //     messages,
        // });

        // const botResponse = response.choices[0].message.content.trim().replace(/[#*]/g, '');
        // await bot.sendMessage(chatId, botResponse);
        // await bot.sendMessage(logChannelId, `Чат: ${chatId}\nОтвет бота:\n ${botResponse}`);
        // await bot.sendMessage(logChannelId, `Чат: ${chatId}\nОтвет бота:\n ()`);
        await bot.sendMessage(logChannelId, `Чат: ${chatId}\nПользователь: @${username} (${userId})\nСообщение: ${userMessage}`);
    } catch (error) {
        const errorMessage = error.message || error.toString() || 'Неизвестная ошибка';
        console.error('Ошибка:', errorMessage);
        await bot.sendMessage(chatId, '🤖 Произошла ошибка при обработке вашего запроса. Попробуйте позже.');
        await bot.sendMessage(logChannelId, `Чат: ${chatId}\nОтвет бота:\n ${errorMessage}`);
    }
});
bot.on('callback_query', async msg => {
    try {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const messageId = msg.message.message_id;
        const userId = msg.from.id;

        if (data === 'check') {

            const isSubscribed = await checkChatMember(bot, subscriptionChannelId, userId, chatId);
            if (isSubscribed) {
                await bot.editMessageText("Просто задайте вопрос или отправьте фото — я помогу! 💚",
                {
                chat_id:chatId,
                message_id:messageId,
                 });
                return;
            }
            await bot.editMessageText(
`❌ Вы не подписаны на [наш канал](https://t.me/${subscriptionChannelId}) `,
                {
                chat_id:chatId,
                message_id:messageId,
                parse_mode: 'Markdown', 
                reply_markup: startButtons.reply_markup,}
            );
            return;

        }

    } catch (error) {
        const errorMessage = error.message || error.toString() || 'Неизвестная ошибка';
        console.error('Ошибка:', errorMessage);
        await bot.sendMessage(logChannelId, `\nОтвет бота:\n ${errorMessage}`);
    }
});

console.log('Бот запущен и готов к работе!');
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