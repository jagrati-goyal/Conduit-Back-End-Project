const jwt = require('jsonwebtoken');

function verifyToken(req,res,next){
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({
            error : "No token provided"
        })
    }
    jwt.verify(token, 'secret', (err, decoded) => {
        if(err) {
            return res.status(500).json({
                error : "Failed to authenticate token"
            })
        }
        req.userId = decoded.id;
        next();
    })
}

module.exports = verifyToken;