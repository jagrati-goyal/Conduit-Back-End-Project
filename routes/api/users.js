const express = require("express");
const router = express.Router();
const {
    User
} = require("../../sequelize");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const verifyToken = require("../verifyToken")

//Create a new user
router.post('/users', (req, res) => {

    if (!req.body.user.email) {
        return res.status(422).json({
            errors: {
                email: "can't be blank"
            }
        })
    }

    if (!req.body.user.password) {
        return res.status(422).json({
            errors: {
                password: "can't be blank"
            }
        })
    }

    if (!req.body.user.username) {
        return res.status(422).json({
            errors: {
                username: "can't be blank"
            }
        })
    }

    const randomNum = crypto.randomBytes(16).toString('hex');
    User.create({
            username: req.body.user.username,
            email: req.body.user.email,
            salt: randomNum,
            hash: crypto.pbkdf2Sync(req.body.user.password, randomNum, 10000, 512, 'sha512').toString('hex')
        })
        .then((user) => {
            const token = jwt.sign({
                id: user.id
            }, 'secret', {
                expiresIn: 7 * 24 * 60 * 60
            });
            User.update({
                    token: token
                }, {
                    where: {
                        id: user.id
                    }
                })
                .then(() => {
                    res.status(201).json({
                        user: {
                            email: user.email,
                            token: token,
                            username: user.username,
                            bio: user.bio,
                            image: user.image
                        }
                    })
                })

        })
        .catch((error) => {
            return res.status(400).json({
                error: error.errors[0].message
            })
        })

})

//For logging in a user
router.post('/users/login', (req, res) => {
    if (!req.body.user.email) {
        return res.status(422).json({
            errors: {
                email: "can't be blank"
            }
        })
    }

    if (!req.body.user.password) {
        return res.status(422).json({
            errors: {
                password: "can't be blank"
            }
        })
    }

    if (req.body.user.email) {
        User.findOne({
                where: {
                    email: req.body.user.email
                },

            })
            .then((result) => {
                if (result == null) {
                    return res.status(404).json({
                        error: "User not found"
                    })
                } else {
                    const salt = result.salt;
                    const hashprev = result.hash;
                    const hash = crypto.pbkdf2Sync(req.body.user.password, salt, 10000, 512, 'sha512').toString('hex');
                    //User is authenticated
                    if (hashprev == hash) {
                        res.status(200).json({
                            user: {
                                email: result.email,
                                token: result.token,
                                username: result.username,
                                bio: result.bio,
                                image: result.image
                            }
                        })
                    }
                    //User is not authenticated
                    else {
                        res.status(401).json({
                            errors: {
                                password: "doesn't match"
                            },
                            token: null
                        })
                    }
                }
            })
            .catch(() => {
                res.status(500).json({
                    error: "Cannot access database"
                })
            })
    }
})

//For updating a user
router.put('/user', verifyToken, (req, res, next) => {

    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: "No user found"
                })
            }

            if (req.body.user.username) {
                user.username = req.body.user.username;
            }

            if (req.body.user.email) {
                user.email = req.body.user.email;
            }

            if (req.body.user.bio) {
                user.bio = req.body.user.bio;
            }

            if (req.body.user.image) {
                user.image = req.body.user.image;
            }

            if (req.body.user.password) {
                const hashnew = crypto.pbkdf2Sync(req.body.user.password, user.salt, 10000, 512, 'sha512').toString('hex');
                user.hash = hashnew;
            }

            return user.save()
                .then((user) => {
                    next(user);
                })
        })
        .catch(() => {
            res.status(500).json({
                error: "Cannot access database"
            })
        })
})

//To  retrieve current user
router.get('/user', verifyToken, (req, res, next) => {
    User.findByPk(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: "No user found"
                })
            }
            next(user);
        })
})

//Middleware to return a user information
router.use((user, req, res, next) => {
    res.status(200).json({
        user: {
            username: user.username,
            email: user.email,
            token: user.token,
            bio: user.bio,
            image: user.image
        }
    });
})

module.exports = router;