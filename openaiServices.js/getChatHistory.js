exports.getChatHistory = async(userId,redis,SYSTEM_MESSAGE) => {
    if (!redis) {
        console.error("Redis не инициализирован.");
        return;
    }
    let history = await redis.get(userId);
    if (history) {
        return JSON.parse(history);
    }
    return [SYSTEM_MESSAGE];
}