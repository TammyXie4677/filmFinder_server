const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime'); // Add this line to import the Showtime model

// Get occupied seats for a showtime
router.get('/occupied/:showtimeId', async (req, res) => {
    try {
        const occupiedSeats = await Seat.findAll({
            where: {
                showtime_id: req.params.showtimeId,
                is_occupied: true,
            },
        });
        res.json(occupiedSeats);
    } catch (error) {
        console.error('Error fetching occupied seats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Reserve seat
router.post('/', async (req, res) => {
    const { showtime_id, selectedSeats } = req.body;

    try {
        // Validate inputs
        if (!showtime_id || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
            return res.status(400).json({ error: 'Showtime ID and selected seats are required' });
        }

        // Check if the showtime exists
        const showtime = await Showtime.findByPk(showtime_id);
        if (!showtime) {
            return res.status(404).json({ error: 'Showtime not found' });
        }

        // Check seat availability
        const newAvailability = showtime.seat_availability - selectedSeats.length;
        if (newAvailability < 0) {
            return res.status(400).json({ error: 'Not enough seats available' });
        }

        // Prepare seat data for insertion
        const seatsToInsert = selectedSeats.map(seat_number => ({
            showtime_id, // Ensure the showtime_id is correct
            seat_number, // Use the parameter correctly
            is_occupied: true // Mark seats as occupied
        }));

        // Insert or update seat data in the database
        await Seat.bulkCreate(seatsToInsert, { updateOnDuplicate: ['is_occupied'] });

        // Update the showtime with the new availability
        await showtime.update({ seat_availability: newAvailability });

        res.status(200).json({ message: 'Seats reserved successfully' });
    } catch (error) {
        console.error('Error reserving seats:', error); // Log the error for debugging
        if (error.name === 'SequelizeValidationError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({ error: 'Validation errors', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to reserve seats', details: error.message });
    }
});


module.exports = router;
