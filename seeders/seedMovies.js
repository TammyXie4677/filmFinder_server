const { sequelize } = require('../sequelize');
const Movie = require('../models/Movie');

const seedMovies = async () => {
    try {
        await sequelize.sync({ force: true }); // This will drop the table if it exists and recreate it

        const movies = [
            {
                title: "Inception",
                description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
                genre: "Science Fiction",
                release_date: new Date("2010-07-16"),
                duration: 148,
                cover_image: "path/to/inception.jpg", // Replace with actual image path if available
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
                genre: "Science Fiction",
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
