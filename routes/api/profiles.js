const express = require("express");
const router = express.Router();
const { User } = require("../../sequelize");

//To retrieve the profile for a particular user with given username
router.get('/profiles/:username', (req,res,next)=>{
    User.findOne({
        where:{
            username: req.params.username
        }
    })
    .then((result)=>{
        if(!result){
            return res.status(404).json({
                error: "user not found with this username"
            })
        }
        next(result)
    })
})

router.use((result, req, res, next) => {
    res.status(200).json({
        profile :{
        username: result.username,
        bio: result.bio,
        image: result.image
    }});
})

module.exports = router;