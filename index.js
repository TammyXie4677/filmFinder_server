require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./sequelize');
const authRoutes = require('./routes/auth');
const User = require('./models/User');


const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(cors({
    origin: 'https://filmfinder-app-0f7b7b303a13.herokuapp.com', 
}));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

const moviesRouter = require('./routes/movies');
app.use('/movies', moviesRouter);

connectDB().then(async () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

