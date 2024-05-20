// models/Genre.js
const { DataTypes, Sequelize} = require('sequelize');
const sequelize = new Sequelize('courseProj', 'postgres', 'SuperSasha2101', {
    host: 'localhost',
    dialect: 'postgres'
});

const Genre = sequelize.define('GENRES', {
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
}, {
    tableName:"GENRES",
    timestamps: false,
});
sequelize.sync();
module.exports = Genre;
