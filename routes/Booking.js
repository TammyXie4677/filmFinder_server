const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Seat = require('../models/Seat');
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
            seat_numbers: JSON.stringify(seat_numbers), 
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

// Get all bookings for a specific user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    console.log(`Received request to fetch bookings for user ID: ${userId}`); // Log the user ID

    try {
        const bookings = await Booking.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Showtime,
                    include: [
                        {
                            model: Movie,
                            attributes: ['title'], // Fetch movie title
                        },
                    ],
                    attributes: ['start_time', 'price'], // Fetch showtime details
                },
            ],
        });

        console.log(`Bookings found: ${JSON.stringify(bookings)}`); 

        // If no bookings are found, log that as well
        if (bookings.length === 0) {
            console.log(`No bookings found for user ID: ${userId}`);
        }

        const formattedBookings = bookings.map(booking => ({
            bookingId: booking.booking_id,
            movieName: booking.Showtime.Movie.title,
            showtime: booking.Showtime.start_time,
            seatCount: booking.seat_count,
            seatNumbers: JSON.parse(booking.seat_numbers),
            totalPrice: booking.total_price,
            paymentStatus: booking.payment_status,
        }));

        console.log(`Formatted bookings to return: ${JSON.stringify(formattedBookings)}`); 

        res.status(200).json(formattedBookings);
    } catch (error) {
        console.error('Error occurred while fetching user bookings:', error); 
        res.status(500).json({ message: 'Error fetching user bookings', error });
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

// Delete a booking by ID and release the seats
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // First, find the booking to get the seat numbers
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Parse the seat numbers from the booking
        const seatNumbers = JSON.parse(booking.seat_numbers);
        const seatCount = seatNumbers.length; // Number of seats being released

        // Release the seats by updating their status
        await Seat.update(
            { is_occupied: false }, // Set is_occupied to false
            {
                where: {
                    showtime_id: booking.showtime_id, // Ensure to target the right showtime
                    seat_number: seatNumbers // Update based on seat numbers
                }
            }
        );

        // Update seat availability in the Showtime model
        await Showtime.increment(
            { seat_availability: seatCount }, // Increase availability by the number of seats released
            {
                where: {
                    showtime_id: booking.showtime_id // Ensure to update the correct showtime
                }
            }
        );

        // Now, delete the booking
        await Booking.destroy({
            where: { booking_id: id } 
        });

        res.status(204).send(); 
    } catch (error) {
        console.error('Error occurred while deleting booking:', error);
        res.status(500).json({ message: 'Error deleting booking', error });
    }
});




module.exports = router;
