const express = require('express');
const router = express.Router();
const { Booking } = require('../models/Booking');
const { User } = require('../models/User');
const { Showtime } = require('../models/Showtime');
const { Movie } = require('../models/Movie');

// Route to create a new booking
router.post('/create', async (req, res) => {
    const { user_id, showtime_id, seat_numbers, individual_price, total_price, payment_status } = req.body;

    try {
        const booking = await Booking.create({
            user_id,
            showtime_id,
            seat_numbers,
            individual_price,
            total_price,
            payment_status,
            booking_date: new Date(),
        });
        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Route to get booking summary by ID
router.get('/:bookingId', async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findOne({
            where: { booking_id: bookingId },
            include: [
                { model: User, attributes: ['email'] },
                { model: Showtime, include: [{ model: Movie, attributes: ['title'] }] }
            ],
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

module.exports = router;
