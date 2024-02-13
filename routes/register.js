const express = require('express')
const passport = require('passport')
const router = express.Router()

// @route   GET /register
router.get('/', (req, res) => {
    try {
        res.render('register/index', {
            layout: 'admin',
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router