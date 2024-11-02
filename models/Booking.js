const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');
const User = require('./User');
const Showtime = require('./Showtime');
const Seat = require('./Seat');

class Booking extends Model { }

Booking.init({
    booking_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id',
        },
        allowNull: false,
    },
    showtime_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Showtime,
            key: 'showtime_id',
        },
        allowNull: false,
    },
    seat_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    seat_numbers: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ticket_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    booking_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    payment_status: {
        type: DataTypes.ENUM('paid', 'unpaid'),
        allowNull: false,
        defaultValue: 'unpaid',
    },
}, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: false,
});

// Associations
User.hasMany(Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Showtime.hasMany(Booking, { foreignKey: 'showtime_id', onDelete: 'CASCADE' });
Booking.belongsTo(Showtime, { foreignKey: 'showtime_id' });

// If you want to associate Seat with Booking
// Ensure that your Seat model's seat_id is compatible with Booking
// This association can be adjusted according to your application logic
// Booking.hasMany(Seat, { foreignKey: 'seat_id', onDelete: 'CASCADE' }); // Optional

module.exports = Booking;
