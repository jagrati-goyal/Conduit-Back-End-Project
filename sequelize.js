const Sequelize = require('sequelize');
const { user } = require('./models/User');
const { article } = require('./models/Article');
const { comment } = require('./models/Comment');
const { tag } = require('./models/Tag');

const connection = new Sequelize({
    dialect: 'sqlite',
    storage: __dirname + '/store.db'
})

const User = connection.define('user', user);
const Article = connection.define('article',article);
const Comment =  connection.define('comment',comment);
const Tag = connection.define('tag',tag);
const TagArticle = connection.define('tagArticle');

Article.belongsTo(User, {as: 'author' , foreignKey: 'userId'});
Article.hasMany(Comment, {as: 'comments'}, {onDelete: 'CASCADE'});
Comment.belongsTo(User, {as: 'author', foreignKey: 'userId'});
Comment.belongsTo(Article, {as: 'article', foreignKey: 'articleId'});

//Creates a TagArticle table with IDs of tagId and articleId
Tag.belongsToMany(Article, { as: 'article', through : TagArticle});
Article.belongsToMany(Tag, { as: 'tagList', through : TagArticle});

module.exports = {
  User,
  connection,
  Article,
  Comment,
  Tag
}