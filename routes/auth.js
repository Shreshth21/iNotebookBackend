const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const decodeToken = require('../middleware/getUser')
const router = express.Router();

const JWT_SECRET = "HiThereThisShouldBeVerySecretive!";


//ROUTE-1: to create a new user
router.post("/createuser", [
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ success, errors: error.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "sorry the user already exists" });
        }
        const salt = bcrypt.genSaltSync(10);
        const securePwd = bcrypt.hashSync(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: securePwd,
            email: req.body.email
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({ success, authToken });
    } catch (err) {
        console.log(err);
        res.status(500).send("some error occured: " + err.message);
    }
});



//ROUTE-2: to login
router.post("/login", [
    body('password', "password cannot be empty").exists(),
    body('email', "enter a valid email").isEmail()
], async (req, res) => {

    let success = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ success, errors: error.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            success = false;
            return res.status(400).json({ success, error: "user does not exist" });
        }
        passwordCompare = await bcrypt.compare(req.body.password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "enter correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error" + err.message);
    }
});

//ROUTE-3: to get the user from jwt token
router.post("/getuser", decodeToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server error" + error.message);
    }
});


module.exports = router;