const sequelize  = require ('../db.js')
const {DataTypes}  = require('sequelize');

const UserModel = sequelize.define(
  'users',
  {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requestsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    subscriptionStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Пользователь не заблокирован по умолчанию
    },

},
{
  timestamps: false
});
module.exports = UserModel;