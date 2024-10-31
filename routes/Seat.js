// routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const { Seat } = require('../models/Seat');

// Fetch seats for a specific showtime
router.get('/showtime/:showtimeId', async (req, res) => {
    try {
        const { showtimeId } = req.params;
        const seats = await Seat.findAll({ where: { showtime_id: showtimeId } });
        res.json(seats);
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ message: 'Server error while fetching seats' });
    }
});


// Reserve selected seats
router.post('/reserve', async (req, res) => {
    const { seatIds } = req.body; // Array of seat IDs to reserve
    try {
        await Seat.update(
            { isOccupied: true },
            { where: { id: seatIds } }
        );
        res.status(200).json({ message: 'Seats reserved successfully' });
    } catch (error) {
        console.error('Error reserving seats:', error);
        res.status(500).json({ message: 'Server error while reserving seats' });
    }
});

// Endpoint to initialize seats for a specific showtime
router.post('/initialize/:showtimeId', async (req, res) => {
    const { showtime_id: showtimeId } = req.params;
    const { rows = 5, columns = 10 } = req.body; // Default to 5 rows x 10 columns if not specified

    try {
        // Check if showtime exists
        const showtime = await Showtime.findByPk(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Generate and create seat data
        const seats = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 1; col <= columns; col++) {
                seats.push({
                    row: String.fromCharCode(65 + row), // A, B, C, etc. for row letters
                    column: col,
                    isOccupied: false,
                    showtimeId,
                });
            }
        }

        await Seat.bulkCreate(seats);
        res.status(200).json({ message: `Initialized ${seats.length} seats for showtime ID ${showtimeId}` });
    } catch (error) {
        console.error('Error initializing seats:', error);
        res.status(500).json({ message: 'Server error while initializing seats' });
    }
});

module.exports = router;
