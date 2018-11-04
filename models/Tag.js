const Sequelize = require("sequelize");

module.exports = {
    tag: {
        title: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        }
    }
}