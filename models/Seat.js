const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');
const Showtime = require('./Showtime');

class Seat extends Model { }

Seat.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    row: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    column: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isOccupied: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    showtimeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Showtime,
            key: 'showtime_id',
        },
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Seat',
    tableName: 'seats',
    timestamps: false,
});

// Associations
Showtime.hasMany(Seat, { foreignKey: 'showtimeId', onDelete: 'CASCADE' });
Seat.belongsTo(Showtime, { foreignKey: 'showtimeId' });

module.exports = Seat;
