const REDIS_TTL = 60 * 60 * 24; // TTL для Redis (1 день)

const { getChatHistory } = require('./getChatHistory');
const {compressContent} = require('./compressionhistory-processing/compressinghistory');

exports.updateChatHistory = async (userId, newMessage, redis, SYSTEM_MESSAGE, maxHistoryLength = 10) => {
    try {

   
   let history = await getChatHistory(userId, redis, SYSTEM_MESSAGE);

    let lastMessage = history[history.length - 1];
    if (history) {
    
            if(lastMessage && lastMessage.role !== 'system') {
                
                 const compressed = await compressContent(lastMessage.content);
                 lastMessage.content = compressed;
                 console.log(lastMessage.content)
                 console.log(history)
            }
            
               
                // message.content = compressed;
        //         // console.log(message.content) // Заменяем длинное сообщение на сжатое
        //     }
        // }

    if (!history.length || history[0].role !== 'system') {
        history.unshift(SYSTEM_MESSAGE);
    }

    if (history.length > 1 && history[history.length - 1].role === newMessage.role) {
        console.log('Удаляем последнее сообщение с одинаковой ролью...');
        history.pop(); 
    }

    if (history.length >= maxHistoryLength) {
        console.log('История переполнена, создаем новую...');
        await redis.del(userId);
        history = [SYSTEM_MESSAGE, { role: 'user', content: lastMessage.content }];
         
    } else {
        history.push(newMessage); 
    }
    console.log(history)
    await redis.set(userId, JSON.stringify(history), 'EX', REDIS_TTL);
    return history;
} 
}catch(error) {
        console.error("Ошибка")
    }
};