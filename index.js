require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./sequelize');
const authRoutes = require('./routes/auth');
const movieRouter = require('./routes/Movie');
const showtimeRouter = require('./routes/Showtime');
const seatsRouter = require('./routes/Seat');
const app = express();

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use(bodyParser.json());


// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/movie', movieRouter); // Movie routes
app.use('/uploads', express.static('public/uploads'));
app.use('/showtime', showtimeRouter);
app.use('/seats', seatsRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
