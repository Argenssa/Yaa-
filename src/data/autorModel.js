// models/Autor.js
const { DataTypes, Sequelize} = require('sequelize');
const sequelize = new Sequelize('courseProj', 'postgres', 'SuperSasha2101', {
    host: 'localhost',
    dialect: 'postgres'
});

const Autor = sequelize.define('AUTORS', {
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
    tableName: "AUTORS",
    timestamps: false,
});
sequelize.sync();
module.exports = Autor;
