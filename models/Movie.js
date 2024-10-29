const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');

class Movie extends Model { }

Movie.init({
    movie_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    release_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cover_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Movie',
    tableName: 'movies',
    timestamps: false,
});

module.exports = Movie;
