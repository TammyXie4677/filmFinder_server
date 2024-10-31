const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');
const Showtime = require('./Showtime');

class Seat extends Model { }

Seat.init({
    seat_id: {
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
    showtime_id: {
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
Showtime.hasMany(Seat, { foreignKey: 'showtime_id', onDelete: 'CASCADE' });
Seat.belongsTo(Showtime, { foreignKey: 'showtime_id' });

module.exports = Seat;
