const express = require('express');
const router = express.Router();
const { Movies } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

router.get('/', async (req, res) => {
    const listOfMovies = await Movies.findAll();
    res.json(listOfMovies);
});

router.get('/byId/:id', async (req, res) => {
    const id = req.params.id;
    const movie = await Movies.findByPk(id);
    res.json(movie);
});

router.post('/', validateToken, async (req, res) => {
    const movie = req.body;
    await Movies.create(movie);
    res.json(movie);
});

router.delete('/:movieId', validateToken, async (req, res) => {
    const movieId = req.params.movieId;
    await Movies.destroy({
        where: {
            movieId: movieId
        }
    });
    res.json("DELETED SUCCESSFULLY");
});

module.exports = router;
