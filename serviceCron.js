const cron = require('node-cron');
const User = require('./models/user');

exports.resetLimitRequest = async () => {
    cron.schedule('0 21 * * *', async () => {
        try {
            console.log('Запуск сброса лимитов запросов');
            await User.update(
                { requestsCount: 0 }, 
                { where: {} }        
            );
            console.log('Лимиты запросов успешно сброшены!');
        } catch (error) {
            console.error('Ошибка при сбросе лимитов:', error.message || error);
        }
    });
}
    