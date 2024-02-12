const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest, ensureAdmin, ensureAdminOrWorker } = require('../middleware/auth')

const User = require('../models/User')

const Story = require('../models/Story')
const News = require('../models/News')
const Sell = require('../models/Sell')
const Buy = require('../models/Buy')
const Worker = require('../models/Worker')



// @desc    Login/Landing page
// @route   GET /login
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})


// @desc    home
// @route   GET /home
router.get('/', ensureAuth, async (req, res) => {
  try {
    res.render('home', {
      name: req.user.firstName,
      image: req.user.image,
    })
    console.log("You are in / Page !");
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    home
// @route   GET /home
router.get('/home', ensureAuth, async (req, res) => {
  try {
    res.render('home', {
      name: req.user.firstName,
      image: req.user.image,
    })
    console.log("You are in /home Page !");
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    admin
// @route   GET /admin
router.get('/admin', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    res.render('admin', {
      layout: 'admin',
      name: req.user.firstName,
      lastname: req.user.lastName,
      image: req.user.image,
    })
    console.log("You are in /Admin Page !");
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    homeworker
// @route   GET /homeworker
router.get('/homeworker', ensureAuth, ensureAdminOrWorker, async (req, res) => {
  try {
    res.render('homeworker', {
      layout: 'homeworker',
      name: req.user.firstName,
      image: req.user.image,
    })
    console.log("You are in /homeWorker Page !");
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    stories
// @route   GET /stories
router.get('/stories', ensureAuth, async (req, res) => {
  try {
    const story = await Story.find({ user: req.user.id }).lean()
    res.render('stories', {
      name: req.user.firstName,
      image: req.user.image,
      story,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    News
// @route   GET /news
router.get('/newspage', ensureAuth, async (req, res) => {
  try {
    const news = await News.find({ user: req.user.id }).lean()
    res.render('newspage', {
      layout: 'admin',
      name: req.user.firstName,
      image: req.user.image,
      news,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    sell
// @route   GET /sell
router.get('/sells', ensureAuth, ensureAdminOrWorker, async (req, res) => {
  try {
    const sell = await Sell.find({ user: req.user.id }).lean()
    res.render('sells', {
      layout: 'admin',
      name: req.user.firstName,
      image: req.user.image,
      sell,
    })
    console.log("Dear Admin, You can see all Sell here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    Worker
// @route   GET /worker
router.get('/workers', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    const worker = await Worker.find({ user: req.user.id }).lean()
    res.render('workers', {
      layout: 'admin',
      name: req.user.firstName,
      image: req.user.image,
      worker,
    })
    console.log("Dear Admin, You can see all Worker here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    bought
// @route   GET /bought
router.get('/bought', ensureAuth, ensureAdminOrWorker, async (req, res) => {
  try {
    const buy = await Buy.find({ user: req.user.id })
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();

    res.render('bought', {
      layout: 'admin',
      name: req.user.firstName,
      image: req.user.image,
      buy,
    })
    console.log("Dear Admin, You can see all Buy here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



// @desc    profile
// @route   GET /profile
router.get('/profile', ensureAuth, ensureAdminOrWorker, async (req, res) => {
  try {
    res.render('profile', {
      layout: 'admin',
      name: req.user.firstName,
      image: req.user.image,
    })
    console.log("Dear Admin, You can see all Buy here in this Page !")
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router