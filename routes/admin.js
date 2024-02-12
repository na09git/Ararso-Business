const express = require('express')
const passport = require('passport')
const { ensureAdmin } = require('../middleware/auth')
const router = express.Router()

const User = require('../models/User')


// @route   GET /home
router.get('/admin', ensureAdmin, (req, res) => {
  try {
    const user = req.user;

    res.render('admin', {
      layout: false,
      user: req.user, // Pass the user to the template
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



module.exports = router