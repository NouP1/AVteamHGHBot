const sequelize  = require ('../db.js')
const {DataTypes}  = require('sequelize');

const UserModel = sequelize.define(
  'users',
  {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    requestsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
},
{
  timestamps: false
});
module.exports = UserModel;