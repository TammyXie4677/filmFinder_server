const express = require('express');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const router = express.Router();

// Get all showtimes
router.get('/', async (_, res) => {
    try {
        const showtimes = await Showtime.findAll({ include: Movie });
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get showtimes for a specific movie
router.get('/movie/:movieId', async (req, res) => {
    const { movieId } = req.params;
    try {
        const showtimes = await Showtime.findAll({
            where: { movie_id: movieId },
            include: Movie,
        });
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new showtime
router.post('/', async (req, res) => {
    const { movie_id, start_time, price, seat_availability } = req.body;

    try {
        const newShowtime = await Showtime.create({
            movie_id,
            start_time,
            price,
            seat_availability,
        });
        res.status(201).json(newShowtime);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a showtime by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { start_time, price, seat_availability } = req.body;

    try {
        const showtime = await Showtime.findByPk(id);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        const updatedShowtime = await showtime.update({
            start_time,
            price,
            seat_availability,
        });
        res.json(updatedShowtime);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a showtime by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const showtime = await Showtime.findByPk(id);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        await showtime.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
