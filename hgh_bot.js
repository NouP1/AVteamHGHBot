const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');
const sequelize = require('./db.js');
const User = require('./models/user.js')
require('dotenv').config();
const { checkAndUpdateRequestLimit } = require('./serviceCheckLimits.js');
const { encodeImageToBase64 } = require('./serviceEncodeimage.js');
const { resetLimitRequest } = require('./serviceCron.js');

const tgBotToken = process.env.TG_BOT_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;
const logChannelId = '-1002452793233';

const openai = new OpenAI({
    apiKey: openaiApiKey,
});

const SYSTEM_MESSAGE = {
    role: "system",
    content: "GPT Role: You are a plant care expert. Response Language: Always respond in Russian. Task: Provide accurate, friendly, and motivating advice on watering, lighting, repotting, diseases, pests, and selecting plants for various conditions (light, humidity, temperature, space). If necessary, ask for more details if the initial information is insufficient. Restriction: Only answer questions about plants. Politely refuse to answer questions on other topics, explaining that you specialize exclusively in plants. Do not use the * and # symbols in your answers."
};

const bot = new TelegramBot(tgBotToken, { polling: true });

resetLimitRequest();

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username || 'Unknown';
    const userId = msg.from.id.toString();
    const userMessage = msg.text || msg.caption || 'Сообщение отсутствует';
    let imageBase64 = null;

    try {
        if (userMessage === '/start') {
            const user = await User.findByPk(userId)
            if (!user) {
                await bot.sendMessage(chatId, 'Привет! Просто задайте вопрос или отправьте фото — я помогу! 💚');
                return
            }

        }
        await bot.sendMessage(chatId, "🤖 Думаю над ответом...");
        const isAllowed = await checkAndUpdateRequestLimit(userId);
        if (!isAllowed) {
            await bot.sendMessage(chatId, '🤖 Вы достигли лимита запросов (5 в сутки). Попробуйте снова завтра.');
            return;
        }


        let messageContent = `Чат: ${chatId}\nПользователь: @${username} (${userId})\nСообщение: ${userMessage}`;

        if (msg.photo) {
            const photoFileId = msg.photo[msg.photo.length - 1].file_id;
            await bot.sendPhoto(logChannelId, photoFileId, { caption: messageContent });
        }

        if (msg.video) {
            const videoFileId = msg.video.file_id;
            await bot.sendVideo(logChannelId, videoFileId, { caption: messageContent });
        }

        if (msg.voice) {
            const voiceFileId = msg.voice.file_id;
            await bot.sendVoice(logChannelId, voiceFileId, { caption: messageContent });
        }
        if (!msg.photo && !msg.video && !msg.voice) {
            await bot.sendMessage(logChannelId, messageContent);
        }


        if (msg.photo) {
            const photo = msg.photo[msg.photo.length - 1];
            const fileId = photo.file_id;

            const imageUrl = await bot.getFileLink(fileId);
            imageBase64 = await encodeImageToBase64(imageUrl);
        }
        const messages = [
            SYSTEM_MESSAGE,
            { role: "user", content: userMessage }, // Текстовое сообщение
        ];

        if (imageBase64) {
            messages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text: userMessage + "дели текст на абзацы, добавляй большей emoji по смыслу и пытайся сделать более структурированным, постарайся предложить варианты по решению проблемы",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${imageBase64}`,
                        },
                    },
                ],
            });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo", // Убедитесь, что модель поддерживает обработку изображений
            messages,
        });

        const botResponse = response.choices[0].message.content.trim().replace(/[#*]/g, '');
        await bot.sendMessage(chatId, botResponse);
        await bot.sendMessage(logChannelId, `Чат: ${chatId}\nОтвет бота:\n ${botResponse}`);
    } catch (error) {
        console.error('Ошибка:', error.message || error);
        await bot.sendMessage(chatId, '🤖 Произошла ошибка при обработке вашего запроса. Попробуйте позже.');
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