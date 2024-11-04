const { sequelize } = require('../sequelize');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking'); 

const seedMovies = async () => {
    try {
        // Drop dependent tables in the correct order
        await Booking.drop(); // Drop bookings table first
        await Seat.drop(); // Then drop the seats table
        await Showtime.drop(); // Then drop the showtimes table

        // Finally drop the movies table
        await sequelize.sync({ force: true }); // This will drop and recreate all tables

        const movies = [
            {
                title: "Inception",
                description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
                genre: "Action",
                release_date: new Date("2010-07-16"),
                duration: 148,
                cover_image: "path/to/inception.jpg",
            },
            {
                title: "The Dark Knight",
                description: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
                genre: "Action",
                release_date: new Date("2008-07-18"),
                duration: 152,
                cover_image: "path/to/dark_knight.jpg",
            },
            {
                title: "Forrest Gump",
                description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold through the perspective of an Alabama man with an IQ of 75.",
                genre: "Drama",
                release_date: new Date("1994-07-06"),
                duration: 142,
                cover_image: "path/to/forrest_gump.jpg",
            },
            {
                title: "The Matrix",
                description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
                genre: "Action",
                release_date: new Date("1999-03-31"),
                duration: 136,
                cover_image: "path/to/matrix.jpg",
            },
            {
                title: "The Shawshank Redemption",
                description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                genre: "Drama",
                release_date: new Date("1994-09-23"),
                duration: 142,
                cover_image: "path/to/shawshank_redemption.jpg",
            },
            {
                title: "Pulp Fiction",
                description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                genre: "Drama",
                release_date: new Date("1994-10-14"),
                duration: 154,
                cover_image: "path/to/pulp_fiction.jpg",
            },
            {
                title: "The Godfather",
                description: "An organized crime dynasty's aging patriarch transfers control of his clandestine empire to his reluctant son.",
                genre: "Drama",
                release_date: new Date("1972-03-24"),
                duration: 175,
                cover_image: "path/to/godfather.jpg",
            },
            {
                title: "The Lord of the Rings: The Return of the King",
                description: "Gandalf and Aragorn lead the World of Men against Sauron's army to save Middle-earth.",
                genre: "Action",
                release_date: new Date("2003-12-17"),
                duration: 201,
                cover_image: "path/to/lotr_return_of_the_king.jpg",
            },
            {
                title: "Fight Club",
                description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
                genre: "Drama",
                release_date: new Date("1999-10-15"),
                duration: 139,
                cover_image: "path/to/fight_club.jpg",
            },
            {
                title: "Interstellar",
                description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                genre: "Drama",
                release_date: new Date("2014-11-07"),
                duration: 169,
                cover_image: "path/to/interstellar.jpg",
            },
            {
                title: "Gladiator",
                description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
                genre: "Action",
                release_date: new Date("2000-05-05"),
                duration: 155,
                cover_image: "path/to/gladiator.jpg",
            },
            {
                title: "The Notebook",
                description: "A poor young man and a wealthy young woman fall in love during the early years of World War II.",
                genre: "Romance",
                release_date: new Date("2004-06-25"),
                duration: 123,
                cover_image: "path/to/notebook.jpg",
            },
            {
                title: "Get Out",
                description: "A young African-American man visits his white girlfriend's family estate, where he becomes ensnared in a more sinister real estate.",
                genre: "Horror",
                release_date: new Date("2017-02-24"),
                duration: 104,
                cover_image: "path/to/get_out.jpg",
            },
            {
                title: "Crazy, Stupid, Love.",
                description: "A man learns to navigate the dating scene after his wife asks for a divorce.",
                genre: "Comedy",
                release_date: new Date("2011-07-29"),
                duration: 118,
                cover_image: "path/to/crazy_stupid_love.jpg",
            },
        ];

        await Movie.bulkCreate(movies);
        console.log("Movies seeded successfully!");
    } catch (error) {
        console.error("Error seeding movies:", error);
    } finally {
        await sequelize.close(); // Close the database connection
    }
};

seedMovies();
