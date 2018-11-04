const express = require("express");
const router = express.Router();
const {
    Article
} = require("../../sequelize");
const {
    User
} = require("../../sequelize");
const {
    Tag
} = require("../../sequelize")
const {
    Comment
} = require("../../sequelize");
const verifyToken = require('../verifyToken');

//To create an article
router.post('/articles/', verifyToken, (req, res, next) => {

    User.findByPk(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: "No user found"
                })
            }

            Article.create({
                    title: req.body.article.title,
                    description: req.body.article.description,
                    body: req.body.article.body,
                    slug: req.body.article.title + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36),
                    userId: req.userId
                })
                .then((article) => {
                    if (req.body.article.tagList) {
                        for (let i = 0; i < req.body.article.tagList.length; i++) {
                            Tag.findOne({
                                where: {
                                    title: req.body.article.tagList[i]
                                }
                            }).then((tag) => {
                                if (!tag) {
                                    Tag.create({
                                        title: req.body.article.tagList[i]
                                    }).then((tag) => {
                                        article.addTag(tag.id);
                                    })
                                } else {
                                    article.addTag(tag.id);
                                }
                            })
                        }
                    }
                    return res.status(201).json({
                        article: {
                            slug: article.slug,
                            title: article.title,
                            description: article.description,
                            body: article.body,
                            createdAt: article.createdAt,
                            updatedAt: article.updatedAt,
                            author: {
                                username: user.username,
                                bio: user.bio,
                                image: user.image
                            }
                        }
                    })
                })
        })
})

//To update an article
router.put('/articles/:slug', verifyToken, (req, res, next) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: "No user found"
                })
            }
            Article.findOne({
                    where: {
                        slug: req.params.slug
                    },
                    attributes: {
                        exclude: 'userId'
                    }
                })
                .then((article) => {
                    if (!article) {
                        return res.status(404).json({
                            error: "No article found"
                        })
                    }
                    if (article.title !== req.body.article.title) {
                        article.title = req.body.article.title;
                        article.slug = req.body.article.title + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
                    }
                    if (article.description !== req.body.article.description) {
                        article.description = req.body.article.description;
                    }
                    if (article.body !== req.body.article.body) {
                        article.body = req.body.article.body;
                    }
                    return article.save().then((article) => {
                        res.status(201).json({
                            article: {
                                slug: article.slug,
                                title: article.title,
                                description: article.description,
                                body: article.body,
                                createdAt: article.createdAt,
                                updatedAt: article.updatedAt,
                                author: {
                                    username: user.username,
                                    bio: user.bio,
                                    image: user.image
                                }
                            }
                        })
                    })
                })
        })
})

