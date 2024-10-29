module.exports = (sequelize, DataTypes) => {
    const Movies = sequelize.define('Movies', {
        movieId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        genre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        releaseDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        coverImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    return Movies;
};
