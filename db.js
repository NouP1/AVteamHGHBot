const { Sequelize} = require('sequelize');
module.exports =  new Sequelize({
  dialect: 'sqlite',
  storage: 'users_hghbot.db',
});