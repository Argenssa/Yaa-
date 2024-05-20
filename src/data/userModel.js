// models/index.js
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('courseProj', 'postgres', 'SuperSasha2101', {
    host: 'localhost',
    dialect: 'postgres'
});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});
sequelize.sync();
module.exports = { User, sequelize };
