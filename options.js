require('dotenv').config();
const subscriptionChannelId = process.env.SUBSCRIPTION_CHANNEL_ID;

module.exports = { 
    pay:{
        reply_markup: JSON.stringify({ 
          inline_keyboard: [
            [{text:'💳 Оплатить подписку',url:'https://www.google.com'}]
          
          ]
        })
      },
      startButtons:{
        reply_markup: JSON.stringify({ 
          inline_keyboard: [
            [{text:'✅ Подписаться',url:`https://t.me/SUBSCRIPTION_CHANNEL`}],
            [{text:'🚀 Проверить подписку',callback_data:'check'}]
          ]
        })
      },
    }