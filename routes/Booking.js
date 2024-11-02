const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Adjust the path according to your project structure
const moment = require('moment-timezone');


// Create a new booking
router.post('/', async (req, res) => {
    const { user_id, showtime_id, seat_numbers, ticket_price, total_price, payment_status } = req.body;

    // Calculate seat count based on the number of elements in the seat_numbers array
    const seat_count = Array.isArray(seat_numbers) ? seat_numbers.length : 0;

    try {
        const booking_date = new Date().toISOString();  // Store in ISO format

        const newBooking = await Booking.create({
            user_id,
            showtime_id,
            seat_count,
            seat_numbers: JSON.stringify(seat_numbers), // Store seat_numbers as a JSON string if it’s an array
            ticket_price,
            total_price,
            booking_date,
            payment_status,
        });
        res.status(201).json(newBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating booking', error });
    }
});

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.findAll();
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});

// Get a booking by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching booking', error });
    }
});

// Update payment status
router.put('/:id/payment-status', async (req, res) => {
    const { id } = req.params;
    const { payment_status } = req.body;

    try {
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.payment_status = payment_status;
        await booking.save();

        res.status(200).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating payment status', error });
    }
});

module.exports = router;
