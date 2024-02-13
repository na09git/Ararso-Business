const express = require('express')
const passport = require('passport')
const router = express.Router()

const User = require('../models/User')

// @route   GET /profile
router.get('/', (req, res) => {
    try {
        res.render('profile/index', {
            layout: 'admin',
            name: req.user.firstName,
            image: req.user.image,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router