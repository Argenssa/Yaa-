// models/MainTrack.js
const { DataTypes, Sequelize} = require('sequelize');
const sequelize = new Sequelize('courseProj', 'postgres', 'SuperSasha2101', {
    host: 'localhost',
    dialect: 'postgres'
});

const Track = require('./trackModel');
const Autor = require('./autorModel');

const MainTrack = sequelize.define('MAINTRACK', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    trackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'TRACK_ID',
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'AUTOR_ID',
    },
}, {
    tableName: "MAINTRACK",
    timestamps: false,
});
sequelize.sync();
MainTrack.belongsTo(Track, { foreignKey: 'trackId' });
MainTrack.belongsTo(Autor, { foreignKey: 'authorId' });

module.exports = MainTrack;
