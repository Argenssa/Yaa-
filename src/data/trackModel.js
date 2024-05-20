// models/Track.js
const { DataTypes, Sequelize} = require('sequelize');
const sequelize = new Sequelize('courseProj', 'postgres', 'SuperSasha2101', {
    host: 'localhost',
    dialect: 'postgres'
});

const Genre = require('./genreModel');
const TrackFile = require('./trackFilesModel');

const Track = sequelize.define('TRACKS', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    genreId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'GENRE_ID',
    },
    trackFileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'TRACK_FILE_ID',
    },
}, {
    tableName: "TRACKS",
    timestamps: false,
});

Track.belongsTo(Genre, { foreignKey: 'genreId' });
Track.belongsTo(TrackFile, { foreignKey: 'trackFileId' });
sequelize.sync();
module.exports = Track;