//Retrieve articles
router.get('/articles', (req, res, next) => {
    let limit = 10;
    let offset = 0;

    //Articles filter by limit/offset/author
    if (req.query.limit || req.query.offset || req.query.author) {
        if (req.query.author) {
            limit = req.query.limit || limit;
            offset = req.query.offset || offset;
            Article.findAll({
                    include: [{
                        model: User,
                        as: 'author',
                        attributes: ['username', 'bio', 'image'],
                        where: {
                            username: req.query.author
                        }
                    }],
                    limit: limit,
                    offset: offset,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                })
                .then((result) => {
                    res.status(200).json({
                        articles: result,
                        articlesCount: result.length
                    });
                })
        } else {
            limit = req.query.limit || limit;
            offset = req.query.offset || offset;
            Article.findAll({
                    include: [{
                        model: User,
                        as: 'author',
                        attributes: ['username', 'bio', 'image']
                    }],
                    limit: limit,
                    offset: offset,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                })
                .then((result) => {
                    res.status(200).json({
                        articles: result,
                        articlesCount: result.length
                    });
                })
        }
    } else {
        Article.findAll({
                include: [{
                        model: User,
                        as: 'author',
                        attributes: ["username", "bio", "image"]
                    },
                    {
                        model: Tag,
                        as: 'tagList',
                        attributes: ['title']
                    }
                ],
                attributes: {
                    exclude: ['id', 'userId']
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            })
            .then((result) => {
                res.status(200).json({
                    articles: result,
                    articlesCount: result.length
                });
            })
            .catch((error) => {
                res.status(500).send(error);
            })
    }
})

//To get a single article
router.get('/articles/:slug', (req, res, next) => {
    Article.findOne({
            include: [{
                model: User,
                as: 'author',
                attributes: ['username', 'bio', 'image']
            }],
            attributes: {
                exclude: 'userId'
            },
            where: {
                slug: req.params.slug
            }
        })
        .then((result) => {
            if (result != null) {
                res.status(201).json({
                    article: {
                        slug: result.slug,
                        title: result.title,
                        description: result.description,
                        body: result.body,
                        createdAt: result.createdAt,
                        updatedAt: result.updatedAt,
                        author: {
                            username: result.author.username,
                            bio: result.author.bio,
                            image: result.author.image,
                        }
                    }
                })
            } else {
                res.status(404).json({
                    error: "article not found with this slug"
                })
            }
        })
})

//To delete an article
router.delete('/articles/:slug', verifyToken, (req, res, next) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: "No user found"
                })
            }
            Article.findOne({
                    where: {
                        slug: req.params.slug
                    }
                })
                .then((article) => {
                    if (article.userId != req.userId) {
                        return res.status(403).json({
                            error: "Not authorized to delete"
                        })
                    }
                    article.destroy()
                        .then(() => {
                            res.status(204).json({
                                message: "Article Deleted successfully"
                            })
                        })
                })
        })
})

//To add comments to an article
router.post('/articles/:slug/comments', verifyToken, (req, res, next) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: "No user found"
                })
            }
            Article.findOne({
                    where: {
                        slug: req.params.slug
                    }
                })
                .then((article) => {
                    Comment.create({
                            body: req.body.comment.body,
                            userId: req.userId,
                            articleId: article.id
                        })
                        .then((comment) => {
                            return res.status(201).json({
                                comment: {
                                    id: comment.id,
                                    createdAt: comment.createdAt,
                                    updatedAt: comment.updatedAt,
                                    body: comment.body,
                                    author: {
                                        username: user.username,
                                        bio: user.bio,
                                        image: user.image
                                    }
                                }
                            })
                        })
                        .catch((error) => {
                            return res.status(500).json({
                                error: "Comment cannot be created"
                            })
                        })
                })

        })
})

//To get comments from an article
router.get('/articles/:slug/comments', verifyToken, (req, res, next) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: "No user found"
                })
            }
            Article.findOne({
                    where: {
                        slug: req.params.slug
                    },
                    include: [{
                        model: Comment,
                        as: 'comments',
                        attributes: {
                            exclude: ['userId', 'articleId']
                        },
                        include: {
                            model: User,
                            as: 'author',
                            attributes: ['username', 'bio', 'image'],
                        }
                    }]
                })
                .then((article) => {
                    res.status(200).json({
                        comments: article.comments
                    });
                })
                .catch((error) => {
                    res.status(404).json({
                        error: "No comments found"
                    })
                })
        })
})

//To delete comment from an article
router.delete('/articles/:slug/comments/:id', verifyToken, (req, res, next) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json("No user found");
            }
            Article.findOne({
                    where: {
                        slug: req.params.slug
                    }
                })
                .then((article) => {
                    Comment.findById(req.params.id)
                        .then((comment) => {
                            if (comment.userId !== req.userId) {
                                return res.status(403).json({
                                    error: "User is not authorized to delete this comment"
                                })
                            }
                            comment.destroy()
                                .then(() => {
                                    res.status(200).json({
                                        message: "Comment deleted successfully"
                                    })
                                })
                        })
                        .catch((error) => {
                            res.status(404).json({
                                error: "No comment found"
                            })
                        })
                })
        })
})

module.exports = router;