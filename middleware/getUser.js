const jwt = require('jsonwebtoken');
const JWT_SECRET = "HiThereThisShouldBeVerySecretive!";

const decodeToken = (req, res, next) => {
    authToken = req.header('auth-token');
    if (!authToken) {
        res.status(401).send({ error: "please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(authToken, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "please authenticate using a valid token", message: error });
    }
}

module.exports = decodeToken;