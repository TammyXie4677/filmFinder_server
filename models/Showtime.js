const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');
const Movie = require('./Movie');

class Showtime extends Model { }

Showtime.init({
    showtime_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    movie_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Movie,
            key: 'movie_id',
        },
        allowNull: false,
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Showtime',
    tableName: 'showtimes',
    timestamps: false,
});

// Associations
Movie.hasMany(Showtime, { foreignKey: 'movie_id', onDelete: 'CASCADE' });
Showtime.belongsTo(Movie, { foreignKey: 'movie_id' });

module.exports = Showtime;
