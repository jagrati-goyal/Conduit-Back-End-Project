const Sequelize = require("sequelize");

module.exports = {
    article: {
        title: Sequelize.STRING,
        slug:{
            type: Sequelize.STRING,
            unique: true
        },
        description: Sequelize.STRING,
        body: Sequelize.STRING
    }
}