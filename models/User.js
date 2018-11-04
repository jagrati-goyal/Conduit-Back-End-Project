const Sequelize = require("sequelize");

module.exports = {
    user: {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        },
        unique: true,
        allowNull: false
    },
    bio: Sequelize.STRING,
    image: Sequelize.STRING,
    hash: Sequelize.STRING,
    salt: Sequelize.STRING,
    token : Sequelize.STRING
}
}
