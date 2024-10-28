const { Sequelize } = require('sequelize');
const config = require('./config/config').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
