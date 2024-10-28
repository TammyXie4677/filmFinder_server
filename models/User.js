const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');

class User extends Model {}

User.init({
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users', 
    timestamps: false, 
});

module.exports = User;
