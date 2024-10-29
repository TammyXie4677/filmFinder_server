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
    origin: 'http://localhost:3000',
}));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

//movie router
const movieRouter = require('./routes/Movie');
app.use('/movie', movieRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

