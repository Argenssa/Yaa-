// models/TrackFile.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize('courseProj', 'postgres', 'SuperSasha2101', {
    host: 'localhost',
    dialect: 'postgres'
});

const TrackFile = sequelize.define('TRACK_FILES', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    TRACK_WAY: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
    TRACK_IMG: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
}, {
    tableName: "TRACK_FILES",
    timestamps: false,
});
sequelize.sync(); // Подключение к базе данных и синхронизация модели с таблицей
module.exports = TrackFile;
