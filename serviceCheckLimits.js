const User = require('./models/user.js')

exports.checkAndUpdateRequestLimit = async(userId) => {
    const user = await User.findByPk(userId);
    if (user) {
        if (user.requestsCount >= 5) {
            return false; // Лимит превышен
        }
        
        user.requestsCount += 1;
        await user.save();
        return true; // Лимит не превышен
    }
    await User.create({ userId: userId, requestsCount: 1 });
    return true;
};

