const { OpenAI } = require('openai');
require('dotenv').config();
const Redis = require('ioredis');
const { encodeImageToBase64 } = require('../serviceEncodeimage');
const { updateChatHistory } = require('./updateChatHistory');
const { sendMediaToLogChannel } = require('./sendMediaToLog');
const { getChatHistory } = require('./getChatHistory');
const { processingPhoto } = require('./media-processing/processingPhoto');
const { processingMedia } = require('./media-processing/processingMediaGroup');

const redis = new Redis();
const SYSTEM_MESSAGE = {
    role: "system",
    content: "GPT Role: You are a plant care expert. Response Language: Always respond in Russian. Task: Provide accurate, friendly, and motivating advice on watering, lighting, repotting, diseases, pests, and selecting plants for various conditions (light, humidity, temperature, space). If necessary, ask for more details if the initial information is insufficient. Restriction: Only answer questions about plants. Politely refuse to answer questions on other topics, explaining that you specialize exclusively in plants."
};

const config_mes = " дели текст на абзацы, обязательно добавляй больше emoji по смыслу и пытайся ответ сделать более структурированным, если пользователь прислал фото без текста, не реагируй на него, проси его задать вопрос";

// const deepSeekAI = new OpenAI({
//     baseURL: 'https://api.deepseek.com/beta',
//     apiKey: process.env.DEEPSEEK_API_KEY,
// });

const gpt3AI = new OpenAI({
    baseURL: 'https://api.openai.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

const gpt4AI = new OpenAI({
    baseURL: 'https://api.openai.com/v1', 
    apiKey: process.env.GPT4_API_KEY, 
});

// function mergeConsecutiveMessages(history) {
//     return history.reduce((acc, curr) => {
//         if (acc.length > 0 && acc[acc.length - 1].role === curr.role) {
//             acc[acc.length - 1].content += `\n${curr.content}`;
//         } else {
//             acc.push(curr);
//         }
//         return acc;
//     }, []);
// }

// function ensureProperHistory(history) {
//     const cleanedHistory = history;

//     // Убедимся, что история всегда начинается с системного сообщения
//     if (!cleanedHistory.length || cleanedHistory[0].role !== 'system') {
//         cleanedHistory.unshift(SYSTEM_MESSAGE);
//     }

//     // Если в истории нет сообщений ассистента, добавим дефолтное
//     // const hasAssistantMessage = cleanedHistory.some(msg => msg.role === 'assistant');
//     // if (!hasAssistantMessage) {
//     //     cleanedHistory.push(DEFAULT_ASSISTANT_MESSAGE);
//     // }
//     const lastMessage = cleanedHistory[cleanedHistory.length - 1];

//     if (lastMessage.role === 'assistant') {
//         lastMessage.prefix = true;
//     } else if (lastMessage.role !== 'user') {
//         lastMessage.prefix = true;
//     }

//     return cleanedHistory;
// }

exports.getResponseGPT = async (bot, msg, chatId, username, logChannelId) => {
     const userId = `${chatId}`; 
     try { 
    
        const userMessage = msg.text ||  "";
    const userСaption = msg.caption;
    let imageBase64 = null;
    const isPhotoMessage = !!msg.photo;
    const messageContent = `Чат: ${chatId}\nПользователь: @${username}\nСообщение: ${userMessage}`;
    const mediaGroupId = msg.media_group_id;

  
    let history = await getChatHistory(userId, redis, SYSTEM_MESSAGE);
    await sendMediaToLogChannel(bot, logChannelId, msg, messageContent);

    if (isPhotoMessage) {
        imageBase64 = await processingMedia(redis, mediaGroupId, msg, bot);
        if (imageBase64) {
            const gpt4Response = await gpt4AI.chat.completions.create({
                model: 'gpt-4-turbo',
                messages: [
                    {
                        role: "system",
                        content: "Вы бот-эксперт в ботанике. Ваша задача — анализировать изображения комнатных растений и описывать их особенности и определять название. Опишите растение на фото максимально детально, включая следующие аспекты: 1) Название вида, если возможно, 2) Основные особенности (форма, цвет, текстура листьев, стеблей, цветов), 3) Возможное происхождение (родина растения), 4) Предположительные условия ухода (освещение, полив, температура). Ответ должен быть структурирован и точен. Если на изображении не видно растения или изображение нечёткое, уточните это в ответе.",
                    },
                    {
                        role: 'user',
                        content: [
                            { type: "text", text: "Что на фото?" },
                            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
                        ]
                    },
                ],
            });


            const gpt4Analysis = userСaption ? `Сообщение пользовтеля к описанию фото: ${userСaption} Описание фото:${gpt4Response.choices[0].message.content}` : gpt4Response.choices[0].message.content;
            console.log("Анализ изображения от GPT-4:", gpt4Analysis);

            // history.push({ role: "user", content: gpt4Analysis });  
            const his  = await updateChatHistory(userId, { role: "user", content: gpt4Analysis }, redis, SYSTEM_MESSAGE);
            //  const preparedHistory = his;
          

            const deepseekResponse = await gpt3AI.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages:his,
                // stop:["```"]
            });

            const assistantMessage = { role: "assistant", content: deepseekResponse.choices[0].message.content };
            await updateChatHistory(userId, assistantMessage, redis, SYSTEM_MESSAGE);
            console.log(history)
            console.log(assistantMessage)
            return assistantMessage;
        }
    } else {
       
        console.log("Обрабатываем текст...");      
        const his = await updateChatHistory(userId, { role: "user", content: userMessage + `${config_mes}` }, redis, SYSTEM_MESSAGE);
        console.log(his)
        // const preparedHistory = ensureProperHistory(his);

        const deepseekResponse = await gpt3AI.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: his,
            // stop:["```"]
        });
        
        const assistantMessage = { role: "assistant", content: deepseekResponse.choices[0].message.content };
        await updateChatHistory(userId, assistantMessage, redis, SYSTEM_MESSAGE);
        // console.log(history)
        // console.log(assistantMessage)
        return assistantMessage;


    }
} catch (error) {
    console.error("Ошибка при обработке запроса DeepSeek:", error);
    let history = await getChatHistory(userId, redis, SYSTEM_MESSAGE);
    if (history.length > 0) {
        await redis.del(userId);
        history = [SYSTEM_MESSAGE];  
    }
    await redis.set(userId, JSON.stringify(history), 'EX', 3600);

    // Выводим обновленную историю (можно также вернуть ошибку пользователю)
    console.log("История после удаления последнего сообщения:", history);
    
    // Возвращаем сообщение об ошибке (или можно вернуть пустой объект)
    return { role: "assistant", content: "Произошла ошибка при обработке запроса. Попробуйте снова." };
}
};


